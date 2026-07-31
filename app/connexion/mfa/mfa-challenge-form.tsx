'use client'

import { useActionState } from 'react'
import { verifyMfaChallenge } from './actions'

export function MfaChallengeForm({ factorId, next }: { factorId: string; next: string }) {
  const [state, action, pending] = useActionState(verifyMfaChallenge, undefined)

  return (
    <form action={action} className="flex flex-col gap-4">
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

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-sky-500 text-kawa-950 py-2 rounded-lg font-medium hover:bg-sky-600 transition disabled:opacity-50"
      >
        {pending ? 'Vérification…' : 'Valider'}
      </button>
    </form>
  )
}
