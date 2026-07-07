'use client'

import { useActionState, useEffect, useRef } from 'react'
import { updatePassword } from '@/app/actions/auth'

export function ChangePasswordForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [state, action, pending] = useActionState(updatePassword, undefined)

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset()
    }
  }, [state])

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-4 max-w-sm">
      <div>
        <label className="text-sm font-medium text-kawa-700">Mot de passe actuel</label>
        <input
          type="password"
          name="currentPassword"
          required
          className="mt-1 w-full border border-kawa-200 rounded-lg px-4 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-kawa-700">Nouveau mot de passe</label>
        <input
          type="password"
          name="newPassword"
          required
          minLength={8}
          className="mt-1 w-full border border-kawa-200 rounded-lg px-4 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-kawa-700">Confirmer le nouveau mot de passe</label>
        <input
          type="password"
          name="confirmPassword"
          required
          minLength={8}
          className="mt-1 w-full border border-kawa-200 rounded-lg px-4 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
          Mot de passe mis à jour.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-start bg-sky-500 text-kawa-950 px-4 py-2 rounded-lg font-medium hover:bg-sky-600 transition disabled:opacity-50"
      >
        {pending ? 'Mise à jour…' : 'Changer le mot de passe'}
      </button>
    </form>
  )
}
