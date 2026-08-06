'use client'

import { useState, useTransition } from 'react'
import { logSupportReply } from './reply-actions'

export function ReplyBox({ email }: { email: string }) {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-block mt-2 text-xs text-sky-700 hover:underline"
      >
        Répondre par email
      </button>
    )
  }

  const send = () => {
    const trimmed = message.trim()
    if (!trimmed) {
      setError('Merci de saisir une réponse.')
      return
    }
    setError(null)

    // window.open must run synchronously in the click handler or popup
    // blockers kill it — so open Gmail first and log the reply afterwards,
    // fire-and-forget, rather than awaiting the server action first.
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(
      email
    )}&su=${encodeURIComponent('Re: votre question KAWA')}&body=${encodeURIComponent(trimmed)}`
    window.open(gmailUrl, '_blank', 'noopener,noreferrer')

    setOpen(false)
    setMessage('')

    startTransition(async () => {
      const result = await logSupportReply(email, trimmed)
      if (!result.ok) {
        console.error('[ReplyBox] logSupportReply failed:', result.error)
      }
    })
  }

  return (
    <div className="mt-2 flex flex-col gap-2 max-w-md">
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        placeholder="Votre réponse..."
        autoFocus
        className="text-sm rounded-lg border border-kawa-200 p-2 focus:outline-none focus:ring-2 focus:ring-sky-300"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={send}
          className="text-xs bg-sky-600 text-white rounded-full px-3 py-1.5 hover:bg-sky-700"
        >
          Envoyer et ouvrir Gmail
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false)
            setError(null)
          }}
          className="text-xs text-kawa-400 hover:underline"
        >
          Annuler
        </button>
      </div>
    </div>
  )
}
