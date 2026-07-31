'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { hashRecoveryCode } from '@/lib/mfa-recovery-codes'

export type RecoveryCodeState = { error: string } | undefined

export async function verifyMfaRecoveryCode(
  _prevState: RecoveryCodeState,
  formData: FormData
): Promise<RecoveryCodeState> {
  const code = String(formData.get('code') ?? '')
  const next = String(formData.get('next') ?? '/admin')

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/connexion')
  }

  const { data: consumed, error } = await supabase.rpc('consume_mfa_recovery_code', {
    p_code_hash: hashRecoveryCode(code),
  })

  if (error) {
    console.error('[verifyMfaRecoveryCode] consume_mfa_recovery_code failed:', error)
    return { error: 'Une erreur est survenue, merci de réessayer.' }
  }
  if (!consumed) {
    return { error: 'Code de récupération invalide ou déjà utilisé.' }
  }

  redirect(next || '/admin')
}
