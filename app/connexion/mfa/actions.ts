'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type MfaChallengeState = { error: string } | undefined

export async function verifyMfaChallenge(
  _prevState: MfaChallengeState,
  formData: FormData
): Promise<MfaChallengeState> {
  const factorId = String(formData.get('factorId') ?? '')
  const code = String(formData.get('code') ?? '').trim()
  const next = String(formData.get('next') ?? '/admin')

  if (!factorId || !/^\d{6}$/.test(code)) {
    return { error: 'Merci de saisir le code à 6 chiffres de votre application.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code })

  if (error) {
    console.error('[verifyMfaChallenge] challengeAndVerify failed:', error)
    return { error: 'Code invalide ou expiré, réessayez.' }
  }

  redirect(next || '/admin')
}
