'use client'

import { useActionState } from 'react'
import { setNewPasswordAfterReset } from '@/app/actions/auth'
import { PasswordInput } from '@/app/password-input'
import { PASSWORD_MIN_LENGTH } from '@/lib/password-policy'

export function NewPasswordForm() {
  const [state, action, pending] = useActionState(setNewPasswordAfterReset, undefined)

  return (
    <form action={action} className="flex flex-col gap-4">
      <div>
        <label className="text-sm font-medium text-kawa-700">Nouveau mot de passe</label>
        <PasswordInput name="password" required minLength={PASSWORD_MIN_LENGTH} />
      </div>

      <div>
        <label className="text-sm font-medium text-kawa-700">Confirmer le mot de passe</label>
        <PasswordInput name="confirmPassword" required minLength={PASSWORD_MIN_LENGTH} />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-sky-500 text-kawa-950 py-2 rounded-lg font-medium hover:bg-sky-600 transition disabled:opacity-50"
      >
        {pending ? 'Mise à jour…' : 'Choisir ce mot de passe'}
      </button>
    </form>
  )
}
