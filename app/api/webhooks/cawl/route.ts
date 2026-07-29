import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyWebhookSignature, type CawlWebhookPaymentEvent } from '@/lib/cawl'
import {
  mapRealOrderRow,
  REAL_ORDER_SELECT,
  type RealOrderRow,
} from '@/app/admin/commandes/manual-orders'
import { sendOrderConfirmationEmail } from '@/lib/emails/order-confirmation'

export const runtime = 'nodejs'

const PAID_TYPES = new Set(['payment.captured'])
const FAILED_TYPES = new Set(['payment.rejected', 'payment.cancelled'])
const REFUNDED_TYPES = new Set(['payment.refunded'])

export async function POST(request: Request) {
  const rawBody = await request.text()

  if (!verifyWebhookSignature(request.headers, rawBody)) {
    return NextResponse.json({ error: 'invalid signature' }, { status: 401 })
  }

  let events: CawlWebhookPaymentEvent[]
  try {
    const parsed = JSON.parse(rawBody)
    events = Array.isArray(parsed) ? parsed : [parsed]
  } catch (error) {
    console.error('[cawl webhook] invalid JSON body:', error)
    return NextResponse.json({ error: 'invalid body' }, { status: 400 })
  }

  const supabase = createAdminClient()

  for (const event of events) {
    const merchantReference = event.payment?.paymentOutput?.references?.merchantReference
    if (!merchantReference) {
      console.warn('[cawl webhook] event without merchantReference, skipping:', event.type)
      continue
    }

    let paymentStatus: 'paye' | 'echoue' | 'rembourse'
    let statusAction: string
    if (PAID_TYPES.has(event.type)) {
      paymentStatus = 'paye'
      statusAction = 'Paiement confirmé par CAWL'
    } else if (FAILED_TYPES.has(event.type)) {
      paymentStatus = 'echoue'
      statusAction = 'Paiement refusé ou annulé (CAWL)'
    } else if (REFUNDED_TYPES.has(event.type)) {
      paymentStatus = 'rembourse'
      statusAction = 'Paiement remboursé (CAWL)'
    } else {
      // Other event types (payment.created, payment.redirected, ...) don't
      // need a state change on our side.
      continue
    }

    const { data: order, error: findError } = await supabase
      .from('orders')
      .select('id, payment_status')
      .eq('order_number', merchantReference)
      .maybeSingle()

    if (findError || !order) {
      console.error('[cawl webhook] no matching order for', merchantReference, findError)
      continue
    }

    // Idempotency: CAWL retries on non-2xx and can resend the same event —
    // don't re-send the confirmation email or duplicate the history entry.
    if (order.payment_status === paymentStatus) continue

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        payment_status: paymentStatus,
        paid: paymentStatus === 'paye',
        cawl_payment_id: event.payment.id,
      })
      .eq('id', order.id)

    if (updateError) {
      console.error('[cawl webhook] failed to update order', order.id, updateError)
      continue
    }

    await supabase.from('order_status_history').insert({
      order_id: order.id,
      actor: 'CAWL',
      action: statusAction,
    })

    if (paymentStatus === 'paye') {
      const { data: fullOrderData, error: fullOrderError } = await supabase
        .from('orders')
        .select(REAL_ORDER_SELECT)
        .eq('id', order.id)
        .single()

      if (fullOrderError || !fullOrderData) {
        console.error('[cawl webhook] failed to reload order for email:', fullOrderError)
        continue
      }

      try {
        await sendOrderConfirmationEmail(mapRealOrderRow(fullOrderData as unknown as RealOrderRow))
      } catch (emailError) {
        console.error('[cawl webhook] confirmation email failed:', emailError)
      }
    }
  }

  return NextResponse.json({ result: 'OK' })
}
