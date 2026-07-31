'use server'

import { cookies } from 'next/headers'

// Same pattern as app/admin/inscriptions/actions.ts's markInscriptionsSeen —
// a plain cookie for the unread badge, not a table, since this is a
// per-browser UI convenience rather than data anyone else needs to see.
const LAST_SEEN_COOKIE = 'securite_evenements_last_seen'

export async function markSecurityEventsSeen() {
  const cookieStore = await cookies()
  cookieStore.set(LAST_SEEN_COOKIE, new Date().toISOString(), {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })
}
