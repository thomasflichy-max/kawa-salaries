import webpush from 'web-push'
import { createClient } from '@/lib/supabase/server'

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
export async function notifyStaffDevices(payload: { title: string; body: string; url?: string }) {
  if (!process.env.VAPID_PRIVATE_KEY || !process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
    console.warn('[notifyStaffDevices] VAPID keys not set, skipping push notification')
    return
  }
  ensureConfigured()

  const supabase = await createClient()
  const { data: subscriptions, error } = await supabase
    .from('push_subscriptions')
    .select('id, subscription')

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
          await supabase.from('push_subscriptions').delete().eq('id', row.id)
        } else {
          console.error('[notifyStaffDevices] send failed:', sendError)
        }
      }
    })
  )
}
