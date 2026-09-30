'use client'

import { useState } from 'react'
import { useActionState } from 'react'
import { submitSupportMessage } from '@/app/actions/support'
import type { Dictionary } from '@/lib/i18n/dictionary'

// Reuses the same generic support inbox/email as the floating "Une question ?"
// button (there's no per-order thread yet — DEMO_ORDERS isn't a real,
// database-backed orders table), just pre-filling the message with the
// order reference so staff know which order it's about.
export function OrderContactButton({
  orderNumber,
  t,
  supportT,
}: {
  orderNumber: string
  t: Dictionary['orderContact']
  supportT: Dictionary['support']
}) {
  const [open, setOpen] = useState(false)
  const [state, action, pending] = useActionState(submitSupportMessage, undefined)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="self-start text-sm text-sky-700 hover:underline"
      >
        {t.cta}
      </button>

      {open && (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/30 p-4">
          <div className="bg-white rounded-2xl border border-kawa-200 p-6 w-full max-w-md">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="font-semibold text-kawa-800">{t.title(orderNumber)}</p>
                <p className="text-sm text-kawa-500 mt-1">{t.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={supportT.closeAriaLabel}
                className="text-kawa-400 hover:text-kawa-700 text-xl leading-none"
              >
                ×
              </button>
            </div>

            {state?.success ? (
              <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-4 py-3">
                {supportT.successMessage}
              </p>
            ) : (
              <form action={action} className="flex flex-col gap-3">
                <textarea
                  name="message"
                  required
                  rows={4}
                  defaultValue={t.defaultMessage(orderNumber)}
                  placeholder={t.placeholder}
                  className="w-full border border-kawa-200 rounded-lg px-4 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
                {state?.error && (
                  <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">
                    {state.error}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={pending}
                  className="bg-sky-500 text-kawa-950 py-2 rounded-lg font-medium hover:bg-sky-600 transition disabled:opacity-50"
                >
                  {pending ? supportT.sending : supportT.send}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
