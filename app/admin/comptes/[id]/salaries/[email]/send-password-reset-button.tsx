'use client'

import { useState, useTransition } from 'react'
import { sendPasswordResetForEmployee } from '@/app/admin/actions'

export function SendPasswordResetButton({ email }: { email: string }) {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ error?: string; success?: boolean } | null>(null)

  function handleClick() {
    setResult(null)
    startTransition(async () => {
      const state = await sendPasswordResetForEmployee(email)
      setResult(state ?? null)
    })
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="text-sm text-sky-700 hover:underline disabled:opacity-50"
      >
        {isPending ? 'Envoi…' : 'Envoyer un lien de réinitialisation du mot de passe'}
      </button>
      {result?.success && <span className="text-xs text-emerald-700">Email envoyé.</span>}
      {result?.error && <span className="text-xs text-red-600">{result.error}</span>}
    </div>
  )
}
