'use client'

import { useActionState, useState } from 'react'
import { updateMarketingPreference } from '@/app/actions/auth'

export function MarketingPreferenceForm({ optedOut }: { optedOut: boolean }) {
  const [state, action, pending] = useActionState(updateMarketingPreference, undefined)
  const [subscribe, setSubscribe] = useState(!optedOut)

  return (
    <form action={action} className="flex flex-col gap-3 max-w-sm">
      <label className="flex items-start gap-3 text-sm text-kawa-700">
        <input
          type="checkbox"
          name="subscribe"
          checked={subscribe}
          onChange={(e) => setSubscribe(e.target.checked)}
          className="mt-0.5 rounded"
        />
        <span>
          Recevoir par email les offres et actualités KAWA (nouveaux cafés, promotions,
          nouveautés). Vous pouvez vous désinscrire à tout moment.
        </span>
      </label>

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
          Préférence enregistrée.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-start bg-sky-500 text-kawa-950 px-4 py-2 rounded-lg font-medium hover:bg-sky-600 transition disabled:opacity-50"
      >
        {pending ? 'Enregistrement…' : 'Enregistrer'}
      </button>
    </form>
  )
}
