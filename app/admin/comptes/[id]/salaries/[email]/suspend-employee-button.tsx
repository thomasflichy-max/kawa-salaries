'use client'

import { useState, useTransition } from 'react'
import { suspendEmployee } from '@/app/admin/actions'

export function SuspendEmployeeButton({
  profileId,
  isSuspended,
  organizationId,
  email,
}: {
  profileId: string
  isSuspended: boolean
  organizationId: string
  email: string
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleClick() {
    if (
      !isSuspended &&
      !confirm(
        'Suspendre ce compte ? Le salarié sera immédiatement déconnecté et ne pourra plus commander.'
      )
    ) {
      return
    }
    setError(null)
    startTransition(async () => {
      const state = await suspendEmployee(profileId, !isSuspended, organizationId, email)
      if (state?.error) {
        setError(state.error)
      }
    })
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className={`text-sm hover:underline disabled:opacity-50 ${
          isSuspended ? 'text-emerald-700' : 'text-red-600'
        }`}
      >
        {isPending ? 'Mise à jour…' : isSuspended ? 'Réactiver ce compte' : 'Suspendre ce compte'}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  )
}
