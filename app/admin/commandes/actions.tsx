'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isKawaStaffEmail, getStaffDisplayName } from '@/lib/is-kawa-staff'
import {
  advanceDemoOrderStatus,
  setDemoOrderStatus,
  setDemoOrderPaid,
  updateDemoOrderBillingAddress,
  updateDemoOrderShippingAddress,
  addDemoOrderRefund,
  addDemoOrderItem,
  updateDemoOrderItemQuantity,
  removeDemoOrderItem,
  getDemoOrderById,
  getNextOrderStatus,
  getOrderRefundTotal,
  getOrderRefundStatus,
  DEMO_ORDER_STATUS_LABELS,
  type DemoOrder,
  type DemoOrderStatus,
  type DemoOrderItem,
} from '@/app/admin/demo-data'
import { getAdminOrderById } from './manual-orders'
import { archiveOrderInvoiceAndDeliveryNote, archiveRefundCertificate } from '@/lib/order-documents'
import { sendOrderReadyForPickupEmail } from '@/lib/emails/order-ready-for-pickup'
import { sendOrderRefundedEmail } from '@/lib/emails/order-refunded'

async function requireKawaStaffActor() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!isKawaStaffEmail(user?.email)) {
    throw new Error('Non autorisé.')
  }

  return getStaffDisplayName(user?.email)
}

function revalidateOrderPaths(orderId: string) {
  revalidatePath('/admin/commandes')
  revalidatePath(`/admin/commandes/${orderId}`)
  revalidatePath('/admin')
}

// Sets a real order's status directly to any value and records the change
// in order_status_history — the Supabase-backed equivalent of
// setDemoOrderStatus (app/admin/demo-data.ts), used once an orderId isn't
// found among DEMO_ORDERS (i.e. it's a checkout-created order in `orders`).
async function updateRealOrderStatus(orderId: string, status: DemoOrderStatus, actor: string) {
  const supabase = await createClient()
  const { data: current } = await supabase
    .from('orders')
    .select('status')
    .eq('id', orderId)
    .maybeSingle()
  if (!current || current.status === status) return null

  const { error } = await supabase.from('orders').update({ status }).eq('id', orderId)
  if (error) {
    console.error('[commandes] real order status update failed:', error)
    return null
  }
  await supabase.from('order_status_history').insert({
    order_id: orderId,
    actor,
    action: `Statut changé : ${DEMO_ORDER_STATUS_LABELS[current.status as DemoOrderStatus]} → ${DEMO_ORDER_STATUS_LABELS[status]}`,
  })
  return getAdminOrderById(orderId)
}

// Fires only the moment an order actually transitions into "prêt à l'envoi"
// (not on every no-op re-save of the same status) and only for pickup
// orders — delivery orders have nothing for the client to come collect.
async function notifyIfJustReadyForPickup(order: DemoOrder | null, wasReady: boolean) {
  if (!order || wasReady) return
  if (order.status !== 'pret' || order.deliveryMode !== 'pickup') return
  try {
    await sendOrderReadyForPickupEmail(order)
  } catch (error) {
    console.error('[commandes] ready-for-pickup email failed:', error)
  }
}

export async function advanceOrderStatusAction(orderId: string) {
  const actor = await requireKawaStaffActor()
  const demoOrder = getDemoOrderById(orderId)
  if (demoOrder) {
    const wasReady = demoOrder.status === 'pret'
    const order = advanceDemoOrderStatus(orderId, actor)
    await notifyIfJustReadyForPickup(order, wasReady)
    revalidateOrderPaths(orderId)
    return
  }

  const supabase = await createClient()
  const { data: current } = await supabase
    .from('orders')
    .select('status')
    .eq('id', orderId)
    .maybeSingle()
  if (!current) {
    revalidateOrderPaths(orderId)
    return
  }
  const wasReady = current.status === 'pret'
  const next = getNextOrderStatus(current.status as DemoOrderStatus)
  const order = next ? await updateRealOrderStatus(orderId, next, actor) : null
  await notifyIfJustReadyForPickup(order, wasReady)
  revalidateOrderPaths(orderId)
}

