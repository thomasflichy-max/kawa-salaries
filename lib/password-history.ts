import bcrypt from 'bcryptjs'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

const HISTORY_SIZE = 4

export async function isPasswordReused(
  supabase: SupabaseClient<Database>,
  userId: string,
  newPassword: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('password_history')
    .select('password_hash')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(HISTORY_SIZE)

  if (error) {
    console.error('[isPasswordReused] fetch failed:', error)
    return false // fail open — an infra hiccup shouldn't block a password change
  }

  for (const row of data ?? []) {
    if (await bcrypt.compare(newPassword, row.password_hash)) {
      return true
    }
  }
  return false
}

export async function recordPasswordHistory(
  supabase: SupabaseClient<Database>,
  userId: string,
  newPassword: string
): Promise<void> {
  const hash = await bcrypt.hash(newPassword, 10)
  const { error: insertError } = await supabase
    .from('password_history')
    .insert({ user_id: userId, password_hash: hash })
  if (insertError) {
    console.error('[recordPasswordHistory] insert failed:', insertError)
    return
  }

  const { data: rows } = await supabase
    .from('password_history')
    .select('id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  const staleIds = (rows ?? []).slice(HISTORY_SIZE).map((r) => r.id)
  if (staleIds.length > 0) {
    const { error: deleteError } = await supabase
      .from('password_history')
      .delete()
      .in('id', staleIds)
    if (deleteError) {
      console.error('[recordPasswordHistory] prune failed:', deleteError)
    }
  }
}
