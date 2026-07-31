'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isKawaStaffEmail } from '@/lib/is-kawa-staff'

export type EnrollMfaResult =
  | { ok: true; factorId: string; qrCode: string; secret: string }
  | { ok: false; error: string }

export async function enrollMfa(): Promise<EnrollMfaResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!isKawaStaffEmail(user?.email)) {
    return { ok: false, error: 'Non autorisé.' }
  }

  const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp' })

  if (error) {
    console.error('[enrollMfa] enroll failed:', error)
    return { ok: false, error: "L'activation a échoué, merci de réessayer." }
  }

  return { ok: true, factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret }
}

export type VerifyMfaEnrollmentResult = { ok: true } | { ok: false; error: string }

export async function verifyMfaEnrollment(
  factorId: string,
  code: string
): Promise<VerifyMfaEnrollmentResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!isKawaStaffEmail(user?.email)) {
    return { ok: false, error: 'Non autorisé.' }
  }

  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code })

  if (error) {
    console.error('[verifyMfaEnrollment] challengeAndVerify failed:', error)
    return { ok: false, error: 'Code invalide, réessayez.' }
  }

  revalidatePath('/admin/securite')
  return { ok: true }
}

export type UnenrollMfaResult = { ok: true } | { ok: false; error: string }

export async function unenrollMfa(factorId: string): Promise<UnenrollMfaResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!isKawaStaffEmail(user?.email)) {
    return { ok: false, error: 'Non autorisé.' }
  }

  const { error } = await supabase.auth.mfa.unenroll({ factorId })

  if (error) {
    console.error('[unenrollMfa] unenroll failed:', error)
    return { ok: false, error: 'La désactivation a échoué, merci de réessayer.' }
  }

  revalidatePath('/admin/securite')
  return { ok: true }
}
