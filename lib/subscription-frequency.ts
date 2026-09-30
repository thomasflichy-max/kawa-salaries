import type { Locale } from './i18n/locale'

// Kept separate from app/actions/subscriptions.ts on purpose: a 'use server'
// file may only export async functions (Server Actions) — exporting a plain
// constant from one is invalid and breaks the client bundle of anything
// that imports it (this constant is used both for server-side validation
// and in the client subscribe form's <select>).
//
// Kept in sync with the migration's `frequency_weeks in (...)` check.
export const FREQUENCY_WEEKS = [4, 6, 8, 10, 12] as const

export const FREQUENCY_LABELS: Record<number, string> = {
  4: 'Tous les mois',
  6: 'Toutes les 6 semaines',
  8: 'Tous les 2 mois',
  10: 'Toutes les 10 semaines',
  12: 'Tous les 3 mois',
}

export const FREQUENCY_LABELS_EN: Record<number, string> = {
  4: 'Every month',
  6: 'Every 6 weeks',
  8: 'Every 2 months',
  10: 'Every 10 weeks',
  12: 'Every 3 months',
}

export function frequencyLabel(weeks: number, locale: Locale) {
  return locale === 'en' ? FREQUENCY_LABELS_EN[weeks] : FREQUENCY_LABELS[weeks]
}
