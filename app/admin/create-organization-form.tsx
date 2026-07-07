'use client'

import { useActionState, useEffect, useRef } from 'react'
import { createOrganization } from '@/app/admin/actions'

export function CreateOrganizationForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [state, action, pending] = useActionState(createOrganization, undefined)

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset()
    }
  }, [state])

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-5 max-w-2xl">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-kawa-700">Nom de l&apos;entreprise</label>
          <input
            type="text"
            name="name"
            placeholder="Colbert Assurances"
            required
            className="mt-1 w-full border border-kawa-200 rounded-lg px-3 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-kawa-700">Domaine email</label>
          <input
            type="text"
            name="domain"
            placeholder="colbertgroupe.com"
            required
            className="mt-1 w-full border border-kawa-200 rounded-lg px-3 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-kawa-700">Mail type d&apos;un salarié</label>
          <input
            type="email"
            name="sample_email"
            placeholder="jean.dupont@colbertgroupe.com"
            className="mt-1 w-full border border-kawa-200 rounded-lg px-3 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>
        <div className="w-32">
          <label className="text-sm font-medium text-kawa-700">Remise %</label>
          <input
            type="number"
            name="discount_rate"
            min={0}
            max={100}
            defaultValue={10}
            required
            className="mt-1 w-full border border-kawa-200 rounded-lg px-3 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-kawa-700">Lieu de livraison</label>
        <input
          type="text"
          name="delivery_address"
          placeholder="75 Bd Ernest Dalby, 44000 Nantes"
          className="mt-1 w-full border border-kawa-200 rounded-lg px-3 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-kawa-700">
          <input type="checkbox" name="active" defaultChecked className="rounded" />
          Active
        </label>

        <button
          type="submit"
          disabled={pending}
          className="bg-sky-500 text-kawa-950 px-4 py-2 rounded-lg font-medium hover:bg-sky-600 transition disabled:opacity-50"
        >
          {pending ? 'Ajout…' : "Ajouter l'entreprise"}
        </button>
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
          Entreprise ajoutée.
        </p>
      )}
    </form>
  )
}
