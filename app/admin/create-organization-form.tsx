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
    <form
      ref={formRef}
      action={action}
      className="flex flex-col sm:flex-row sm:items-end gap-3 flex-wrap"
    >
      <div className="flex-1 min-w-[160px]">
        <label className="text-sm font-medium text-kawa-700">Nom de l&apos;entreprise</label>
        <input
          type="text"
          name="name"
          placeholder="Colbert Assurances"
          required
          className="mt-1 w-full border border-kawa-200 rounded-lg px-3 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
      </div>

      <div className="flex-1 min-w-[180px]">
        <label className="text-sm font-medium text-kawa-700">Domaine email</label>
        <input
          type="text"
          name="domain"
          placeholder="colbertgroupe.com"
          required
          className="mt-1 w-full border border-kawa-200 rounded-lg px-3 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
      </div>

      <div className="w-24">
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

      <label className="flex items-center gap-2 text-sm text-kawa-700 pb-2">
        <input type="checkbox" name="active" defaultChecked className="rounded" />
        Active
      </label>

      <button
        type="submit"
        disabled={pending}
        className="bg-sky-500 text-kawa-950 px-4 py-2 rounded-lg font-medium hover:bg-sky-600 transition disabled:opacity-50"
      >
        {pending ? 'Ajout…' : 'Ajouter'}
      </button>

      {state?.error && (
        <p className="w-full text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
          {state.error}
        </p>
      )}
      {state?.success && (
        <p className="w-full text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
          Entreprise ajoutée.
        </p>
      )}
    </form>
  )
}
