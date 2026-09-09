// Dependency-free (used by both server components and email renderers).
// Pickups are weekdays 09h-18h; a slot is a day + a 1h window whose start
// hour is stored in orders.pickup_slot_hour (9..17).

export const PICKUP_SLOT_HOURS = [9, 10, 11, 12, 13, 14, 15, 16, 17] as const

export function pickupSlotHourLabel(hour: number) {
  return `${hour}h – ${hour + 1}h`
}

// "jeudi 11 septembre, 14h – 15h"
export function formatPickupSlot(date: string | null | undefined, hour: number | null | undefined) {
  if (!date || hour == null) return null
  const d = new Date(`${date}T00:00:00`)
  const day = new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'Europe/Paris',
  }).format(d)
  return `${day}, ${pickupSlotHourLabel(hour)}`
}

// Next `count` weekdays starting today, as YYYY-MM-DD (Europe/Paris).
export function upcomingWeekdays(count: number, from = new Date()) {
  const out: string[] = []
  const cursor = new Date(from)
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

export function weekdayLabel(iso: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'Europe/Paris',
  }).format(new Date(`${iso}T12:00:00`))
}
