'use client'

import { useActionState } from 'react'
import { updateOrganizationInfo } from '@/app/admin/actions'

export function EditOrganizationInfoForm({
  organizationId,
  name,
  domain,
  additionalDomains,
  active,
}: {
  organizationId: string
  name: string
  domain: string
  additionalDomains: string[]
  active: boolean
}) {
  const boundAction = updateOrganizationInfo.bind(null, organizationId)
  const [state, action, pending] = useActionState(boundAction, undefined)

  return (
    <form action={action} className="flex flex-col gap-4 p-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-kawa-700">Nom de l&apos;entreprise</label>
          <input
            type="text"
            name="name"
            defaultValue={name}
            required
            className="mt-1 w-full border border-kawa-200 rounded-lg px-3 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-kawa-700">Domaine email principal (sans le @)</label>
          <input
            type="text"
            name="domain"
            defaultValue={domain}
            required
            className="mt-1 w-full border border-kawa-200 rounded-lg px-3 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-kawa-700">
          Autres domaines email{' '}
          <span className="text-kawa-400 font-normal">
            (un par ligne — pour une entité qui a plusieurs domaines)
          </span>
        </label>
        <textarea
          name="additional_domains"
          defaultValue={additionalDomains.join('\n')}
          rows={Math.max(2, additionalDomains.length + 1)}
          placeholder="altavia-nantes.com"
          className="mt-1 w-full border border-kawa-200 rounded-lg px-3 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-sm text-kawa-700">
          <input type="checkbox" name="active" defaultChecked={active} className="rounded" />
          Active
        </label>
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
          Informations mises à jour.
        </p>
      )}
    </form>
  )
}
