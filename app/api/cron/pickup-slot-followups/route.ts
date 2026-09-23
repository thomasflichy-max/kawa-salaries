import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendPickupSlotFollowupEmail } from '@/lib/emails/pickup-slot-followup'
import { SITE_URL } from '@/lib/emails/shared'

// Vercel Cron (see vercel.json) hits this once a day — same auth model as
// app/api/cron/subscription-reminders (service role, gated by CRON_SECRET).
// Finds pickup orders that have been "prêt" for 3+ days with no slot chosen
// yet and no reminder sent yet, nudges them once, and marks it sent so it
// never repeats.
export const runtime = 'nodejs'
export const maxDuration = 60

const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000

type DueOrderRow = {
  id: string
  order_number: string
  employee_name: string
  employee_email: string
  pickup_token: string
}

async function processDue(
  supabase: ReturnType<typeof createAdminClient>,
  table: 'orders' | 'manual_orders',
  cutoffIso: string
) {
  const { data, error } = await supabase
    .from(table)
    .select('id, order_number, employee_name, employee_email, pickup_token')
    .eq('delivery_mode', 'pickup')
    .eq('status', 'pret')
    .is('pickup_slot_date', null)
    .is('pickup_reminder_sent_at', null)
    .lte('ready_at', cutoffIso)

  if (error) {
    console.error(`[cron/pickup-slot-followups] fetch failed (${table}):`, error)
    return { sent: 0, total: 0 }
  }

  const due = (data ?? []) as unknown as DueOrderRow[]
  let sent = 0

  for (const order of due) {
    try {
      await sendPickupSlotFollowupEmail(order.employee_email, {
        firstName: order.employee_name.split(' ')[0] || order.employee_name,
        orderNumber: order.order_number,
        scheduleUrl: `${SITE_URL}/retrait?t=${order.pickup_token}`,
      })
      await supabase
        .from(table)
        .update({ pickup_reminder_sent_at: new Date().toISOString() })
        .eq('id', order.id)
      sent++
    } catch (sendError) {
      console.error(`[cron/pickup-slot-followups] failed for ${table} ${order.id}:`, sendError)
    }
  }

  return { sent, total: due.length }
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const authorization = request.headers.get('authorization')
    if (authorization !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  } else {
    console.warn('[cron/pickup-slot-followups] CRON_SECRET not set — route is unprotected')
  }

  const supabase = createAdminClient()
  const cutoffIso = new Date(Date.now() - THREE_DAYS_MS).toISOString()

  const [orders, manualOrders] = await Promise.all([
    processDue(supabase, 'orders', cutoffIso),
    processDue(supabase, 'manual_orders', cutoffIso),
  ])

  return NextResponse.json({ orders, manualOrders })
}
