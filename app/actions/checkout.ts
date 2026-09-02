'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getEmployee } from '@/lib/get-employee'
import { resolveProductPricing } from '@/lib/products'
import { vatRateFor, unitFor } from '@/lib/order-item-vat'
import { getCoffeePricing } from '@/lib/coffee-pricing'
import { createHostedCheckout } from '@/lib/cawl'
import { SITE_URL } from '@/lib/emails/shared'
import { KAWA_OFFICE } from '@/app/admin/demo-data'
import { mintOrderNumber } from '@/lib/document-storage'

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
  // Atomic, gapless, NEVER-reused sequence (migrations 0046/0047) — this
  // used to be a live count(*) of existing orders, which recycled numbers
  // whenever an order got deleted (a declined payment, a test cleanup).
  // That's fatal here: order_number is sent to CAWL as merchantReference,
  // and CAWL rejects a hostedcheckout creation outright if that reference
  // was ever used before, even by a since-deleted order. Uses a dedicated
  // RPC (next_order_number, not next_document_number) since this runs
  // under the employee's own session, not staff — see lib/document-storage.ts.
  let orderNumber: string
  try {
    orderNumber = await mintOrderNumber(supabase, year)
  } catch (error) {
    console.error('[placeOrderAction] failed to mint order number:', error)
    return { error: 'Une erreur est survenue, merci de réessayer.' }
  }

  // Staged, not a real order yet (migration 0048) — no row in `orders`
  // exists until the webhook sees payment.captured. If the payment is
  // declined/abandoned, this reservation is just deleted and the cart is
  // exactly as the employee left it, nothing to undo.
  const { error: insertError } = await supabase.from('pending_checkouts').insert({
    order_number: orderNumber,
    profile_id: user.id,
    organization_id: profile.organization_id,
    employee_name: profile.full_name ?? user.email ?? '',
    employee_email: user.email ?? '',
    billing_address: billingAddress,
    delivery_mode: deliveryMode,
    address,
    amount,
    items,
  })

  if (insertError) {
    console.error('[placeOrderAction] pending checkout insert failed:', insertError)
    return { error: 'Une erreur est survenue, merci de réessayer.' }
  }

  let redirectUrl: string
  try {
    const checkout = await createHostedCheckout({
      amount,
      orderNumber,
      returnUrl: `${SITE_URL}/compte/panier/retour`,
    })
    redirectUrl = checkout.redirectUrl
  } catch (error) {
    console.error('[placeOrderAction] CAWL checkout creation failed:', error)
    await supabase.from('pending_checkouts').delete().eq('order_number', orderNumber)
    return {
      error:
        "Le paiement n'a pas pu être initialisé, merci de réessayer ou de contacter KAWA.",
    }
  }

  // The cart is deliberately NOT cleared here — nothing has been bought
  // yet. It's cleared by the webhook once payment.captured actually
  // confirms the purchase (app/api/webhooks/cawl/route.ts), which is also
  // where the real `orders`/`order_items` rows get created from this
  // reservation for the first time.
  redirect(redirectUrl)
}
