'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isKawaStaffEmail, getStaffDisplayName } from '@/lib/is-kawa-staff'
import {
  advanceDemoOrderStatus,
  setDemoOrderStatus,
  updateDemoOrderBillingAddress,
  updateDemoOrderShippingAddress,
  refundDemoOrder,
  type DemoOrderStatus,
} from '@/app/admin/demo-data'

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

export async function refundOrderAction(orderId: string) {
  const actor = await requireKawaStaffActor()
  refundDemoOrder(orderId, actor)
  revalidateOrderPaths(orderId)
}
