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
