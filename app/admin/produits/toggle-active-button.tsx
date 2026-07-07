'use client'

import { useTransition } from 'react'
import { toggleProductActive } from './actions'

export function ToggleActiveButton({
  productId,
  active,
}: {
  productId: string
  active: boolean
}) {
  const [isPending, startTransition] = useTransition()

  function handleToggle() {
    startTransition(async () => {
      try {
        await toggleProductActive(productId, !active)
      } catch {
        alert('Mise à jour impossible.')
      }
    })
  }

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium disabled:opacity-50 ${
        active ? 'bg-emerald-50 text-emerald-700' : 'bg-kawa-100 text-kawa-600'
      }`}
    >
      {active ? 'Actif' : 'Inactif'}
    </button>
  )
}
