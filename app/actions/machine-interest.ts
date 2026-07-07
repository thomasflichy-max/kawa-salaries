'use server'

import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'

export type MachineInterestState =
  | { error: string; success?: false }
  | { success: true; error?: undefined }
  | undefined

const NOTIFY_EMAIL = 'thomas.flichy@kawa.coffee'

export async function submitMachineInterest(
  productId: string,
  _prevState: MachineInterestState,
  formData: FormData
): Promise<MachineInterestState> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Session expirée, merci de vous reconnecter.' }
  }

  const firstName = String(formData.get('firstName') ?? '').trim()
  const lastName = String(formData.get('lastName') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const phone = String(formData.get('phone') ?? '').trim()

  if (!firstName || !lastName) {
    return { error: 'Merci de renseigner votre prénom et votre nom.' }
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Adresse email invalide.' }
  }

  const { data: product } = await supabase
    .from('products')
    .select('name')
    .eq('id', productId)
    .maybeSingle()

  const { error } = await supabase.from('machine_interest_requests').insert({
    product_id: productId,
    user_id: user.id,
    first_name: firstName,
    last_name: lastName,
    email,
    phone: phone || null,
  })

  if (error) {
    console.error('[submitMachineInterest] insert failed:', error)
    return { error: 'Une erreur est survenue, merci de réessayer.' }
  }

  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY)
      await resend.emails.send({
        from: 'kawa-salaries <onboarding@resend.dev>',
        to: NOTIFY_EMAIL,
        replyTo: email,
        subject: `Demande machine reconditionnée — ${product?.name ?? 'produit'}`,
        text: [
          `Produit : ${product?.name ?? productId}`,
          `Nom : ${firstName} ${lastName}`,
          `Email : ${email}`,
          `Téléphone : ${phone || 'non renseigné'}`,
        ].join('\n'),
      })
    } catch (emailError) {
      // The request is already saved in machine_interest_requests, so a
      // failed notification email must not fail the whole submission.
      console.error('[submitMachineInterest] email send failed:', emailError)
    }
  } else {
    console.warn('[submitMachineInterest] RESEND_API_KEY not set, skipping email notification')
  }

  return { success: true }
}
