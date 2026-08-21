'use server'

import { createClient } from '@/lib/supabase/server'
import {
  advanceDemoOrderStatus,
  setDemoOrderStatus,
  setDemoOrderPaid,
  updateDemoOrderBillingAddress,
  updateDemoOrderShippingAddress,
  addDemoOrderItem,
  updateDemoOrderItemQuantity,
  removeDemoOrderItem,
  getDemoOrderById,
  getNextOrderStatus,
  DEMO_ORDER_STATUS_LABELS,
  type DemoOrder,
  type DemoOrderStatus,
  type DemoOrderItem,
} from '@/app/admin/demo-data'
import { getAdminOrderById } from './manual-orders'
import { sendOrderReadyForPickupEmail } from '@/lib/emails/order-ready-for-pickup'
import { requireKawaStaffActor, revalidateOrderPaths } from './actions-helpers'

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
// refund via refundOrderAction (./refund-actions.ts).
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
