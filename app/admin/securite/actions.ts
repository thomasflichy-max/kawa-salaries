'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isKawaStaffEmail } from '@/lib/is-kawa-staff'
import { generateRecoveryCodes, hashRecoveryCode } from '@/lib/mfa-recovery-codes'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

// Recovery codes are meaningless without at least one verified factor, and a
// stale set shouldn't survive to be reused if MFA is re-enrolled later —
// but only once EVERY factor type is gone (removing TOTP while a WebAuthn
// factor is still active must not wipe codes the user still needs).
async function purgeRecoveryCodesIfNoFactorsLeft(supabase: SupabaseClient<Database>) {
  const { data: factorsData } = await supabase.auth.mfa.listFactors()
  const hasAnyVerifiedFactor =
    (factorsData?.totp?.length ?? 0) > 0 || (factorsData?.webauthn?.length ?? 0) > 0

  if (!hasAnyVerifiedFactor) {
    const { error } = await supabase.rpc('generate_mfa_recovery_codes', { p_code_hashes: [] })
    if (error) {
      console.error('[purgeRecoveryCodesIfNoFactorsLeft] failed:', error)
    }
  }
}

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

  await purgeRecoveryCodesIfNoFactorsLeft(supabase)

  revalidatePath('/admin/securite')
  return { ok: true }
}

export type UnenrollWebauthnResult = { ok: true } | { ok: false; error: string }

export async function unenrollWebauthn(factorId: string): Promise<UnenrollWebauthnResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!isKawaStaffEmail(user?.email)) {
    return { ok: false, error: 'Non autorisé.' }
  }

  const { error } = await supabase.auth.mfa.unenroll({ factorId })

  if (error) {
    console.error('[unenrollWebauthn] unenroll failed:', error)
    return { ok: false, error: 'La désactivation a échoué, merci de réessayer.' }
  }

  await purgeRecoveryCodesIfNoFactorsLeft(supabase)

  revalidatePath('/admin/securite')
  return { ok: true }
}

export type GenerateRecoveryCodesResult =
  | { ok: true; recoveryCodes: string[] }
  | { ok: false; error: string }

// WebAuthn enrollment itself must happen client-side (supabase.auth.mfa.webauthn.register,
// which needs the browser's navigator.credentials API) — this covers just the
// recovery-codes half of what verifyMfaEnrollment does for TOTP, called
// right after a successful client-side registration.
export async function generateRecoveryCodesForCurrentUser(): Promise<GenerateRecoveryCodesResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!isKawaStaffEmail(user?.email)) {
    return { ok: false, error: 'Non autorisé.' }
  }

  const recoveryCodes = generateRecoveryCodes()
  const { error } = await supabase.rpc('generate_mfa_recovery_codes', {
    p_code_hashes: recoveryCodes.map(hashRecoveryCode),
  })

  if (error) {
    console.error('[generateRecoveryCodesForCurrentUser] rpc failed:', error)
    return { ok: false, error: 'Une erreur est survenue.' }
  }

  revalidatePath('/admin/securite')
  return { ok: true, recoveryCodes }
}
