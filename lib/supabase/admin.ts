import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import type { Database } from './types'

// Service-role client, bypassing RLS entirely — for the CAWL webhook route
// only (app/api/webhooks/cawl/route.ts), which has no user session to scope
// a normal request to. Access is gated by verifying the webhook's HMAC
// signature before this is ever used, not by RLS. Never import this from
// anything reachable by a user request (server actions, pages) — those must
// keep using lib/supabase/server.ts so RLS stays the actual access control.
export function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set')
  }
  return createSupabaseClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
