'use client'

import { useTransition } from 'react'
import { updateOrderStatusAction } from './actions'
import { XIcon } from './status-icons'

export function CancelOrderButton({ orderId }: { orderId: string }) {
  const [isPending, startTransition] = useTransition()

  function handleClick(e: React.MouseEvent) {
    // Rows navigate to the order detail on click — don't trigger that too.
    e.stopPropagation()
    if (!confirm('Confirmer l’annulation de cette commande ?')) return
    startTransition(async () => {
      await updateOrderStatusAction(orderId, 'annulee')
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      title="Annuler la commande"
      aria-label="Annuler la commande"
      className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-50"
    >
      <XIcon />
    </button>
  )
}
