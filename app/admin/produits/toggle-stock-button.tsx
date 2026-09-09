'use client'

import { useTransition } from 'react'
import { toggleProductInStock } from './actions'

export function ToggleStockButton({
  productId,
  inStock,
}: {
  productId: string
  inStock: boolean
}) {
  const [isPending, startTransition] = useTransition()

  function handleToggle() {
    startTransition(async () => {
      try {
        await toggleProductInStock(productId, !inStock)
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
        inStock ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
      }`}
    >
      {inStock ? 'En stock' : 'Rupture'}
    </button>
  )
}
