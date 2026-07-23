'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { login } from '@/app/actions/auth'
import { PasswordInput } from '@/app/password-input'

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(login, undefined)

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="next" value={next} />

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

      <div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-kawa-700">Mot de passe</label>
          <Link href="/mot-de-passe-oublie" className="text-xs text-sky-700 underline">
            Mot de passe oublié ?
          </Link>
        </div>
        <PasswordInput name="password" placeholder="••••••••" required />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 bg-sky-500 text-kawa-950 py-2 rounded-lg font-medium hover:bg-sky-600 transition disabled:opacity-50"
      >
        {pending ? 'Connexion…' : 'Se connecter'}
      </button>
    </form>
  )
}
