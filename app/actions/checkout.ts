'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getEmployee } from '@/lib/get-employee'
import { resolveProductPricing, vatRateFor, unitFor } from '@/lib/products'
import { getCoffeePricing } from '@/lib/coffee-pricing'
import { createHostedCheckout } from '@/lib/cawl'
import { SITE_URL } from '@/lib/emails/shared'
import { KAWA_OFFICE } from '@/app/admin/demo-data'

export type PlaceOrderState = { error: string } | undefined

const GRIND_LABELS: Record<string, string> = {
  grain: 'En grains',
  filtre: 'Moulu filtre',
  espresso: 'Moulu espresso',
}

export async function placeOrderAction(
  _prevState: PlaceOrderState,
  _formData: FormData
): Promise<PlaceOrderState> {
  // getEmployee() also re-checks the employee's organization is still
  // active (redirects out if not) — the same gate every other /compte/*
  // page goes through.
  const { user, profile, coffeeDiscounts, organizationAddresses } = await getEmployee()
  const supabase = await createClient()

  if (!profile?.organization_id) {
    return { error: 'Profil incomplet, merci de contacter KAWA.' }
  }
  const billingAddress = profile.billing_address?.trim()
  if (!billingAddress) {
    return {
      error:
        "Merci de renseigner votre adresse de facturation dans Mon Compte avant de payer.",
    }
  }

  const { data: cartRows, error: cartError } = await supabase
    .from('cart_items')
    .select(
      'id, quantity, grind_type, product:products(id, name, category, price, image_url, subcategory)'
    )
    .eq('user_id', user.id)
    .order('created_at')

  if (cartError) {
    console.error('[placeOrderAction] failed to load cart:', cartError)
    return { error: 'Une erreur est survenue, merci de réessayer.' }
  }
  if (!cartRows || cartRows.length === 0) {
    return { error: 'Votre panier est vide.' }
  }

  const pricingRules = await getCoffeePricing()
  const items = cartRows
    .filter((row) => row.product)
    .map((row) => {
      const product = row.product!
      const { price } = resolveProductPricing(product, pricingRules, coffeeDiscounts)
      const productName =
        product.category === 'cafe'
          ? `${product.name} — ${GRIND_LABELS[row.grind_type ?? 'grain'] ?? row.grind_type}`
          : product.name
      return {
        productName,
        quantity: row.quantity,
        imageUrl: product.image_url ?? '/logo-kawa-nantes.png',
        unit: unitFor(product.category),
        unitPriceTTC: price ?? 0,
        vatRate: vatRateFor(product.category),
      }
    })

  const amount = items.reduce((sum, item) => sum + item.unitPriceTTC * item.quantity, 0)
  if (!(amount > 0)) {
    return { error: 'Le montant de la commande est invalide.' }
  }

  const deliveryAddress = organizationAddresses.find((a) => a.id === profile.default_address_id)
  const deliveryMode = deliveryAddress ? 'delivery' : 'pickup'
  const address = deliveryAddress
    ? `${deliveryAddress.label} — ${deliveryAddress.address}`
    : `${KAWA_OFFICE.name} — ${KAWA_OFFICE.address}`

  const year = new Date().getFullYear()
  const { count } = await supabase
    .from('orders')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', `${year}-01-01`)
  const orderNumber = `CMD-${year}-${String((count ?? 0) + 1).padStart(4, '0')}`

  const { data: order, error: insertError } = await supabase
    .from('orders')
    .insert({
      order_number: orderNumber,
      profile_id: user.id,
      organization_id: profile.organization_id,
      employee_name: profile.full_name ?? user.email ?? '',
      employee_email: user.email ?? '',
      billing_address: billingAddress,
      delivery_mode: deliveryMode,
      address,
      amount,
    })
    .select('id')
    .single()

  if (insertError || !order) {
    console.error('[placeOrderAction] order insert failed:', insertError)
    return { error: 'Une erreur est survenue, merci de réessayer.' }
  }

  const { error: itemsError } = await supabase.from('order_items').insert(
    items.map((item) => ({
      order_id: order.id,
      product_name: item.productName,
      quantity: item.quantity,
      image_url: item.imageUrl,
      unit: item.unit,
      unit_price_ttc: item.unitPriceTTC,
      vat_rate: item.vatRate,
    }))
  )
  if (itemsError) {
    console.error('[placeOrderAction] items insert failed:', itemsError)
    return { error: 'Une erreur est survenue, merci de réessayer.' }
  }

  let redirectUrl: string
  try {
    const checkout = await createHostedCheckout({
      amount,
      orderNumber,
      returnUrl: `${SITE_URL}/compte/panier/retour?commande=${order.id}`,
    })
    redirectUrl = checkout.redirectUrl
    await supabase
      .from('orders')
      .update({ cawl_hosted_checkout_id: checkout.hostedCheckoutId })
      .eq('id', order.id)
  } catch (error) {
    console.error('[placeOrderAction] CAWL checkout creation failed:', error)
    return {
      error:
        "Le paiement n'a pas pu être initialisé, merci de réessayer ou de contacter KAWA.",
    }
  }

  // The order is created and the checkout session exists — clear the cart
  // now rather than waiting on the payment webhook, same convention as a
  // standard e-commerce "order placed" moment. If payment fails, the order
  // stays in payment_status='echoue' and staff can follow up manually
  // (same as any other unpaid order today).
  await supabase.from('cart_items').delete().eq('user_id', user.id)

  redirect(redirectUrl)
}
