'use client'

import { useActionState } from 'react'
import { updateCoffeePricing } from '@/app/admin/actions'

type Rule = { subcategory: string; base_price: number }

export function CoffeePricingForm({ rules }: { rules: Rule[] }) {
  const [state, action, pending] = useActionState(updateCoffeePricing, undefined)
  const classique = rules.find((r) => r.subcategory === 'classique')
  const bio = rules.find((r) => r.subcategory === 'bio')
  const decafeine = rules.find((r) => r.subcategory === 'decafeine')

  return (
    <form action={action} className="flex flex-col gap-4">
      <p className="text-sm text-kawa-500">
        Prix de base uniquement — la remise appliquée à chaque salarié dépend de la remise
        renseignée sur le compte de son entreprise (onglet Comptes).
      </p>
      <div className="grid sm:grid-cols-3 gap-4">
        <fieldset className="border border-kawa-200 rounded-lg p-4">
          <legend className="text-sm font-semibold text-kawa-800 px-1">Cafés classiques</legend>
          <label className="text-sm text-kawa-600 block mt-2">
            Prix de base (€)
            <input
              type="number"
              step="0.01"
              name="classique_base_price"
              defaultValue={classique?.base_price ?? 31.9}
              className="mt-1 w-full border border-kawa-200 rounded-lg px-3 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </label>
        </fieldset>

        <fieldset className="border border-kawa-200 rounded-lg p-4">
          <legend className="text-sm font-semibold text-kawa-800 px-1">Cafés bio</legend>
          <label className="text-sm text-kawa-600 block mt-2">
            Prix de base (€)
            <input
              type="number"
              step="0.01"
              name="bio_base_price"
              defaultValue={bio?.base_price ?? 31.9}
              className="mt-1 w-full border border-kawa-200 rounded-lg px-3 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </label>
        </fieldset>

        <fieldset className="border border-kawa-200 rounded-lg p-4">
          <legend className="text-sm font-semibold text-kawa-800 px-1">Cafés décaféinés</legend>
          <label className="text-sm text-kawa-600 block mt-2">
            Prix de base (€)
            <input
              type="number"
              step="0.01"
              name="decafeine_base_price"
              defaultValue={decafeine?.base_price ?? 34.9}
              className="mt-1 w-full border border-kawa-200 rounded-lg px-3 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </label>
        </fieldset>
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
          Tarifs mis à jour.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-start bg-sky-500 text-kawa-950 px-4 py-2 rounded-lg font-medium hover:bg-sky-600 transition disabled:opacity-50"
      >
        {pending ? 'Mise à jour…' : 'Mettre à jour les tarifs'}
      </button>
    </form>
  )
}
