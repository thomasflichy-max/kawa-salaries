'use client'

import { useState, useTransition } from 'react'
import { deleteOrderAction } from './actions'

export function DeleteOrderButton({
  orderId,
  orderNumber,
}: {
  orderId: string
  orderNumber: string
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleClick = () => {
    if (
      !confirm(
        `Supprimer définitivement la commande ${orderNumber} ? Cette action est irréversible.`
      )
    ) {
      return
    }
    setError(null)
    startTransition(async () => {
      const result = await deleteOrderAction(orderId)
      // A successful delete redirects server-side and never returns here.
      if (result && !result.ok) {
        setError(result.error)
      }
    })
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="inline-flex items-center gap-2 rounded-lg border border-red-300 text-red-600 px-4 py-2 text-sm font-medium hover:bg-red-50 transition disabled:opacity-50"
      >
        {isPending ? 'Suppression…' : 'Supprimer la commande'}
      </button>
      {error && <p className="text-xs text-red-600 max-w-xs text-right">{error}</p>}
    </div>
  )
}
