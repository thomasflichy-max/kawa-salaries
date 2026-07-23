'use client'

import { useActionState } from 'react'
import { adminSignup } from '@/app/actions/auth'
import { PasswordInput } from '@/app/password-input'

export function AdminSignupForm() {
  const [state, action, pending] = useActionState(adminSignup, undefined)

  return (
    <form action={action} className="flex flex-col gap-4">
      <div>
        <label className="text-sm font-medium text-kawa-700">Email KAWA</label>
        <input
          type="email"
          name="email"
          placeholder="jean@kawa.coffee"
          required
          className="mt-1 w-full border border-kawa-200 rounded-lg px-4 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-kawa-700">Mot de passe</label>
        <PasswordInput name="password" placeholder="••••••••" required minLength={8} />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 bg-sky-500 text-kawa-950 py-2 rounded-lg font-medium hover:bg-sky-600 transition disabled:opacity-50"
      >
        {pending ? 'Création…' : 'Créer mon accès admin'}
      </button>
    </form>
  )
}
