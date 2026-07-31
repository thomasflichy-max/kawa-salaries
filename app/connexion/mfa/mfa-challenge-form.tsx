'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import { verifyMfaChallenge } from './actions'
import { verifyMfaRecoveryCode } from './recovery-actions'

export function MfaChallengeForm({ factorId, next }: { factorId: string; next: string }) {
  const [useRecoveryCode, setUseRecoveryCode] = useState(false)
  const [totpState, totpAction, totpPending] = useActionState(verifyMfaChallenge, undefined)
  const [recoveryState, recoveryAction, recoveryPending] = useActionState(
    verifyMfaRecoveryCode,
    undefined
  )

  if (useRecoveryCode) {
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
          onClick={() => setUseRecoveryCode(false)}
          className="text-sm text-sky-700 underline"
        >
          Utiliser mon application d&apos;authentification à la place
        </button>
      </form>
    )
  }

  return (
    <form action={totpAction} className="flex flex-col gap-4">
      <input type="hidden" name="factorId" value={factorId} />
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

      <button
        type="button"
        onClick={() => setUseRecoveryCode(true)}
        className="text-sm text-sky-700 underline"
      >
        Utiliser un code de récupération à la place
      </button>
    </form>
  )
}
