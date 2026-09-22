// Kept separate from app/actions/subscriptions.ts on purpose: a 'use server'
// file may only export async functions (Server Actions) — exporting a plain
// constant from one is invalid and breaks the client bundle of anything
// that imports it (this constant is used both for server-side validation
// and in the client subscribe form's <select>).
export const FREQUENCY_WEEKS = [2, 4, 6, 8] as const
