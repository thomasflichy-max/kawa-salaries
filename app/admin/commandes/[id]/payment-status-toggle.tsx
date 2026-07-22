'use client'

import { useTransition } from 'react'
import { setOrderPaidAction } from '../actions'
import { setManualOrderPaidAction } from '../manual-order-actions'

export function PaymentStatusToggle({
  orderId,
  source,
  paid,
}: {
  orderId: string
  source: 'demo' | 'manual'
  paid: boolean
}) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      if (source === 'manual') {
        await setManualOrderPaidAction(orderId, !paid)
      } else {
        await setOrderPaidAction(orderId, !paid)
      }
    })
  }

  return (
    <div className="flex items-center gap-2">
      <span
        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
          paid ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
        }`}
      >
        {paid ? 'Payée' : 'Non payée'}
      </span>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="text-xs text-sky-700 hover:underline disabled:opacity-50"
      >
        {isPending ? '…' : paid ? 'Marquer en attente' : 'Marquer payée'}
      </button>
    </div>
  )
}
