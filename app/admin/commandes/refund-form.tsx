'use client'

import { useState, useTransition } from 'react'
import type { DemoOrderRefund } from '@/app/admin/demo-data'
import { refundOrderAction } from './actions'

const currency = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short' })

export function RefundForm({
  orderId,
  amount,
  refunds,
}: {
  orderId: string
  amount: number
  refunds: DemoOrderRefund[]
}) {
  const alreadyRefunded = refunds.reduce((sum, r) => sum + r.amount, 0)
  const remaining = Math.max(0, amount - alreadyRefunded)
  const [amountInput, setAmountInput] = useState(remaining ? remaining.toFixed(2) : '')
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
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
    setError(null)
    startTransition(async () => {
      try {
        await refundOrderAction(orderId, parsedAmount, reason.trim())
        setReason('')
        setAmountInput('')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue, merci de réessayer.')
      }
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
            Solde restant remboursable : {currency.format(remaining)}. N&apos;appelle pas encore
            CAWL pour déclencher un vrai remboursement bancaire — ça garde juste une trace de qui a
            remboursé, quand, combien et pourquoi.
          </p>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}
        </div>
      )}
    </div>
  )
}
