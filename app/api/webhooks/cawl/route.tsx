import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyWebhookSignature, type CawlWebhookPaymentEvent } from '@/lib/cawl'
import { logSecurityEvent } from '@/lib/log-security-event'
import {
  mapRealOrderRow,
  REAL_ORDER_SELECT,
  type RealOrderRow,
} from '@/app/admin/commandes/manual-orders'
import { archiveOrderInvoiceAndDeliveryNote } from '@/lib/order-documents'
import { sendOrderConfirmationEmail } from '@/lib/emails/order-confirmation'

export const runtime = 'nodejs'

const PAID_TYPES = new Set(['payment.captured'])
const FAILED_TYPES = new Set(['payment.rejected', 'payment.cancelled'])
const REFUNDED_TYPES = new Set(['payment.refunded'])

export async function POST(request: Request) {
  const rawBody = await request.text()

  if (!verifyWebhookSignature(request.headers, rawBody)) {
    logSecurityEvent(createAdminClient(), {
      eventType: 'cawl_webhook_signature_invalid',
      detail: `keyId=${request.headers.get('x-gcs-keyid') ?? 'none'}`,
    })
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
      .select('id, profile_id, payment_status')
      .eq('order_number', merchantReference)
      .maybeSingle()

    if (findError || !order) {
      console.error('[cawl webhook] no matching order for', merchantReference, findError)
      continue
    }

    // Idempotency: CAWL retries on non-2xx and can resend the same event —
    // don't re-send the confirmation email or duplicate the history entry.
    if (order.payment_status === paymentStatus) continue

    // A rejected/cancelled payment must NOT delete the order: CAWL's hosted
    // checkout page offers "Réessayer" on the SAME session after a decline,
    // so a later payment.captured event can still arrive for this exact
    // order_number. Deleting here would leave that success webhook with
    // nothing to match against — confirmed in production 2026-08-18, a
    // real card retry succeeded but the order had already been deleted
    // after the first decline. Just mark it unpaid like any other status;
    // it stays visible ("Non payée") in Liste Commande, and this same
    // update path below flips it to "paye" if the retry succeeds.
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
      // Only now, once payment is actually confirmed, is it safe to clear
      // the cart — the employee could have kept adding/removing items while
      // this payment was pending.
      await supabase.from('cart_items').delete().eq('user_id', order.profile_id)

      const { data: fullOrderData, error: fullOrderError } = await supabase
        .from('orders')
        .select(REAL_ORDER_SELECT)
        .eq('id', order.id)
        .single()

      if (fullOrderError || !fullOrderData) {
        console.error('[cawl webhook] failed to reload order for email:', fullOrderError)
        continue
      }

      const fullOrder = mapRealOrderRow(fullOrderData as unknown as RealOrderRow)

      // Mints the dedicated, gapless facture/BL numbers and archives the
      // exact PDFs issued right now — this is what makes them immutable:
      // every future download serves this same file, never a re-render
      // from (possibly since-edited) live order data. See migration 0032.
      // A failure here logs a security_event + push notification (see
      // lib/order-documents.tsx) rather than silently leaving a burned
      // sequence number — staff can retry via the "Régénérer" button on
      // the order detail page. Must not block the confirmation email either
      // way; the facture/route.tsx falls back to on-the-fly rendering (via
      // order_number) when invoice_number is still null.
      const archiveResult = await archiveOrderInvoiceAndDeliveryNote(supabase, order.id)
      if (!archiveResult.ok) {
        console.error('[cawl webhook] invoice/BL archiving failed:', archiveResult.error)
      }

      try {
        await sendOrderConfirmationEmail(fullOrder, {
          invoiceBuffer: archiveResult.ok ? archiveResult.invoiceBuffer : undefined,
        })
      } catch (emailError) {
        console.error('[cawl webhook] confirmation email failed:', emailError)
      }
    }
  }

  return NextResponse.json({ result: 'OK' })
}
