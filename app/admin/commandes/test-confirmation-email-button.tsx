'use client'

import { useState, useTransition } from 'react'
import { sendTestOrderConfirmationEmailAction } from './actions'

export function TestConfirmationEmailButton({ orderId }: { orderId: string }) {
  const [isPending, startTransition] = useTransition()
  const [sent, setSent] = useState(false)

  function handleSend() {
    setSent(false)
    startTransition(async () => {
      await sendTestOrderConfirmationEmailAction(orderId)
      setSent(true)
    })
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={handleSend}
        disabled={isPending}
        className="bg-white border border-kawa-200 text-kawa-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-kawa-50 transition disabled:opacity-50"
      >
        {isPending ? 'Envoi…' : 'Envoyer un mail de test (à moi)'}
      </button>
      {sent && <span className="text-xs text-emerald-600">Envoyé — vérifie ta boîte mail.</span>}
    </div>
  )
}
