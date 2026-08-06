'use server'

import { createClient } from '@/lib/supabase/server'
import { isKawaStaffEmail } from '@/lib/is-kawa-staff'

export type PushActionResult = { ok: true } | { ok: false; error: string }

export async function subscribeToPush(subscription: {
  endpoint: string
  keys: { p256dh: string; auth: string }
}): Promise<PushActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !isKawaStaffEmail(user.email)) {
    return { ok: false, error: 'Non autorisé.' }
  }

  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      user_id: user.id,
      endpoint: subscription.endpoint,
      subscription,
    },
    { onConflict: 'endpoint' }
  )

  if (error) {
    console.error('[subscribeToPush] upsert failed:', error)
    return { ok: false, error: "L'activation a échoué, merci de réessayer." }
  }

  return { ok: true }
}

export async function unsubscribeFromPush(endpoint: string): Promise<PushActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !isKawaStaffEmail(user.email)) {
    return { ok: false, error: 'Non autorisé.' }
  }

  const { error } = await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint)

  if (error) {
    console.error('[unsubscribeFromPush] delete failed:', error)
    return { ok: false, error: 'La désactivation a échoué, merci de réessayer.' }
  }

  return { ok: true }
}
