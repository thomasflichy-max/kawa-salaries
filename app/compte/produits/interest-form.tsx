'use client'

import { useActionState } from 'react'
import { submitMachineInterest } from '@/app/actions/machine-interest'

export function InterestForm({ productId }: { productId: string }) {
  const [state, action, pending] = useActionState(
    submitMachineInterest.bind(null, productId),
    undefined
  )

  if (state?.success) {
    return (
      <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-4 py-3">
        Merci, votre demande a bien été envoyée. Nous vous recontactons rapidement.
      </p>
    )
  }

  return (
    <form action={action} className="flex flex-col gap-3 max-w-sm">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-kawa-700">Prénom</label>
          <input
            type="text"
            name="firstName"
            required
            className="mt-1 w-full border border-kawa-200 rounded-lg px-3 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-kawa-700">Nom</label>
          <input
            type="text"
            name="lastName"
            required
            className="mt-1 w-full border border-kawa-200 rounded-lg px-3 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-kawa-700">Email</label>
        <input
          type="email"
          name="email"
          required
          className="mt-1 w-full border border-kawa-200 rounded-lg px-3 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-kawa-700">Téléphone (facultatif)</label>
        <input
          type="tel"
          name="phone"
          className="mt-1 w-full border border-kawa-200 rounded-lg px-3 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-sky-500 text-kawa-950 py-3 rounded-lg font-medium hover:bg-sky-600 transition disabled:opacity-50"
      >
        {pending ? 'Envoi…' : 'Je veux commander une machine reconditionnée'}
      </button>
    </form>
  )
}
