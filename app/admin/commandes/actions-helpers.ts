import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isKawaStaffEmail, getStaffDisplayName } from '@/lib/is-kawa-staff'

// Shared by actions.tsx and refund-actions.ts — kept in a plain module
// (not 'use server') rather than duplicated, since a 'use server' file can
// only export async functions, not arbitrary helpers.
export async function requireKawaStaffActor() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!isKawaStaffEmail(user?.email)) {
    throw new Error('Non autorisé.')
  }

  return getStaffDisplayName(user?.email)
}

export function revalidateOrderPaths(orderId: string) {
  revalidatePath('/admin/commandes')
  revalidatePath(`/admin/commandes/${orderId}`)
  revalidatePath('/admin')
}
