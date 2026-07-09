'use client'

import { useTransition } from 'react'
import { refundOrderAction } from './actions'

export function RefundOrderButton({ orderId }: { orderId: string }) {
  const [isPending, startTransition] = useTransition()

  function handleRefund() {
    if (!confirm('Confirmer que cette commande a été remboursée ?')) return
    startTransition(async () => {
      await refundOrderAction(orderId)
    })
  }

  return (
    <button
      onClick={handleRefund}
      disabled={isPending}
      className="bg-white border border-red-300 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-50 transition disabled:opacity-50"
    >
      {isPending ? 'Enregistrement…' : 'Marquer comme remboursée'}
    </button>
  )
}
