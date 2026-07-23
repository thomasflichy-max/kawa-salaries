'use client'

import { useActionState, useState } from 'react'
import { updateOrganizationSites } from '@/app/admin/actions'

type Site = { id: string | null; label: string; address: string }

export function EditOrganizationSitesForm({
  organizationId,
  initialSites,
}: {
  organizationId: string
  initialSites: Site[]
}) {
  const boundAction = updateOrganizationSites.bind(null, organizationId)
  const [state, action, pending] = useActionState(boundAction, undefined)
  const [sites, setSites] = useState<Site[]>(
    initialSites.length > 0 ? initialSites : [{ id: null, label: '', address: '' }]
  )

  function updateSite(index: number, field: 'label' | 'address', value: string) {
    setSites((prev) => prev.map((site, i) => (i === index ? { ...site, [field]: value } : site)))
  }

  return (
    <form action={action} className="flex flex-col gap-3 p-5">
      {sites.map((site, index) => (
        <div key={site.id ?? `new-${index}`} className="flex flex-wrap gap-3 items-start">
          <input type="hidden" name="site_id" value={site.id ?? ''} />
          <input
            type="text"
            name="site_label"
            value={site.label}
            onChange={(e) => updateSite(index, 'label', e.target.value)}
            placeholder="Siège social"
            className="w-full sm:w-1/3 border border-kawa-200 rounded-lg px-3 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
          <input
            type="text"
            name="site_address"
            value={site.address}
            onChange={(e) => updateSite(index, 'address', e.target.value)}
            placeholder="75 Bd Ernest Dalby, 44000 Nantes"
            className="flex-1 border border-kawa-200 rounded-lg px-3 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
          {sites.length > 1 && (
            <button
              type="button"
              onClick={() => setSites((prev) => prev.filter((_, i) => i !== index))}
              className="text-sm text-red-600 hover:underline px-2 py-2"
            >
              Retirer
            </button>
          )}
        </div>
      ))}
      <button
        type="button"
        onClick={() => setSites((prev) => [...prev, { id: null, label: '', address: '' }])}
        className="text-sm text-sky-700 hover:underline w-fit"
      >
        + Ajouter un site
      </button>

      <div className="flex items-center justify-end mt-2">
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
          Sites mis à jour.
        </p>
      )}
    </form>
  )
}
