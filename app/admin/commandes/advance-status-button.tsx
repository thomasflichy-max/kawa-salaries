'use client'

import { useTransition } from 'react'
import type { DemoOrderStatus } from '@/app/admin/demo-data'
import { advanceOrderStatusAction } from './actions'
import { ORDER_STATUS_ACTION_ICONS } from './status-icons'

// One button per row showing the order's CURRENT status — clicking it
// advances to the next one in the en_cours → en_preparation → pret → livree
// sequence. Once at "livree" (or "annulee", which sits outside this
// sequence entirely) there's no next status, so it's disabled: cancelling
// stays a deliberate action on the order detail page's status dropdown,
// not a one-click list shortcut.
export function AdvanceStatusButton({
  orderId,
  status,
  label,
  disabled,
}: {
  orderId: string
  status: DemoOrderStatus
  label: string
  disabled: boolean
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
      disabled={disabled || isPending}
      title={label}
      aria-label={label}
      className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-sky-500 text-kawa-950 hover:bg-sky-600 transition disabled:opacity-50 disabled:cursor-default"
    >
      {icon}
    </button>
  )
}
