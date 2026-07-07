'use client'

import { useActionState } from 'react'
import { updateProfile } from '@/app/actions/auth'

export function ProfileForm({ fullName }: { fullName: string | null }) {
  const [state, action, pending] = useActionState(updateProfile, undefined)

  return (
    <form action={action} className="flex flex-col gap-3 max-w-sm">
      <div>
        <label className="text-sm font-medium text-kawa-700">Nom complet</label>
        <input
          type="text"
          name="fullName"
          defaultValue={fullName ?? ''}
          required
          className="mt-1 w-full border border-kawa-200 rounded-lg px-4 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
          Profil mis à jour.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-start bg-sky-500 text-kawa-950 px-4 py-2 rounded-lg font-medium hover:bg-sky-600 transition disabled:opacity-50"
      >
        {pending ? 'Mise à jour…' : 'Enregistrer'}
      </button>
    </form>
  )
}
