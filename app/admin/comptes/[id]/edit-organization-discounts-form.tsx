'use client'

import { useActionState } from 'react'
import { updateOrganizationDiscounts } from '@/app/admin/actions'
import { CoffeeHtPriceField } from '@/app/admin/coffee-ht-price-field'

export function EditOrganizationDiscountsForm({
  organizationId,
  basePrices,
  htClassique,
  htBio,
  decafeine,
}: {
  organizationId: string
  basePrices: { classique: number; bio: number }
  htClassique: number
  htBio: number
  decafeine: number
}) {
  const boundAction = updateOrganizationDiscounts.bind(null, organizationId)
  const [state, action, pending] = useActionState(boundAction, undefined)

  return (
    <form action={action} className="flex flex-col gap-4 p-5">
      <p className="text-xs text-kawa-400 -mt-1">
        Prix HT payé par l&apos;entreprise (€/kg) — la remise salarié en est déduite
        automatiquement.
      </p>
      <div className="grid sm:grid-cols-3 gap-4">
        <CoffeeHtPriceField
          name="ht_classique"
          label="Classique HT (€/kg)"
          basePriceTtc={basePrices.classique}
          defaultValue={htClassique}
        />
        <CoffeeHtPriceField
          name="ht_bio"
          label="Bio HT (€/kg)"
          basePriceTtc={basePrices.bio}
          defaultValue={htBio}
          placeholder="26.00"
        />
        <div>
          <label className="text-xs text-kawa-500">Décaféiné — remise (€)</label>
          <input
            type="number"
            name="discount_decafeine"
            min={0}
            step="0.01"
            defaultValue={decafeine}
            required
            className="mt-1 w-full border border-kawa-200 rounded-lg px-3 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
          <p className="text-xs text-kawa-400 mt-1">
            Pas de tarif B2B pour ce format — remise fixe.
          </p>
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
