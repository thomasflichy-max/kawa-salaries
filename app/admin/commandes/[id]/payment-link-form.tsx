'use client'

import { useState, useTransition } from 'react'
import {
  updateManualOrderPaymentLinkAction,
  sendManualOrderPaymentLinkEmailAction,
} from '../manual-order-actions'

export function PaymentLinkForm({
  orderId,
  initialLink,
  paid,
}: {
  orderId: string
  initialLink: string | null
  paid: boolean
}) {
  const [link, setLink] = useState(initialLink ?? '')
  const [savedLink, setSavedLink] = useState(initialLink ?? '')
  const [isSaving, startSaving] = useTransition()
  const [isSending, startSending] = useTransition()
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleSave() {
    setError(null)
    startSaving(async () => {
      try {
        await updateManualOrderPaymentLinkAction(orderId, link)
        setSavedLink(link)
        setSent(false)
      } catch {
        setError('Une erreur est survenue, merci de réessayer.')
      }
    })
  }

  function handleSend() {
    setError(null)
    startSending(async () => {
      try {
        await sendManualOrderPaymentLinkEmailAction(orderId)
        setSent(true)
      } catch {
        setError("L'envoi de l'email a échoué.")
      }
    })
  }

  const dirty = link !== savedLink

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-kawa-700">Lien de paiement</label>
      <div className="flex gap-2">
        <input
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://..."
          className="flex-1 border border-kawa-200 rounded-lg px-3 py-2 text-sm text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || !dirty}
          className="bg-kawa-800 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-kawa-900 transition disabled:opacity-50"
        >
          {isSaving ? '…' : 'Enregistrer'}
        </button>
      </div>
      <div>
        <button
          type="button"
          onClick={handleSend}
          disabled={isSending || !savedLink || dirty || paid}
          className="text-sm text-sky-700 hover:underline disabled:opacity-50 disabled:no-underline"
        >
          {isSending ? 'Envoi…' : 'Envoyer le lien par email'}
        </button>
        {sent && <span className="text-xs text-emerald-700 ml-2">Envoyé.</span>}
      </div>
      {error && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
    </div>
  )
}
