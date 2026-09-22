'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useActionState } from 'react'
import { createSubscription } from '@/app/actions/subscriptions'
import { FREQUENCY_WEEKS } from '@/lib/subscription-frequency'

const FREQUENCY_LABELS: Record<number, string> = {
  2: 'Toutes les 2 semaines',
  4: 'Tous les mois',
  6: 'Toutes les 6 semaines',
  8: 'Tous les 2 mois',
}

const GRINDS = [
  { value: 'grain', label: 'En grains' },
  { value: 'filtre', label: 'Moulu filtre' },
  { value: 'espresso', label: 'Moulu espresso' },
] as const

export function SubscribeForm({
  productId,
  showGrind = false,
}: {
  productId: string
  showGrind?: boolean
}) {
  const [open, setOpen] = useState(false)
  const [grind, setGrind] = useState<(typeof GRINDS)[number]['value']>('grain')
  const [state, action, pending] = useActionState(createSubscription, undefined)

  if (state && 'success' in state) {
    return (
      <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
        Abonnement créé — on vous enverra un rappel à chaque échéance.{' '}
        <Link href="/compte/abonnements" className="underline font-medium">
          Gérer mes abonnements
        </Link>
      </p>
    )
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full py-2.5 rounded-lg font-medium border-2 border-sky-500 text-sky-700 hover:bg-sky-50 transition"
      >
        Créer un abonnement →
      </button>
    )
  }

  return (
    <form action={action} className="flex flex-col gap-3 border border-kawa-200 rounded-lg p-4">
      <input type="hidden" name="product_id" value={productId} />
      <input type="hidden" name="quantity" value={1} />
      {showGrind && <input type="hidden" name="grind_type" value={grind} />}

      <p className="text-sm font-medium text-kawa-700">Réassort automatique</p>
      <p className="text-xs text-kawa-400 -mt-1">
        On ajoute ce café à votre panier et on vous envoie un email à chaque échéance — vous
        choisissez la livraison et payez comme pour une commande normale.
      </p>

      {showGrind && (
        <div>
          <label className="text-xs text-kawa-500">Mouture</label>
          <div className="mt-1 flex flex-wrap gap-2">
            {GRINDS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setGrind(option.value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
                  grind === option.value
                    ? 'border-sky-500 bg-sky-50 text-sky-700'
                    : 'border-kawa-200 text-kawa-600 hover:border-kawa-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="text-xs text-kawa-500">Fréquence</label>
        <select
          name="frequency_weeks"
          defaultValue={4}
          className="mt-1 w-full border border-kawa-200 rounded-lg px-3 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
        >
          {FREQUENCY_WEEKS.map((weeks) => (
            <option key={weeks} value={weeks}>
              {FREQUENCY_LABELS[weeks]}
            </option>
          ))}
        </select>
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{state.error}</p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="bg-sky-500 text-kawa-950 px-4 py-2 rounded-lg font-medium hover:bg-sky-600 transition disabled:opacity-50"
        >
          {pending ? 'Création…' : "Créer l'abonnement"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-sm text-kawa-500 hover:underline"
        >
          Annuler
        </button>
      </div>
    </form>
  )
}
