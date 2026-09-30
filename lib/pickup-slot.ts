// Dependency-free (used by both server components and email renderers) —
// the only cross-import is the `Locale` type, erased at compile time.
// Pickups are weekdays 09h-18h; a slot is a day + a 1h window whose start
// hour is stored in orders.pickup_slot_hour (9..17).

import type { Locale } from './i18n/locale'

export const PICKUP_SLOT_HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17] as const

export function pickupSlotHourLabel(hour: number) {
  return `${hour}h – ${hour + 1}h`
}

// "jeudi 11 septembre, 14h – 15h" — defaults to French since emails and
// the admin dashboard/order pages call this with no locale and must stay
// French regardless of what an employee has chosen for their own view.
export function formatPickupSlot(
  date: string | null | undefined,
  hour: number | null | undefined,
  locale: Locale = 'fr'
) {
  if (!date || hour == null) return null
  const d = new Date(`${date}T00:00:00`)
  const day = new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'Europe/Paris',
  }).format(d)
  return `${day}, ${pickupSlotHourLabel(hour)}`
}

// Next `count` weekdays starting tomorrow, as YYYY-MM-DD (Europe/Paris) —
// same-day pickup slots aren't offered, so staff always has at least a
// night's notice to prepare an order.
export function upcomingWeekdays(count: number, from = new Date()) {
  const out: string[] = []
  const cursor = new Date(from)
  cursor.setDate(cursor.getDate() + 1)
  while (out.length < count) {
    const iso = new Intl.DateTimeFormat('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'Europe/Paris',
    }).format(cursor)
    const weekday = new Date(`${iso}T12:00:00`).getUTCDay() // 0 Sun .. 6 Sat
    if (weekday !== 0 && weekday !== 6) out.push(iso)
    cursor.setDate(cursor.getDate() + 1)
  }
  return out
}

export function weekdayLabel(iso: string, locale: Locale = 'fr') {
  return new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'Europe/Paris',
  }).format(new Date(`${iso}T12:00:00`))
}
