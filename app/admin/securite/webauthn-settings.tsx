'use client'

import { useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { generateRecoveryCodesForCurrentUser, unenrollWebauthn } from './actions'
import { RecoveryCodesReveal } from './recovery-codes-reveal'

export function WebauthnSettings({
  hasVerifiedFactor,
  factorId,
}: {
  hasVerifiedFactor: boolean
  factorId: string | null
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null)

  function handleEnroll() {
    setError(null)
    startTransition(async () => {
      const supabase = createClient()
      // A single call: enrolls the factor, triggers the browser's biometric
      // prompt (Touch ID / Windows Hello / fingerprint sensor), and verifies
      // it — unlike TOTP, WebAuthn needs the browser's navigator.credentials
      // API, so this can't go through a server action.
      const { error: registerError } = await supabase.auth.mfa.webauthn.register(
        { friendlyName: 'Empreinte digitale / Face ID' },
        {
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
            residentKey: 'preferred',
          },
        }
      )

      if (registerError) {
        console.error('[WebauthnSettings] register failed:', registerError)
        setError(
          registerError.message?.toLowerCase().includes('not support')
            ? "Cet appareil ou ce navigateur ne supporte pas cette fonctionnalité."
            : "L'activation a échoué ou a été annulée."
        )
        return
      }

      const result = await generateRecoveryCodesForCurrentUser()
      if (result.ok && result.recoveryCodes.length > 0) {
        setRecoveryCodes(result.recoveryCodes)
      }
    })
  }

  function handleUnenroll() {
    if (!factorId) return
    if (!confirm('Désactiver la vérification par empreinte digitale / Face ID ?')) return
    setError(null)
    startTransition(async () => {
      const result = await unenrollWebauthn(factorId)
      if (!result.ok) {
        setError(result.error)
      }
    })
  }

  if (recoveryCodes) {
    return <RecoveryCodesReveal codes={recoveryCodes} onDismiss={() => setRecoveryCodes(null)} />
  }

  if (hasVerifiedFactor) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2 inline-block w-fit">
          Empreinte digitale / Face ID activée sur ce compte.
        </p>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="button"
          onClick={handleUnenroll}
          disabled={isPending}
          className="text-sm text-red-600 hover:underline disabled:opacity-50 w-fit"
        >
          Désactiver
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-kawa-600">
        Utilisez le capteur d&apos;empreinte, Face ID ou Windows Hello de cet appareil comme
        vérification en deux étapes, à la place d&apos;un code à saisir.
      </p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="button"
        onClick={handleEnroll}
        disabled={isPending}
        className="bg-sky-500 text-kawa-950 px-4 py-2 rounded-lg font-medium hover:bg-sky-600 transition disabled:opacity-50 w-fit"
      >
        {isPending ? 'Activation…' : 'Activer via empreinte digitale / Face ID'}
      </button>
    </div>
  )
}
