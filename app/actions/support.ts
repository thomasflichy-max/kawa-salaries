'use server'

import { createClient } from '@/lib/supabase/server'
import { notifyStaffDevices } from '@/lib/push-notifications'

export type SupportMessageState =
  | { error: string; success?: false }
  | { success: true; error?: undefined }
  | undefined

export async function submitSupportMessage(
  _prevState: SupportMessageState,
  formData: FormData
): Promise<SupportMessageState> {
  const message = String(formData.get('message') ?? '').trim()

  if (!message) {
    return { error: 'Merci de saisir votre question.' }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Session expirée, merci de vous reconnecter.' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .maybeSingle()

  // Lands in the "Account Management" admin channel alongside security
  // alerts (see app/admin/securite/evenements) rather than the old
  // support_messages table, which no admin page ever actually read.
  const { error } = await supabase.from('security_events').insert({
    event_type: 'support_message',
    email: user.email,
    detail: message,
  })

  if (error) {
    console.error('[submitSupportMessage] insert failed:', error)
    return { error: 'Une erreur est survenue, merci de réessayer.' }
  }

  // OS-level notification on any staff device that opted in (Account
  // Management page) — replaces the email that used to fire here.
  try {
    await notifyStaffDevices({
      title: `Question d'un salarié — ${profile?.full_name ?? user.email}`,
      body: message,
      url: '/admin/securite/evenements',
    })
  } catch (pushError) {
    // The message is already saved in security_events, so a failed push
    // must not fail the whole submission.
    console.error('[submitSupportMessage] push notification failed:', pushError)
  }

  return { success: true }
}
