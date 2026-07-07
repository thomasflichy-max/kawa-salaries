'use client'

import { useTransition } from 'react'
import { deleteProduct } from './actions'

export function DeleteProductButton({ productId }: { productId: string }) {
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm('Supprimer définitivement ce produit ?')) return
    startTransition(async () => {
      try {
        await deleteProduct(productId)
      } catch {
        alert('Suppression impossible.')
      }
    })
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="text-red-600 hover:underline text-sm disabled:opacity-50"
    >
      {isPending ? '…' : 'Supprimer'}
    </button>
  )
}
