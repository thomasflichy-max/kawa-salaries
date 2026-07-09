'use client'

import { useState, useTransition } from 'react'
import { DEMO_ORDER_STATUS_LABELS, type DemoOrderStatus } from '@/app/admin/demo-data'
import { updateOrderStatusAction } from './actions'

const STATUS_ORDER: DemoOrderStatus[] = [
  'en_cours',
  'en_preparation',
  'pret',
  'livree',
  'annulee',
]

export function StatusUpdateForm({
  orderId,
  status,
}: {
  orderId: string
  status: DemoOrderStatus
}) {
  const [selected, setSelected] = useState<DemoOrderStatus>(status)
  const [isPending, startTransition] = useTransition()

  function handleUpdate() {
    if (selected === status) return
    if (selected === 'annulee' && !confirm('Confirmer l’annulation de cette commande ?')) return
    startTransition(async () => {
      await updateOrderStatusAction(orderId, selected)
    })
  }

  return (
    <div className="flex items-center gap-3">
      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value as DemoOrderStatus)}
        className="border border-kawa-200 rounded-lg px-3 py-2 text-sm text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
      >
        {STATUS_ORDER.map((s) => (
          <option key={s} value={s}>
            {DEMO_ORDER_STATUS_LABELS[s]}
          </option>
        ))}
      </select>
      <button
        onClick={handleUpdate}
        disabled={isPending || selected === status}
        className="bg-sky-500 text-kawa-950 px-4 py-2 rounded-lg font-medium hover:bg-sky-600 transition disabled:opacity-50"
      >
        {isPending ? 'Mise à jour…' : 'Update'}
      </button>
    </div>
  )
}
