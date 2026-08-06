import webpush from 'web-push'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'

let configured = false
function ensureConfigured() {
  if (configured) return
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT ?? 'mailto:contact@kawa.coffee',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  )
  configured = true
}

// Sends an OS-level push notification (via each staff member's subscribed
// browser/device) to every row in push_subscriptions — used instead of the
// email that used to fire on every new support message. Best-effort: a
// failure here must never break the caller's actual write (the security_events
// insert), same reasoning as the old email-notification code it replaces.
//
// Takes the caller's own Supabase client rather than building one via
// lib/supabase/server.ts internally — that helper reads cookies() from
// next/headers, which throws when called from Middleware (lib/supabase/proxy.ts,
// the unauthorized_admin_access case). Every call site already has an
// appropriate client for its own context, so just reuse it.
export async function notifyStaffDevices(
  supabase: SupabaseClient<Database>,
  payload: { title: string; body: string; url?: string }
) {
  if (!process.env.VAPID_PRIVATE_KEY || !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
    console.warn('[notifyStaffDevices] VAPID keys not set, skipping push notification')
    return
  }
  ensureConfigured()

  // push_subscriptions' RLS only allows a staff member to see their OWN row —
  // this runs under the caller's session (often an employee submitting a
  // support message, not a staff member), so reading every subscription
  // needs the SECURITY DEFINER RPC rather than a direct table select, which
  // would otherwise just silently return 0 rows. See migration 0044.
  const { data: subscriptions, error } = await supabase.rpc('get_push_subscriptions_for_notify')

  if (error) {
    console.error('[notifyStaffDevices] failed to load subscriptions:', error)
    return
  }

  const body = JSON.stringify(payload)

  await Promise.all(
    (subscriptions ?? []).map(async (row) => {
      try {
        await webpush.sendNotification(
          row.subscription as unknown as webpush.PushSubscription,
          body
        )
      } catch (sendError) {
        const statusCode = (sendError as { statusCode?: number })?.statusCode
        if (statusCode === 404 || statusCode === 410) {
          // Subscription expired or the browser/device unsubscribed —
          // prune it so future sends don't keep failing on it.
          await supabase.rpc('prune_push_subscription', { p_id: row.id })
        } else {
          console.error('[notifyStaffDevices] send failed:', sendError)
        }
      }
    })
  )
}
