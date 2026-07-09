'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { createOrganization } from '@/app/admin/actions'

type Site = { label: string; address: string }

export function CreateOrganizationForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [state, action, pending] = useActionState(createOrganization, undefined)
  const [sites, setSites] = useState<Site[]>([{ label: '', address: '' }])

  // Imperative DOM reset stays in an effect (that's what effects are for);
  // it doesn't call setState so it doesn't trip the set-state-in-effect rule.
  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset()
    }
  }, [state])

  // Resetting the `sites` array on success is a state adjustment driven by a
  // state change, so it's done during render (React's documented pattern),
  // not in a useEffect.
  const [lastHandledState, setLastHandledState] = useState(state)
  if (state !== lastHandledState) {
    setLastHandledState(state)
    if (state?.success) {
      setSites([{ label: '', address: '' }])
    }
  }

  function updateSite(index: number, field: keyof Site, value: string) {
    setSites((prev) => prev.map((site, i) => (i === index ? { ...site, [field]: value } : site)))
  }

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
          <label className="text-sm font-medium text-kawa-700">Domaine email (sans le @)</label>
          <input
            type="text"
            name="domain"
            placeholder="colbertgroupe.com"
            required
            className="mt-1 w-full border border-kawa-200 rounded-lg px-3 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-kawa-700">Mail type d&apos;un salarié</label>
        <input
          type="email"
          name="sample_email"
          placeholder="jean.dupont@colbertgroupe.com"
          className="mt-1 w-full border border-kawa-200 rounded-lg px-3 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
      </div>

      <div>
        <p className="text-sm font-medium text-kawa-700 mb-2">
          Remise par sous-catégorie de café (€ déduits du prix de base)
        </p>
        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs text-kawa-500">Classique (€)</label>
            <input
              type="number"
              name="discount_classique"
              min={0}
              step="0.01"
              defaultValue={3}
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
              defaultValue={3}
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
              defaultValue={3}
              required
              className="mt-1 w-full border border-kawa-200 rounded-lg px-3 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-kawa-700 mb-2">
          Sites de livraison{' '}
          <span className="text-kawa-400 font-normal">
            (siège, agences… le salarié pourra aussi choisir un retrait KAWA Nantes)
          </span>
        </p>
        <div className="flex flex-col gap-3">
          {sites.map((site, index) => (
            <div key={index} className="flex gap-3 items-start">
              <input
                type="text"
                name="site_label"
                value={site.label}
                onChange={(e) => updateSite(index, 'label', e.target.value)}
                placeholder="Siège social"
                className="w-1/3 border border-kawa-200 rounded-lg px-3 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
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
        </div>
        <button
          type="button"
          onClick={() => setSites((prev) => [...prev, { label: '', address: '' }])}
          className="mt-2 text-sm text-sky-700 hover:underline"
        >
          + Ajouter un site
        </button>
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
