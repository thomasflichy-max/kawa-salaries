'use client'

import { useActionState } from 'react'
import { updateOrganizationDiscounts } from '@/app/admin/actions'

export function EditOrganizationDiscountsForm({
  organizationId,
  classique,
  bio,
  decafeine,
}: {
  organizationId: string
  classique: number
  bio: number
  decafeine: number
}) {
  const boundAction = updateOrganizationDiscounts.bind(null, organizationId)
  const [state, action, pending] = useActionState(boundAction, undefined)

  return (
    <form action={action} className="flex flex-col gap-4 p-5">
      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="text-xs text-kawa-500">Classique (€)</label>
          <input
            type="number"
            name="discount_classique"
            min={0}
            step="0.01"
            defaultValue={classique}
            required
            className="mt-1 w-full border border-kawa-200 rounded-lg px-3 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>
        <div>
          <label className="text-xs text-kawa-500">Bio (€)</label>
          <input
            type="number"
            name="discount_bio"
            min={0}
            step="0.01"
            defaultValue={bio}
            required
            className="mt-1 w-full border border-kawa-200 rounded-lg px-3 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>
        <div>
          <label className="text-xs text-kawa-500">Décaféiné (€)</label>
          <input
            type="number"
            name="discount_decafeine"
            min={0}
            step="0.01"
            defaultValue={decafeine}
            required
            className="mt-1 w-full border border-kawa-200 rounded-lg px-3 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>
      </div>

      <div className="flex items-center justify-end">
        <button
          type="submit"
          disabled={pending}
          className="bg-sky-500 text-kawa-950 px-4 py-2 rounded-lg font-medium hover:bg-sky-600 transition disabled:opacity-50"
        >
          {pending ? 'Enregistrement…' : 'Mettre à jour'}
        </button>
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
          Tarifs mis à jour.
        </p>
      )}
    </form>
  )
}
