// Server components render on Vercel, where the runtime clock is UTC. Without an
// explicit timeZone, Intl formats and toISOString() day-bucketing come out two
// hours early (one in winter) versus what staff in France actually see. Route
// every server-side date display through these helpers.

export const PARIS_TZ = 'Europe/Paris'

export const parisTimeFormat = new Intl.DateTimeFormat('fr-FR', {
  timeStyle: 'short',
  timeZone: PARIS_TZ,
})

export const parisDayLabelFormat = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: PARIS_TZ,
})

// YYYY-MM-DD for the given instant as seen in Paris — use for day grouping so a
// 00:30 Paris event files under the right day, not the previous UTC one.
export function parisDayKey(date: Date) {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: PARIS_TZ,
  }).format(date)
}

export function parisDayLabel(date: Date) {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (parisDayKey(date) === parisDayKey(today)) return "Aujourd'hui"
  if (parisDayKey(date) === parisDayKey(yesterday)) return 'Hier'

  const label = parisDayLabelFormat.format(date)
  return label.charAt(0).toUpperCase() + label.slice(1)
}
