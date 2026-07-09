'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import { updateDefaultAddress } from '@/app/actions/auth'

type Address = { id: string; label: string; address: string }

export function DefaultAddressForm({
  addresses,
  defaultAddressId,
}: {
  addresses: Address[]
  defaultAddressId: string | null
}) {
  const [state, action, pending] = useActionState(updateDefaultAddress, undefined)
  const [selected, setSelected] = useState(defaultAddressId ?? '')

  if (addresses.length === 0) {
    return (
      <p className="text-sm text-kawa-500 max-w-sm">
        Aucun site n&apos;est encore enregistré pour votre entreprise — vos commandes seront
        retirées au bureau KAWA Nantes.
      </p>
    )
  }

  return (
    <form action={action} className="flex flex-col gap-3 max-w-sm">
      <div>
        <label className="text-sm font-medium text-kawa-700">Site de livraison par défaut</label>
        <select
          name="default_address_id"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="mt-1 w-full border border-kawa-200 rounded-lg px-4 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
        >
          <option value="">Retrait KAWA Nantes</option>
          {addresses.map((site) => (
            <option key={site.id} value={site.id}>
              {site.label} — {site.address}
            </option>
          ))}
        </select>
        <p className="text-xs text-kawa-400 mt-1">
          Tu pourras toujours choisir un autre site au moment de la commande.
        </p>
        {selected !== '' && (
          <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-2">
            Votre livraison sera effectuée lors de la prochaine commande de café de votre
            entreprise, est-ce que c&apos;est bon pour vous ?
          </p>
        )}
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
          Préférence enregistrée.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-start bg-sky-500 text-kawa-950 px-4 py-2 rounded-lg font-medium hover:bg-sky-600 transition disabled:opacity-50"
      >
        {pending ? 'Enregistrement…' : 'Enregistrer'}
      </button>
    </form>
  )
}
