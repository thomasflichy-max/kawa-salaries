'use client'

import { useState, useTransition } from 'react'
import { resendSignupConfirmation } from '@/app/admin/actions'

export function ResendConfirmationButton({ email }: { email: string }) {
  const [isPending, startTransition] = useTransition()
  const [result, setResult] = useState<{ error?: string; success?: boolean } | null>(null)

  function handleClick() {
    setResult(null)
    startTransition(async () => {
      const state = await resendSignupConfirmation(email)
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
        {isPending ? 'Envoi…' : 'Renvoyer le lien de création de compte'}
      </button>
      {result?.success && <span className="text-xs text-emerald-700">Email renvoyé.</span>}
      {result?.error && <span className="text-xs text-red-600">{result.error}</span>}
    </div>
  )
}
