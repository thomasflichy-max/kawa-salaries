'use client'

import { useActionState, useState } from 'react'
import { setPickupSlotAction } from './actions'
import { PICKUP_SLOT_HOURS, pickupSlotHourLabel, weekdayLabel, formatPickupSlot } from '@/lib/pickup-slot'
import type { Dictionary } from '@/lib/i18n/dictionary'
import type { Locale } from '@/lib/i18n/locale'

export function PickupScheduler({
  token,
  dates,
  currentDate,
  currentHour,
  t,
  locale,
}: {
  token: string
  dates: string[]
  currentDate: string | null
  currentHour: number | null
  t: Dictionary['pickupScheduler']
  locale: Locale
}) {
  const [state, action, pending] = useActionState(setPickupSlotAction, undefined)
  const [date, setDate] = useState(currentDate ?? dates[0])
  const [hour, setHour] = useState(currentHour ?? 9)
  const [savedLabel, setSavedLabel] = useState<string | null>(
    formatPickupSlot(currentDate, currentHour, locale)
  )

  const [lastHandled, setLastHandled] = useState(state)
  if (state !== lastHandled) {
    setLastHandled(state)
    if (state?.success) setSavedLabel(formatPickupSlot(date, hour, locale))
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="token" value={token} />

      {savedLabel && (
        <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
          {t.savedPrefix} <strong>{savedLabel}</strong>. {t.savedSuffix}
        </p>
      )}

      <div>
        <label className="text-sm font-medium text-kawa-700">{t.dayLabel}</label>
        <select
          name="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mt-1 w-full border border-kawa-200 rounded-lg px-3 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
        >
          {dates.map((d) => (
            <option key={d} value={d}>
              {weekdayLabel(d, locale).replace(/^\w/, (c) => c.toUpperCase())}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-kawa-700">{t.hourLabel}</label>
        <select
          name="hour"
          value={hour}
          onChange={(e) => setHour(Number(e.target.value))}
          className="mt-1 w-full border border-kawa-200 rounded-lg px-3 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
        >
          {PICKUP_SLOT_HOURS.map((h) => (
            <option key={h} value={h}>
              {pickupSlotHourLabel(h)}
            </option>
          ))}
        </select>
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-start bg-sky-500 text-kawa-950 px-5 py-2.5 rounded-lg font-medium hover:bg-sky-600 transition disabled:opacity-50"
      >
        {pending ? t.saving : savedLabel ? t.edit : t.confirm}
      </button>
    </form>
  )
}
