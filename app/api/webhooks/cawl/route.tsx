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
import type { PendingCheckoutItem } from '@/lib/supabase/types'

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

    if (PAID_TYPES.has(event.type)) {
      await handlePaymentCaptured(supabase, merchantReference, event)
    } else if (FAILED_TYPES.has(event.type)) {
      // Nothing was ever created for this checkout (migration 0048) — just
      // drop the reservation. The employee's cart was never touched, so
      // this is a clean no-op from their side: nothing to undo, and they
      // can retry with the exact same cart.
      await supabase.from('pending_checkouts').delete().eq('order_number', merchantReference)
    } else if (REFUNDED_TYPES.has(event.type)) {
      await handlePaymentRefunded(supabase, merchantReference, event)
    }
    // Other event types (payment.created, payment.redirected, ...) don't
    // need a state change on our side.
  }

  return NextResponse.json({ result: 'OK' })
}

type CawlAdminClient = ReturnType<typeof createAdminClient>

async function handlePaymentCaptured(
  supabase: CawlAdminClient,
  merchantReference: string,
  event: CawlWebhookPaymentEvent
) {
  // Idempotency: CAWL retries on non-2xx and can resend the same event — if
  // an order already exists for this reference, it was already processed.
  const { data: existingOrder } = await supabase
    .from('orders')
    .select('id')
    .eq('order_number', merchantReference)
    .maybeSingle()
  if (existingOrder) return

  const { data: pending, error: pendingError } = await supabase
    .from('pending_checkouts')
    .select('*')
    .eq('order_number', merchantReference)
    .maybeSingle()

  if (pendingError || !pending) {
    console.error('[cawl webhook] no pending checkout for', merchantReference, pendingError)
    return
  }

  // This is the moment the order actually comes into existence (migration
  // 0048) — nothing was written to `orders` when the employee clicked
  // "Payer", only here once CAWL confirms the card was actually charged.
  const { data: order, error: insertError } = await supabase
    .from('orders')
    .insert({
      order_number: pending.order_number,
      profile_id: pending.profile_id,
      organization_id: pending.organization_id,
      employee_name: pending.employee_name,
      employee_email: pending.employee_email,
      billing_address: pending.billing_address,
      delivery_mode: pending.delivery_mode,
      address: pending.address,
      amount: pending.amount,
      payment_status: 'paye',
      paid: true,
      cawl_payment_id: event.payment.id,
    })
    .select('id')
    .single()

  if (insertError || !order) {
    console.error('[cawl webhook] failed to create order from pending checkout:', insertError)
    return
  }

  const items = pending.items as PendingCheckoutItem[]

  const { error: itemsError } = await supabase.from('order_items').insert(
    items.map((item) => ({
      order_id: order.id,
      product_name: item.productName,
      quantity: item.quantity,
      image_url: item.imageUrl,
      unit: item.unit,
      unit_price_ttc: item.unitPriceTTC,
      vat_rate: item.vatRate,
    }))
  )
  if (itemsError) {
    console.error('[cawl webhook] failed to insert order items:', itemsError)
    return
  }

  await supabase.from('order_status_history').insert({
    order_id: order.id,
    actor: 'CAWL',
    action: 'Paiement confirmé par CAWL',
  })

  // Only now, once payment is actually confirmed, is it safe to clear the
  // cart — the employee could have kept adding/removing items while this
  // payment was pending.
  await supabase.from('cart_items').delete().eq('user_id', pending.profile_id)
  await supabase.from('pending_checkouts').delete().eq('order_number', merchantReference)

  const { data: fullOrderData, error: fullOrderError } = await supabase
    .from('orders')
    .select(REAL_ORDER_SELECT)
    .eq('id', order.id)
    .single()

  if (fullOrderError || !fullOrderData) {
    console.error('[cawl webhook] failed to reload order for email:', fullOrderError)
    return
  }

  const fullOrder = mapRealOrderRow(fullOrderData as unknown as RealOrderRow)

  // Mints the dedicated, gapless facture/BL numbers and archives the exact
  // PDFs issued right now — this is what makes them immutable: every future
  // download serves this same file, never a re-render from (possibly
  // since-edited) live order data. See migration 0032. A failure here logs
  // a security_event + push notification (see lib/order-documents.tsx)
  // rather than silently leaving a burned sequence number — staff can
  // retry via the "Régénérer" button on the order detail page. Must not
  // block the confirmation email either way; the facture/route.tsx falls
  // back to on-the-fly rendering (via order_number) when invoice_number is
  // still null.
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

async function handlePaymentRefunded(
  supabase: CawlAdminClient,
  merchantReference: string,
  event: CawlWebhookPaymentEvent
) {
  const { data: order, error: findError } = await supabase
    .from('orders')
    .select('id, payment_status')
    .eq('order_number', merchantReference)
    .maybeSingle()

  if (findError || !order) {
    console.error('[cawl webhook] no matching order for', merchantReference, findError)
    return
  }
  if (order.payment_status === 'rembourse') return // already processed

  const { error: updateError } = await supabase
    .from('orders')
    .update({ payment_status: 'rembourse', paid: false, cawl_payment_id: event.payment.id })
    .eq('id', order.id)

  if (updateError) {
    console.error('[cawl webhook] failed to update order', order.id, updateError)
    return
  }

  await supabase.from('order_status_history').insert({
    order_id: order.id,
    actor: 'CAWL',
    action: 'Paiement remboursé (CAWL)',
  })
}
