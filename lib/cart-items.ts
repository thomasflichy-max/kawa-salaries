import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from './supabase/types'

// Shared upsert-by-(user, product, grind) logic — used by the "add to cart"
// server action (user session client) and the subscription-reminder cron
// (service-role client, no session: see app/api/cron/subscription-reminders).
// Takes whichever Supabase client the caller already has, so it works with
// either.
export async function upsertCartItem(
  supabase: SupabaseClient<Database>,
  userId: string,
  productId: string,
  quantity: number,
  grindType: string | null
) {
  let existingQuery = supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('user_id', userId)
    .eq('product_id', productId)

  existingQuery = grindType
    ? existingQuery.eq('grind_type', grindType)
    : existingQuery.is('grind_type', null)

  const { data: existing } = await existingQuery.maybeSingle()

  if (existing) {
    await supabase
      .from('cart_items')
      .update({ quantity: existing.quantity + quantity })
      .eq('id', existing.id)
  } else {
    await supabase
      .from('cart_items')
      .insert({ user_id: userId, product_id: productId, quantity, grind_type: grindType })
  }
}
