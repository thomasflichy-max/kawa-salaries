'use client'

import { useTransition } from 'react'
import type { DemoOrderStatus } from '@/app/admin/demo-data'
import { advanceOrderStatusAction } from './actions'
import { ORDER_STATUS_ACTION_ICONS } from './status-icons'

export function AdvanceStatusButton({
  orderId,
  status,
  label,
}: {
  orderId: string
  status: DemoOrderStatus
  label: string
}) {
  const [isPending, startTransition] = useTransition()
  const icon = ORDER_STATUS_ACTION_ICONS[status]

  function handleClick(e: React.MouseEvent) {
    // Rows navigate to the order detail on click — don't trigger that too.
    e.stopPropagation()
    startTransition(async () => {
      await advanceOrderStatusAction(orderId)
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      title={label}
      aria-label={label}
      className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-sky-500 text-kawa-950 hover:bg-sky-600 transition disabled:opacity-50"
    >
      {icon}
    </button>
  )
}
