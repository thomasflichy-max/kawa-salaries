import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { upsertCartItem } from '@/lib/cart-items'
import { sendSubscriptionReminderEmail } from '@/lib/emails/subscription-reminder'

// Vercel Cron (see vercel.json) hits this once a day — no user session, so
// it runs as the service role (like the CAWL webhook) and is gated by
// CRON_SECRET instead of RLS. Vercel automatically sends
// `Authorization: Bearer <CRON_SECRET>` for its own invocations once that
// env var is set; set it in Vercel project settings.
export const runtime = 'nodejs'
export const maxDuration = 60

function nextReminderDate(frequencyWeeks: number) {
  const date = new Date()
  date.setDate(date.getDate() + frequencyWeeks * 7)
  return date.toISOString().slice(0, 10)
}

type DueSubscriptionRow = {
  id: string
  profile_id: string
  product_id: string
  quantity: number
  grind_type: string | null
  frequency_weeks: number
  product: { name: string; active: boolean; in_stock: boolean } | null
  profile: { email: string | null; full_name: string | null } | null
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET
  if (secret) {
    const authorization = request.headers.get('authorization')
    if (authorization !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  } else {
    console.warn('[cron/subscription-reminders] CRON_SECRET not set — route is unprotected')
  }

  const supabase = createAdminClient()
  const today = new Date().toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from('product_subscriptions')
    .select(
      'id, profile_id, product_id, quantity, grind_type, frequency_weeks, product:products(name, active, in_stock), profile:profiles(email, full_name)'
    )
    .eq('active', true)
    .lte('next_reminder_at', today)

  if (error) {
    console.error('[cron/subscription-reminders] fetch failed:', error)
    return NextResponse.json({ error: 'Fetch failed' }, { status: 500 })
  }

  const due = (data ?? []) as unknown as DueSubscriptionRow[]
  let sent = 0
  let skipped = 0

  for (const sub of due) {
    const product = sub.product
    const profile = sub.profile

    // Product pulled from sale, or no usable email on the profile — reschedule
    // for the next cycle instead of erroring out or retrying every day.
    if (!product?.active || !product.in_stock || !profile?.email) {
      skipped++
      await supabase
        .from('product_subscriptions')
        .update({ next_reminder_at: nextReminderDate(sub.frequency_weeks) })
        .eq('id', sub.id)
      continue
    }

    try {
      await upsertCartItem(supabase, sub.profile_id, sub.product_id, sub.quantity, sub.grind_type)
      await sendSubscriptionReminderEmail(profile.email, {
        firstName: profile.full_name?.split(' ')[0] || 'vous',
        productName: product.name,
        quantity: sub.quantity,
      })
      await supabase
        .from('product_subscriptions')
        .update({
          next_reminder_at: nextReminderDate(sub.frequency_weeks),
          last_reminded_at: new Date().toISOString(),
        })
        .eq('id', sub.id)
      sent++
    } catch (sendError) {
      console.error('[cron/subscription-reminders] failed for subscription', sub.id, sendError)
    }
  }

  return NextResponse.json({ total: due.length, sent, skipped })
}
