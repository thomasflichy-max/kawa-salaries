'use client'

import { useActionState } from 'react'
import { updateProfile } from '@/app/actions/auth'
import type { Dictionary } from '@/lib/i18n/dictionary'

export function ProfileForm({
  fullName,
  billingAddress,
  t,
  common,
}: {
  fullName: string | null
  billingAddress: string | null
  t: Dictionary['profileForm']
  common: Dictionary['common']
}) {
  const [state, action, pending] = useActionState(updateProfile, undefined)

  return (
    <form action={action} className="flex flex-col gap-3 max-w-sm">
      <div>
        <label className="text-sm font-medium text-kawa-700">{t.fullName}</label>
        <input
          type="text"
          name="fullName"
          defaultValue={fullName ?? ''}
          required
          className="mt-1 w-full border border-kawa-200 rounded-lg px-4 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-kawa-700">{t.billingAddress}</label>
        <textarea
          name="billingAddress"
          defaultValue={billingAddress ?? ''}
          rows={2}
          required
          className="mt-1 w-full border border-kawa-200 rounded-lg px-4 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{state.error}</p>
      )}
      {state?.success && (
        <p className="text-sm text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">{t.updated}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-start bg-sky-500 text-kawa-950 px-4 py-2 rounded-lg font-medium hover:bg-sky-600 transition disabled:opacity-50"
      >
        {pending ? t.updating : common.save}
      </button>
    </form>
  )
}