// Cancelling an order only ever changes its status — no refund, no email.
// Money only moves (and gets mailed about) when staff separately record a
// refund via refundOrderAction below.
export async function updateOrderStatusAction(orderId: string, status: DemoOrderStatus) {
  const actor = await requireKawaStaffActor()
  const demoOrder = getDemoOrderById(orderId)
  if (demoOrder) {
    const wasReady = demoOrder.status === 'pret'
    const order = setDemoOrderStatus(orderId, status, actor)
    await notifyIfJustReadyForPickup(order, wasReady)
    revalidateOrderPaths(orderId)
    return
  }

  const supabase = await createClient()
  const { data: current } = await supabase
    .from('orders')
    .select('status')
    .eq('id', orderId)
    .maybeSingle()
  const wasReady = current?.status === 'pret'
  const order = await updateRealOrderStatus(orderId, status, actor)
  await notifyIfJustReadyForPickup(order, wasReady ?? false)
  revalidateOrderPaths(orderId)
}

export async function setOrderPaidAction(orderId: string, paid: boolean) {
  const actor = await requireKawaStaffActor()
  const demoOrder = getDemoOrderById(orderId)
  if (demoOrder) {
    setDemoOrderPaid(orderId, paid, actor)
    revalidateOrderPaths(orderId)
    return
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('orders')
    .update({ paid, payment_status: paid ? 'paye' : 'en_attente' })
    .eq('id', orderId)
  if (error) {
    console.error('[commandes] real order paid update failed:', error)
    revalidateOrderPaths(orderId)
    return
  }
  await supabase.from('order_status_history').insert({
    order_id: orderId,
    actor,
    action: paid ? 'Marquée payée manuellement' : 'Marquée en attente de paiement',
  })
  revalidateOrderPaths(orderId)
}

export async function updateOrderBillingAddressAction(orderId: string, value: string) {
  const actor = await requireKawaStaffActor()
  const demoOrder = getDemoOrderById(orderId)
  if (demoOrder) {
    updateDemoOrderBillingAddress(orderId, value, actor)
    revalidateOrderPaths(orderId)
    return
  }

  const supabase = await createClient()
  const { error } = await supabase.from('orders').update({ billing_address: value }).eq('id', orderId)
  if (!error) {
    await supabase
      .from('order_status_history')
      .insert({ order_id: orderId, actor, action: 'Adresse de facturation modifiée' })
  }
  revalidateOrderPaths(orderId)
}

export async function updateOrderShippingAddressAction(orderId: string, value: string) {
  const actor = await requireKawaStaffActor()
  const demoOrder = getDemoOrderById(orderId)
  if (demoOrder) {
    updateDemoOrderShippingAddress(orderId, value, actor)
    revalidateOrderPaths(orderId)
    return
  }

  const supabase = await createClient()
  const { error } = await supabase.from('orders').update({ address: value }).eq('id', orderId)
  if (!error) {
    await supabase
      .from('order_status_history')
      .insert({ order_id: orderId, actor, action: 'Adresse de livraison modifiée' })
  }
  revalidateOrderPaths(orderId)
}

export async function refundOrderAction(orderId: string, amount: number, reason: string) {
  const actor = await requireKawaStaffActor()
  const trimmedReason = reason.trim()
  if (!(amount > 0) || !trimmedReason) {
    throw new Error('Montant et motif requis.')
  }

  const demoOrder = getDemoOrderById(orderId)
  if (demoOrder) {
    const order = addDemoOrderRefund(orderId, amount, trimmedReason, actor)
    if (!order) {
      throw new Error('Montant invalide (dépasse le solde restant à rembourser).')
    }
    const refund = order.refunds[order.refunds.length - 1]
    try {
      await sendOrderRefundedEmail(order, refund)
    } catch (error) {
      console.error('[commandes] refund confirmation email failed:', error)
    }
    revalidateOrderPaths(orderId)
    return
  }

  const order = await getAdminOrderById(orderId)
  if (!order) {
    throw new Error('Commande introuvable.')
  }
  const remaining = order.amount - getOrderRefundTotal(order)
  if (amount > remaining + 0.005) {
    throw new Error('Montant invalide (dépasse le solde restant à rembourser).')
  }

  const supabase = await createClient()
  const { data: refundRow, error } = await supabase
    .from('order_refunds')
    .insert({ order_id: orderId, amount, reason: trimmedReason, actor })
    .select('id, amount, reason, actor, at')
    .single()
  if (error || !refundRow) {
    console.error('[commandes] refund insert failed:', error)
    throw new Error('Une erreur est survenue, merci de réessayer.')
  }

  const orderWithNewRefund = { ...order, refunds: [...order.refunds, refundRow] }
  const isFull = getOrderRefundStatus(orderWithNewRefund) === 'full'
  const amountLabel = amount.toFixed(2).replace('.', ',')
  await supabase.from('order_status_history').insert({
    order_id: orderId,
    actor,
    action: `Remboursement ${isFull ? 'total' : 'partiel'} de ${amountLabel} € — ${trimmedReason}`,
  })

  // Dedicated, gapless AVOIR-{year}-{seq} reference + immutable archived
  // PDF (migration 0032) — same reasoning as the facture/BL in the CAWL
  // webhook: never let a later edit change what was actually issued. A
  // failure here logs a security_event + push notification (see
  // lib/order-documents.tsx) instead of silently leaving a burned sequence
  // number — staff can retry via the "Régénérer" button on the order page.
  const archiveResult = await archiveRefundCertificate(supabase, orderId, refundRow.id)
  if (!archiveResult.ok) {
    console.error('[commandes] refund certificate archiving failed:', archiveResult.error)
  }

  try {
    await sendOrderRefundedEmail(order, refundRow)
  } catch (error) {
    console.error('[commandes] refund confirmation email failed:', error)
  }
  revalidateOrderPaths(orderId)
}

export async function addOrderItemAction(orderId: string, item: Omit<DemoOrderItem, 'id'>) {
  const actor = await requireKawaStaffActor()
  addDemoOrderItem(orderId, item, actor)
  revalidateOrderPaths(orderId)
}

export async function updateOrderItemQuantityAction(
  orderId: string,
  itemId: string,
  quantity: number
) {
  const actor = await requireKawaStaffActor()
  updateDemoOrderItemQuantity(orderId, itemId, quantity, actor)
  revalidateOrderPaths(orderId)
}

export async function removeOrderItemAction(orderId: string, itemId: string) {
  const actor = await requireKawaStaffActor()
  removeDemoOrderItem(orderId, itemId, actor)
  revalidateOrderPaths(orderId)
}

export type RegenerateDocumentResult = { ok: true } | { ok: false; error: string }

// Manual recovery for the (rare) case where minting a facture/BL number
// succeeded but rendering/uploading the PDF failed right after — see
// lib/order-documents.tsx. Safe to call repeatedly: each retry mints a
// fresh number rather than reusing the burned one, since the sequence must
// stay strictly increasing.
export async function regenerateOrderDocumentsAction(
  orderId: string
): Promise<RegenerateDocumentResult> {
  await requireKawaStaffActor()
  const supabase = await createClient()
  const result = await archiveOrderInvoiceAndDeliveryNote(supabase, orderId)
  revalidateOrderPaths(orderId)
  return result.ok ? { ok: true } : { ok: false, error: result.error }
}

export async function regenerateRefundCertificateAction(
  orderId: string,
  refundId: string
): Promise<RegenerateDocumentResult> {
  await requireKawaStaffActor()
  const supabase = await createClient()
  const result = await archiveRefundCertificate(supabase, orderId, refundId)
  revalidateOrderPaths(orderId)
  return result
}
