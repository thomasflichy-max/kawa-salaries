'use client'

import { useActionState } from 'react'
import { requestPasswordReset } from '@/app/actions/auth'

export function RequestResetForm() {
  const [state, action, pending] = useActionState(requestPasswordReset, undefined)

  if (state?.success) {
    return (
      <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-4 py-3">
        Si un compte existe avec cette adresse, un email de réinitialisation vient
        de vous être envoyé.
      </p>
    )
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <div>
        <label className="text-sm font-medium text-kawa-700">Email</label>
        <input
          type="email"
          name="email"
          placeholder="sophie.martin@entreprise.fr"
          required
          className="mt-1 w-full border border-kawa-200 rounded-lg px-4 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-sky-500 text-kawa-950 py-2 rounded-lg font-medium hover:bg-sky-600 transition disabled:opacity-50"
      >
        {pending ? 'Envoi…' : 'Envoyer le lien de réinitialisation'}
      </button>
    </form>
  )
}
