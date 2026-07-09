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
  type DemoOrderStatus,
  type DemoOrderItem,
} from '@/app/admin/demo-data'
import { sendOrderConfirmationEmail } from '@/lib/emails/order-confirmation'

// Employee inboxes on demo orders are fake company domains (@atlanticdigital.fr
// etc.) and can't actually receive mail — this lets staff preview the real
// confirmation template in their own inbox before it's wired to a real checkout.
const TEST_EMAIL_RECIPIENT = 'thomas.flichy@kawa.coffee'

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

export async function advanceOrderStatusAction(orderId: string) {
  const actor = await requireKawaStaffActor()
  advanceDemoOrderStatus(orderId, actor)
  revalidateOrderPaths(orderId)
}

export async function updateOrderStatusAction(orderId: string, status: DemoOrderStatus) {
  const actor = await requireKawaStaffActor()
  setDemoOrderStatus(orderId, status, actor)
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

export async function sendTestOrderConfirmationEmailAction(orderId: string) {
  await requireKawaStaffActor()
  const order = getDemoOrderById(orderId)
  if (!order) throw new Error('Commande introuvable.')
  await sendOrderConfirmationEmail(order, {
    to: TEST_EMAIL_RECIPIENT,
    subjectPrefix: '[TEST] ',
  })
}
