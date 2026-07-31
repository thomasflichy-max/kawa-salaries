import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

export type SecurityEventType =
  | 'login_failed'
  | 'admin_signup_rejected'
  | 'unauthorized_admin_access'
  | 'cawl_webhook_signature_invalid'

// Fire-and-forget by design (same reasoning as the signup_attempts logging
// in app/actions/auth.ts) — a logging hiccup must never delay or break the
// actual response (a login error, a redirect, a webhook 401).
export function logSecurityEvent(
  supabase: SupabaseClient<Database>,
  event: { eventType: SecurityEventType; email?: string | null; detail?: string | null }
) {
  supabase
    .from('security_events')
    .insert({
      event_type: event.eventType,
      email: event.email ?? null,
      detail: event.detail ?? null,
    })
    .then(({ error }) => {
      if (error) console.error('[logSecurityEvent] insert failed:', error)
    })
}
