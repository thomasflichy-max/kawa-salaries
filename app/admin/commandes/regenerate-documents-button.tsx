'use client'

import { useState, useTransition } from 'react'
import { regenerateOrderDocumentsAction } from './actions'
import { Tooltip } from '@/app/admin/tooltip'

// Only ever shown when a paid real order's invoiceNumber is still null —
// see lib/order-documents.tsx for why that can happen (numbering succeeded,
// PDF rendering/upload failed right after) and app/admin/securite/evenements
// for the alert that fires when it does.
export function RegenerateDocumentsButton({ orderId }: { orderId: string }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleClick = () => {
    setError(null)
    startTransition(async () => {
      const result = await regenerateOrderDocumentsAction(orderId)
      if (!result.ok) setError(result.error)
    })
  }

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Tooltip
        label={error ?? 'Numéro de facture/BL manquant — cliquer pour régénérer'}
        align="right"
      >
        <button
          type="button"
          onClick={handleClick}
          disabled={isPending}
          aria-label="Régénérer la facture et le bon de livraison"
          className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 transition disabled:opacity-50"
        >
          {isPending ? '…' : '↻'}
        </button>
      </Tooltip>
    </div>
  )
}
