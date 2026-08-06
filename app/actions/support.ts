'use server'

import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'

export type SupportMessageState =
  | { error: string; success?: false }
  | { success: true; error?: undefined }
  | undefined

const NOTIFY_EMAIL = 'thomas.flichy@kawa.coffee'

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

  // Lands in the same "Sécurité & support" admin channel as security
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

  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: 'kawa-salaries <onboarding@resend.dev>',
        to: NOTIFY_EMAIL,
        replyTo: user.email,
        subject: `Question d'un salarié — ${profile?.full_name ?? user.email}`,
        text: [
          `De : ${profile?.full_name ?? 'Salarié'} (${user.email})`,
          '',
          message,
        ].join('\n'),
      })
    } catch (emailError) {
      // The message is already saved in security_events, so a failed
      // notification email must not fail the whole submission.
      console.error('[submitSupportMessage] email send failed:', emailError)
    }
  } else {
    console.warn('[submitSupportMessage] RESEND_API_KEY not set, skipping email notification')
  }

  return { success: true }
}
