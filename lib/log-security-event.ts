import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { notifyStaffDevices } from '@/lib/push-notifications'
import { notifyGoogleChat } from '@/lib/google-chat'

export type SecurityEventType =
  | 'login_failed'
  | 'admin_signup_rejected'
  | 'unauthorized_admin_access'
  | 'cawl_webhook_signature_invalid'
  | 'document_archiving_failed'
  | 'pickup_slot_changed'

const EVENT_NOTIFY_TITLES: Record<SecurityEventType, string> = {
  login_failed: 'Connexion échouée',
  admin_signup_rejected: 'Tentative de compte admin refusée',
  unauthorized_admin_access: 'Accès admin non autorisé',
  cawl_webhook_signature_invalid: 'Signature webhook CAWL invalide',
  document_archiving_failed: 'Archivage de document échoué',
  pickup_slot_changed: 'Créneau de retrait modifié',
}

// The rest of "Account Management" (login échoué, accès admin non
// autorisé, etc.) stays push-only — too dense/technical for the Google
// Chat space. Only the operational, actionable ones also go to Chat.
const GOOGLE_CHAT_EVENT_TYPES = new Set<SecurityEventType>(['pickup_slot_changed'])

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
  event: { eventType: SecurityEventType; email?: string | null; detail?: string | null; url?: string }
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
      const notifyPayload = {
        title: EVENT_NOTIFY_TITLES[event.eventType],
        body: event.email ? `${event.email}${event.detail ? ` — ${event.detail}` : ''}` : (event.detail ?? ''),
        url: event.url ?? '/admin/securite/evenements',
      }
      notifyStaffDevices(supabase, notifyPayload).catch((pushError) => {
        console.error('[logSecurityEvent] push notification failed:', pushError)
      })
      if (GOOGLE_CHAT_EVENT_TYPES.has(event.eventType)) {
        notifyGoogleChat(notifyPayload).catch((chatError) => {
          console.error('[logSecurityEvent] Google Chat notification failed:', chatError)
        })
      }
    })
}
