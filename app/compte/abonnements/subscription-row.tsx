'use client'

import { useTransition } from 'react'
import { toggleSubscription, deleteSubscription, reorderSubscriptionNow } from '@/app/actions/subscriptions'
import type { Dictionary } from '@/lib/i18n/dictionary'

export function SubscriptionRow({
  id,
  active,
  t,
}: {
  id: string
  active: boolean
  t: Dictionary['abonnements']
}) {
  const [isPending, startTransition] = useTransition()

  function handleToggle() {
    startTransition(async () => {
      try {
        await toggleSubscription(id, !active)
      } catch {
        alert(t.updateFailed)
      }
    })
  }

  function handleReorderNow() {
    // No try/catch here: reorderSubscriptionNow ends with redirect(), which
    // Next.js implements by throwing — swallowing that would break the
    // redirect instead of reporting a real error.
    startTransition(() => {
      reorderSubscriptionNow(id)
    })
  }

  function handleDelete() {
    if (!confirm(t.confirmDelete)) return
    startTransition(async () => {
      try {
        await deleteSubscription(id)
      } catch {
        alert(t.deleteFailed)
      }
    })
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      <button
        type="button"
        onClick={handleReorderNow}
        disabled={isPending}
        className="text-sm bg-sky-500 text-kawa-950 px-3 py-1.5 rounded-lg font-medium hover:bg-sky-600 transition disabled:opacity-50"
      >
        {t.orderNow}
      </button>
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        className="text-sm border border-kawa-200 text-kawa-600 px-3 py-1.5 rounded-lg hover:bg-kawa-50 transition disabled:opacity-50"
      >
        {active ? t.pause : t.resume}
      </button>
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="text-sm text-red-600 hover:underline disabled:opacity-50"
      >
        {t.delete}
      </button>
    </div>
  )
}
