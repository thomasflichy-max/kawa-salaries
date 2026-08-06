'use server'

import { createClient } from '@/lib/supabase/server'
import { isKawaStaffEmail } from '@/lib/is-kawa-staff'
import { revalidatePath } from 'next/cache'

export type ReplyActionResult = { ok: true } | { ok: false; error: string }

// Records the reply text in security_events for history purposes — the
// actual sending happens in Gmail (opened client-side), which this app has
// no way to confirm, so this only logs that a reply was composed and sent
// from here, not a delivery receipt.
export async function logSupportReply(email: string, message: string): Promise<ReplyActionResult> {
  const trimmed = message.trim()
  if (!trimmed) {
    return { ok: false, error: 'Merci de saisir une réponse.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user || !isKawaStaffEmail(user.email)) {
    return { ok: false, error: 'Non autorisé.' }
  }

  const { error } = await supabase.from('security_events').insert({
    event_type: 'support_reply',
    email,
    detail: trimmed,
  })

  if (error) {
    console.error('[logSupportReply] insert failed:', error)
    return { ok: false, error: "L'enregistrement a échoué, merci de réessayer." }
  }

  revalidatePath('/admin/securite/evenements')
  return { ok: true }
}
