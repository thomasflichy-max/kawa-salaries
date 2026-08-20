'use client'

import { useState, useTransition } from 'react'
import type { AdminOrderRefund } from '@/app/admin/commandes/manual-orders'
import { refundOrderAction, regenerateRefundCertificateAction } from './actions'

const currency = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short' })

// Only shown when a refund's numbering/PDF archiving failed right after
// mintDocumentNumber() ran (see lib/order-documents.tsx) — the certificate
// is still downloadable via the on-the-fly route below either way, this
// just fixes the missing AVOIR-{year}-{seq} archive.
function RegenerateRefundButton({ orderId, refundId }: { orderId: string; refundId: string }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  return (
    <span className="inline-flex items-center gap-1">
      <button
        type="button"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            setError(null)
            const result = await regenerateRefundCertificateAction(orderId, refundId)
            if (!result.ok) setError(result.error)
          })
        }
        className="text-xs text-amber-700 underline shrink-0 disabled:opacity-50"
      >
        {isPending ? 'Régénération…' : 'Régénérer le numéro'}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </span>
  )
}

export function RefundForm({
  orderId,
  amount,
  refunds,
  isRealCawlOrder,
}: {
  orderId: string
  amount: number
  refunds: AdminOrderRefund[]
  isRealCawlOrder: boolean
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
    const confirmMessage = isRealCawlOrder
      ? `Confirmer un remboursement de ${currency.format(parsedAmount)} (${reason.trim()}) ? La carte du salarié sera remboursée via CAWL.`
      : `Confirmer un remboursement de ${currency.format(parsedAmount)} (${reason.trim()}) ? Cette commande n'est pas passée par CAWL — aucun virement ne sera déclenché, ça garde juste une trace.`
    if (!confirm(confirmMessage)) {
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
                  {refund.refundNumber && `${refund.refundNumber} — `}
                  {currency.format(refund.amount)} — {refund.reason}
                </p>
                <p className="text-xs text-red-500">
                  {dateFormat.format(new Date(refund.at))} par {refund.actor}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <a
                  href={`/admin/commandes/${orderId}/remboursement/${refund.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-red-700 underline"
                >
                  Justificatif PDF
                </a>
                {!refund.refundNumber && (
                  <RegenerateRefundButton orderId={orderId} refundId={refund.id} />
                )}
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
            Solde restant remboursable : {currency.format(remaining)}.{' '}
            {isRealCawlOrder
              ? 'Déclenche un vrai remboursement sur la carte du salarié via CAWL, en plus de garder une trace de qui a remboursé, quand, combien et pourquoi.'
              : "Cette commande n'est pas passée par CAWL (paiement manuel) — ça garde juste une trace de qui a remboursé, quand, combien et pourquoi."}
          </p>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}
        </div>
      )}
    </div>
  )
}
