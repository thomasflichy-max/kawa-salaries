'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isKawaStaffEmail, getStaffDisplayName } from '@/lib/is-kawa-staff'
import { computeOrderTotals, type DemoOrderItem } from '@/app/admin/demo-data'
import { getAdminOrderById, type ManualOrderPaymentMethod } from './manual-orders'
import { sendPaymentLinkEmail } from '@/lib/emails/payment-link'

const PAYMENT_METHODS: ManualOrderPaymentMethod[] = ['virement', 'lien_cb', 'boutique']

export type CreateManualOrderState =
  | { error: string; success?: false }
  | { success: true; error?: undefined }
  | undefined

function revalidateOrderPaths(orderId: string) {
  revalidatePath('/admin/commandes')
  revalidatePath(`/admin/commandes/${orderId}`)
}

export async function createManualOrderAction(
  _prevState: CreateManualOrderState,
  formData: FormData
): Promise<CreateManualOrderState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!isKawaStaffEmail(user?.email)) {
    return { error: 'Non autorisé.' }
  }

  const profileId = String(formData.get('profile_id') ?? '').trim()
  const organizationId = String(formData.get('organization_id') ?? '').trim()
  const deliveryMode = String(formData.get('delivery_mode') ?? '') === 'pickup' ? 'pickup' : 'delivery'
  const address = String(formData.get('address') ?? '').trim()
  const billingAddressInput = String(formData.get('billing_address') ?? '').trim()
  const paymentLink = String(formData.get('payment_link') ?? '').trim()
  const comment = String(formData.get('comment') ?? '').trim()
  const orderDateInput = String(formData.get('order_date') ?? '').trim()
  const paymentMethod = String(formData.get('payment_method') ?? '') as ManualOrderPaymentMethod

  if (!profileId || !organizationId) {
    return { error: 'Sélectionne une entreprise et un salarié.' }
  }
  if (!address) {
    return { error: "L'adresse de livraison est requise." }
  }
  if (!PAYMENT_METHODS.includes(paymentMethod)) {
    return { error: 'Mode de paiement invalide.' }
  }
  const orderDate = orderDateInput ? new Date(orderDateInput) : new Date()
  if (Number.isNaN(orderDate.getTime())) {
    return { error: 'Date de commande invalide.' }
  }

  // Never trust the employee's name/email/org from the client — re-derive
  // them from the selected profile, and confirm it really belongs to the
  // submitted organization (defense-in-depth, same pattern as
  // updateDefaultAddress in app/actions/auth.ts).
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, email, organization_id, billing_address')
    .eq('id', profileId)
    .maybeSingle()

  if (profileError || !profile || profile.organization_id !== organizationId) {
    return { error: 'Salarié invalide pour cette entreprise.' }
  }
  if (!profile.email) {
    return { error: "Ce salarié n'a pas d'email enregistré." }
  }

  const billingAddress = billingAddressInput || profile.billing_address || ''
  if (!billingAddress) {
    return { error: "L'adresse de facturation est requise." }
  }

  const productNames = formData.getAll('item_product_name').map((v) => String(v).trim())
  const quantities = formData.getAll('item_quantity').map((v) => Number(v))
  const unitPrices = formData.getAll('item_unit_price_ttc').map((v) => Number(v))
  const vatRates = formData.getAll('item_vat_rate').map((v) => Number(v))
  const units = formData.getAll('item_unit').map((v) => String(v))
  const imageUrls = formData.getAll('item_image_url').map((v) => String(v))

  const items: DemoOrderItem[] = productNames
    .map((productName, i) => ({
      id: `item-${i}`,
      productName,
      quantity: quantities[i],
      unitPriceTTC: unitPrices[i],
      vatRate: vatRates[i],
      unit: units[i] === 'Kg' ? ('Kg' as const) : ('unité' as const),
      imageUrl: imageUrls[i] || '/logo-kawa-nantes.png',
    }))
    .filter(
      (item) =>
        item.productName &&
        Number.isFinite(item.quantity) &&
        item.quantity > 0 &&
        Number.isFinite(item.unitPriceTTC) &&
        item.unitPriceTTC >= 0
    )

  if (items.length === 0) {
    return { error: 'Ajoute au moins un article.' }
  }

  const amount = computeOrderTotals(items).totalTTC
  const actor = getStaffDisplayName(user?.email)

  const year = new Date().getFullYear()
  const { count } = await supabase
    .from('manual_orders')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', `${year}-01-01`)
  const orderNumber = `CMD-M-${year}-${String((count ?? 0) + 1).padStart(4, '0')}`

  const { data: order, error: insertError } = await supabase
    .from('manual_orders')
    .insert({
      order_number: orderNumber,
      profile_id: profile.id,
      organization_id: organizationId,
      employee_name: profile.full_name ?? profile.email,
      employee_email: profile.email,
      billing_address: billingAddress,
      delivery_mode: deliveryMode,
      address,
      amount,
      payment_link: paymentLink || null,
      order_date: orderDate.toISOString(),
      comment: comment || null,
      payment_method: paymentMethod,
      // Paid in store happens at the counter, on the spot — everything else
      // starts unpaid until staff confirm the transfer/card payment landed.
      paid: paymentMethod === 'boutique',
      created_by: actor,
    })
    .select('id')
    .single()

  if (insertError || !order) {
    console.error('[createManualOrderAction] order insert failed:', insertError)
    return { error: 'Une erreur est survenue, merci de réessayer.' }
  }

  const { error: itemsError } = await supabase.from('manual_order_items').insert(
    items.map((item) => ({
      manual_order_id: order.id,
      product_name: item.productName,
      quantity: item.quantity,
      image_url: item.imageUrl,
      unit: item.unit,
      unit_price_ttc: item.unitPriceTTC,
      vat_rate: item.vatRate,
    }))
  )

  if (itemsError) {
    console.error('[createManualOrderAction] items insert failed:', itemsError)
    return { error: 'La commande a été créée mais l’enregistrement des articles a échoué.' }
  }

  revalidateOrderPaths(order.id)
  redirect(`/admin/commandes/${order.id}`)
}

export async function setManualOrderPaidAction(orderId: string, paid: boolean) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!isKawaStaffEmail(user?.email)) {
    throw new Error('Non autorisé.')
  }

  const { error } = await supabase.from('manual_orders').update({ paid }).eq('id', orderId)
  if (error) {
    console.error('[setManualOrderPaidAction] update failed:', error)
    throw new Error('Une erreur est survenue, merci de réessayer.')
  }
  revalidateOrderPaths(orderId)
}

export async function updateManualOrderPaymentLinkAction(orderId: string, paymentLink: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!isKawaStaffEmail(user?.email)) {
    throw new Error('Non autorisé.')
  }

  const { error } = await supabase
    .from('manual_orders')
    .update({ payment_link: paymentLink.trim() || null })
    .eq('id', orderId)
  if (error) {
    console.error('[updateManualOrderPaymentLinkAction] update failed:', error)
    throw new Error('Une erreur est survenue, merci de réessayer.')
  }
  revalidateOrderPaths(orderId)
}

export async function sendManualOrderPaymentLinkEmailAction(orderId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!isKawaStaffEmail(user?.email)) {
    throw new Error('Non autorisé.')
  }

  const order = await getAdminOrderById(orderId)
  if (!order || order.source !== 'manual' || !order.paymentLink) {
    throw new Error('Lien de paiement manquant.')
  }

  await sendPaymentLinkEmail(order)
}
