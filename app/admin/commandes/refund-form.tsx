'use client'

import { useState, useTransition } from 'react'
import type { DemoOrderItem, DemoOrderRefund } from '@/app/admin/demo-data'
import { refundOrderAction } from './actions'

const currency = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short' })

export function RefundForm({
  orderId,
  amount,
  items,
  refunds,
}: {
  orderId: string
  amount: number
  items: DemoOrderItem[]
  refunds: DemoOrderRefund[]
}) {
  const alreadyRefunded = refunds.reduce((sum, r) => sum + r.amount, 0)
  const remaining = Math.max(0, amount - alreadyRefunded)
  const [amountInput, setAmountInput] = useState(remaining ? remaining.toFixed(2) : '')
  const [reason, setReason] = useState('')
  const [isPending, startTransition] = useTransition()

  const parsedAmount = Number(amountInput.replace(',', '.'))
  const canSubmit = parsedAmount > 0 && parsedAmount <= remaining + 0.005 && reason.trim().length > 0

  function handleSubmit() {
    if (!canSubmit) return
    if (
      !confirm(
        `Confirmer un remboursement de ${currency.format(parsedAmount)} (${reason.trim()}) ? Aucun virement ne sera déclenché.`
      )
    ) {
      return
    }
    startTransition(async () => {
      await refundOrderAction(orderId, parsedAmount, reason.trim())
      setReason('')
      setAmountInput('')
    })
  }

  return (
    <div className="flex flex-col gap-4">
      {refunds.length > 0 && (
        <ul className="flex flex-col gap-2">
          {refunds.map((refund) => (
            <li
              key={refund.id}
              className="flex items-center justify-between gap-3 bg-red-50 rounded-lg px-3 py-2 text-sm"
            >
              <div>
                <p className="text-red-700 font-medium">
                  {currency.format(refund.amount)} — {refund.reason}
                </p>
                <p className="text-xs text-red-500">
                  {dateFormat.format(new Date(refund.at))} par {refund.actor}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {remaining <= 0.005 ? (
        <p className="text-sm text-kawa-500">
          Commande intégralement remboursée ({currency.format(alreadyRefunded)}).
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {items.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {items.map((item) => {
                const lineTotal = item.unitPriceTTC * item.quantity
                if (lineTotal > remaining + 0.005) return null
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setAmountInput(lineTotal.toFixed(2))
                      setReason(`Article manquant/erroné : ${item.productName}`)
                    }}
                    className="text-xs bg-white border border-kawa-200 text-kawa-600 rounded-full px-3 py-1 hover:border-sky-400 hover:text-sky-700 transition"
                  >
                    Rembourser « {item.productName} » ({currency.format(lineTotal)})
                  </button>
                )
              })}
            </div>
          )}

          <div className="flex flex-wrap items-end gap-2">
            <div>
              <label className="block text-xs text-kawa-500 mb-1">Montant à rembourser</label>
              <input
                type="text"
                inputMode="decimal"
                value={amountInput}
                onChange={(e) => setAmountInput(e.target.value)}
                placeholder={currency.format(remaining)}
                className="w-32 border border-kawa-200 rounded-lg px-3 py-2 text-sm text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs text-kawa-500 mb-1">Motif</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ex : article manquant, erreur de commande…"
                className="w-full border border-kawa-200 rounded-lg px-3 py-2 text-sm text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit || isPending}
              className="bg-white border border-red-300 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-50 transition disabled:opacity-50"
            >
              {isPending ? 'Enregistrement…' : 'Enregistrer le remboursement'}
            </button>
          </div>
          <p className="text-xs text-kawa-400">
            Solde restant remboursable : {currency.format(remaining)}. Ne déclenche aucun virement —
            il n&apos;y a pas encore de module de paiement. Ça garde juste une trace de qui a
            remboursé, quand, combien et pourquoi.
          </p>
        </div>
      )}
    </div>
  )
}
