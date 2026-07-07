'use client'

import { useState, useTransition } from 'react'
import { addToCart } from '@/app/actions/cart'

export function AddToCartButton({
  productId,
  quantity = 1,
  grindType = null,
}: {
  productId: string
  quantity?: number
  grindType?: string | null
}) {
  const [isPending, startTransition] = useTransition()
  const [justAdded, setJustAdded] = useState(false)

  function handleClick() {
    startTransition(async () => {
      await addToCart(productId, quantity, grindType)
      setJustAdded(true)
      setTimeout(() => setJustAdded(false), 2000)
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={`w-full py-2 rounded-lg font-medium transition disabled:opacity-50 ${
        justAdded ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-500 text-kawa-950 hover:bg-sky-600'
      }`}
    >
      {justAdded ? 'Ajouté au panier ✓' : isPending ? 'Ajout…' : 'Ajouter au panier'}
    </button>
  )
}
