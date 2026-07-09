'use client'

import { useTransition } from 'react'
import { updateOrderStatusAction } from './actions'
import { CheckIcon } from './status-icons'

export function MarkDeliveredButton({ orderId }: { orderId: string }) {
  const [isPending, startTransition] = useTransition()

  function handleClick(e: React.MouseEvent) {
    // Rows navigate to the order detail on click — don't trigger that too.
    e.stopPropagation()
    startTransition(async () => {
      await updateOrderStatusAction(orderId, 'livree')
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      title="Marquer livrée"
      aria-label="Marquer livrée"
      className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition disabled:opacity-50"
    >
      <CheckIcon />
    </button>
  )
}
