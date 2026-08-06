import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { notifyStaffDevices } from '@/lib/push-notifications'

export type SecurityEventType =
  | 'login_failed'
  | 'admin_signup_rejected'
  | 'unauthorized_admin_access'
  | 'cawl_webhook_signature_invalid'

const EVENT_NOTIFY_TITLES: Record<SecurityEventType, string> = {
  login_failed: 'Connexion échouée',
  admin_signup_rejected: 'Tentative de compte admin refusée',
  unauthorized_admin_access: 'Accès admin non autorisé',
  cawl_webhook_signature_invalid: 'Signature webhook CAWL invalide',
}

// Fire-and-forget by design (same reasoning as the signup_attempts logging
// in app/actions/auth.ts) — a logging hiccup must never delay or break the
// actual response (a login error, a redirect, a webhook 401).
//
// Note: unauthorized_profile_change events (migration 0039) are inserted
// directly by a Postgres trigger, not through this function, so they don't
// push a notification — that's a rare edge case (a raw API call bypassing
// the app entirely) rather than a gap worth a database-webhook setup for.
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
      if (error) {
        console.error('[logSecurityEvent] insert failed:', error)
        return
      }
      notifyStaffDevices(supabase, {
        title: EVENT_NOTIFY_TITLES[event.eventType],
        body: event.email ? `${event.email}${event.detail ? ` — ${event.detail}` : ''}` : (event.detail ?? ''),
        url: '/admin/securite/evenements',
      }).catch((pushError) => {
        console.error('[logSecurityEvent] push notification failed:', pushError)
      })
    })
}
