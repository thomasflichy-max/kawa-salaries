'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isKawaStaffEmail } from '@/lib/is-kawa-staff'
import { generateRecoveryCodes, hashRecoveryCode } from '@/lib/mfa-recovery-codes'

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

export type VerifyMfaEnrollmentResult =
  | { ok: true; recoveryCodes: string[] }
  | { ok: false; error: string }

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

  // Fresh recovery codes every time a factor is (re-)verified — replaces
  // any codes from a previous enrollment (generate_mfa_recovery_codes
  // deletes-then-inserts for this user), so old ones stop working.
  const recoveryCodes = generateRecoveryCodes()
  const { error: rpcError } = await supabase.rpc('generate_mfa_recovery_codes', {
    p_code_hashes: recoveryCodes.map(hashRecoveryCode),
  })
  if (rpcError) {
    console.error('[verifyMfaEnrollment] generate_mfa_recovery_codes failed:', rpcError)
  }

  revalidatePath('/admin/securite')
  return { ok: true, recoveryCodes: rpcError ? [] : recoveryCodes }
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

  // Purge recovery codes too — they're meaningless without MFA enabled, and
  // this way a stale code can't be reused if MFA gets re-enrolled later
  // through some other path.
  const { error: rpcError } = await supabase.rpc('generate_mfa_recovery_codes', {
    p_code_hashes: [],
  })
  if (rpcError) {
    console.error('[unenrollMfa] failed to clear recovery codes:', rpcError)
  }

  revalidatePath('/admin/securite')
  return { ok: true }
}
