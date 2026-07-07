'use client'

import { useActionState } from 'react'
import { signup } from '@/app/actions/auth'

export function SignupForm() {
  const [state, action, pending] = useActionState(signup, undefined)

  return (
    <form action={action} className="flex flex-col gap-4">
      <div>
        <label className="text-sm font-medium text-kawa-700">Prénom</label>
        <input
          type="text"
          name="firstName"
          placeholder="Sophie"
          required
          className="mt-1 w-full border border-kawa-200 rounded-lg px-4 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-kawa-700">Nom</label>
        <input
          type="text"
          name="lastName"
          placeholder="Martin"
          required
          className="mt-1 w-full border border-kawa-200 rounded-lg px-4 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-kawa-700">Email professionnel</label>
        <input
          type="email"
          name="email"
          placeholder="sophie.martin@entreprise.fr"
          required
          className="mt-1 w-full border border-kawa-200 rounded-lg px-4 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-kawa-700">Mot de passe</label>
        <input
          type="password"
          name="password"
          placeholder="••••••••"
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

      <button
        type="submit"
        disabled={pending}
        className="mt-2 bg-sky-500 text-kawa-950 py-2 rounded-lg font-medium hover:bg-sky-600 transition disabled:opacity-50"
      >
        {pending ? 'Création en cours…' : 'Créer mon compte'}
      </button>
    </form>
  )
}
