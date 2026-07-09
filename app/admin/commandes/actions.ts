'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isKawaStaffEmail, getStaffDisplayName } from '@/lib/is-kawa-staff'
import {
  advanceDemoOrderStatus,
  setDemoOrderStatus,
  updateDemoOrderBillingAddress,
  updateDemoOrderShippingAddress,
  addDemoOrderRefund,
  addDemoOrderItem,
  updateDemoOrderItemQuantity,
  removeDemoOrderItem,
  getDemoOrderById,
  type DemoOrder,
  type DemoOrderStatus,
  type DemoOrderItem,
} from '@/app/admin/demo-data'
import { sendOrderReadyForPickupEmail } from '@/lib/emails/order-ready-for-pickup'
import { sendOrderCancelledEmail } from '@/lib/emails/order-cancelled'

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

// Only "annulee" needs this — no other status has a "no refund, avoir
// instead" consequence worth mailing about, and cancellation only ever
// happens through updateOrderStatusAction's status dropdown.
async function notifyIfJustCancelled(order: DemoOrder | null, wasCancelled: boolean) {
  if (!order || wasCancelled) return
  if (order.status !== 'annulee') return
  try {
    await sendOrderCancelledEmail(order)
  } catch (error) {
    console.error('[commandes] cancellation email failed:', error)
  }
}

export async function advanceOrderStatusAction(orderId: string) {
  const actor = await requireKawaStaffActor()
  const wasReady = getDemoOrderById(orderId)?.status === 'pret'
  const order = advanceDemoOrderStatus(orderId, actor)
  await notifyIfJustReadyForPickup(order, wasReady)
  revalidateOrderPaths(orderId)
}

export async function updateOrderStatusAction(orderId: string, status: DemoOrderStatus) {
  const actor = await requireKawaStaffActor()
  const previousStatus = getDemoOrderById(orderId)?.status
  const order = setDemoOrderStatus(orderId, status, actor)
  await notifyIfJustReadyForPickup(order, previousStatus === 'pret')
  await notifyIfJustCancelled(order, previousStatus === 'annulee')
  revalidateOrderPaths(orderId)
}

export async function updateOrderBillingAddressAction(orderId: string, value: string) {
  const actor = await requireKawaStaffActor()
  updateDemoOrderBillingAddress(orderId, value, actor)
  revalidateOrderPaths(orderId)
}

export async function updateOrderShippingAddressAction(orderId: string, value: string) {
  const actor = await requireKawaStaffActor()
  updateDemoOrderShippingAddress(orderId, value, actor)
  revalidateOrderPaths(orderId)
}

export async function refundOrderAction(orderId: string, amount: number, reason: string) {
  const actor = await requireKawaStaffActor()
  const trimmedReason = reason.trim()
  if (!(amount > 0) || !trimmedReason) {
    throw new Error('Montant et motif requis.')
  }
  const result = addDemoOrderRefund(orderId, amount, trimmedReason, actor)
  if (!result) {
    throw new Error('Montant invalide (dépasse le solde restant à rembourser).')
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
