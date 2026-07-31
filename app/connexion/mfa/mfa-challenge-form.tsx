'use client'

import { useState, useTransition, useActionState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { verifyMfaChallenge } from './actions'
import { verifyMfaRecoveryCode } from './recovery-actions'

type Mode = 'webauthn' | 'totp' | 'recovery'

export function MfaChallengeForm({
  totpFactorId,
  webauthnFactorId,
  next,
}: {
  totpFactorId: string | null
  webauthnFactorId: string | null
  next: string
}) {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>(webauthnFactorId ? 'webauthn' : 'totp')
  const [webauthnPending, startWebauthnTransition] = useTransition()
  const [webauthnError, setWebauthnError] = useState<string | null>(null)
  const [totpState, totpAction, totpPending] = useActionState(verifyMfaChallenge, undefined)
  const [recoveryState, recoveryAction, recoveryPending] = useActionState(
    verifyMfaRecoveryCode,
    undefined
  )

  function handleWebauthn() {
    if (!webauthnFactorId) return
    setWebauthnError(null)
    startWebauthnTransition(async () => {
      const supabase = createClient()
      const { error } = await supabase.auth.mfa.webauthn.authenticate({
        factorId: webauthnFactorId,
      })
      if (error) {
        console.error('[MfaChallengeForm] webauthn authenticate failed:', error)
        setWebauthnError("La vérification a échoué ou a été annulée.")
        return
      }
      router.push(next)
      router.refresh()
    })
  }

  if (mode === 'webauthn') {
    return (
      <div className="flex flex-col gap-4">
        <button
          type="button"
          onClick={handleWebauthn}
          disabled={webauthnPending}
          className="bg-sky-500 text-kawa-950 py-2 rounded-lg font-medium hover:bg-sky-600 transition disabled:opacity-50"
        >
          {webauthnPending ? 'Vérification…' : 'Utiliser mon empreinte / Face ID'}
        </button>

        {webauthnError && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{webauthnError}</p>
        )}

        <div className="flex flex-col gap-1 text-center">
          {totpFactorId && (
            <button
              type="button"
              onClick={() => setMode('totp')}
              className="text-sm text-sky-700 underline"
            >
              Utiliser un code de vérification à la place
            </button>
          )}
          <button
            type="button"
            onClick={() => setMode('recovery')}
            className="text-sm text-sky-700 underline"
          >
            Utiliser un code de récupération à la place
          </button>
        </div>
      </div>
    )
  }

  if (mode === 'recovery') {
    return (
      <form action={recoveryAction} className="flex flex-col gap-4">
        <input type="hidden" name="next" value={next} />

        <div>
          <label className="text-sm font-medium text-kawa-700">Code de récupération</label>
          <input
            type="text"
            name="code"
            placeholder="a1b2-c3d4-e5f6-0718"
            autoFocus
            required
            className="mt-1 w-full border border-kawa-200 rounded-lg px-4 py-2 text-kawa-800 tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>

        {recoveryState?.error && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
            {recoveryState.error}
          </p>
        )}

        <button
          type="submit"
          disabled={recoveryPending}
          className="bg-sky-500 text-kawa-950 py-2 rounded-lg font-medium hover:bg-sky-600 transition disabled:opacity-50"
        >
          {recoveryPending ? 'Vérification…' : 'Valider'}
        </button>

        <button
          type="button"
          onClick={() => setMode(webauthnFactorId ? 'webauthn' : 'totp')}
          className="text-sm text-sky-700 underline"
        >
          Retour
        </button>
      </form>
    )
  }

  return (
    <form action={totpAction} className="flex flex-col gap-4">
      <input type="hidden" name="factorId" value={totpFactorId ?? ''} />
      <input type="hidden" name="next" value={next} />

      <div>
        <label className="text-sm font-medium text-kawa-700">Code de vérification</label>
        <input
          type="text"
          inputMode="numeric"
          pattern="[0-9]{6}"
          maxLength={6}
          name="code"
          placeholder="123456"
          autoFocus
          required
          className="mt-1 w-full border border-kawa-200 rounded-lg px-4 py-2 text-kawa-800 tracking-widest text-center text-lg focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
      </div>

      {totpState?.error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{totpState.error}</p>
      )}

      <button
        type="submit"
        disabled={totpPending}
        className="bg-sky-500 text-kawa-950 py-2 rounded-lg font-medium hover:bg-sky-600 transition disabled:opacity-50"
      >
        {totpPending ? 'Vérification…' : 'Valider'}
      </button>

      <div className="flex flex-col gap-1 text-center">
        {webauthnFactorId && (
          <button
            type="button"
            onClick={() => setMode('webauthn')}
            className="text-sm text-sky-700 underline"
          >
            Utiliser mon empreinte / Face ID à la place
          </button>
        )}
        <button
          type="button"
          onClick={() => setMode('recovery')}
          className="text-sm text-sky-700 underline"
        >
          Utiliser un code de récupération à la place
        </button>
      </div>
    </form>
  )
}
