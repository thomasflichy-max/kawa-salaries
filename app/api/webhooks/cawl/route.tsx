import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyWebhookSignature, type CawlWebhookPaymentEvent } from '@/lib/cawl'
import { logSecurityEvent } from '@/lib/log-security-event'
import {
  mapRealOrderRow,
  REAL_ORDER_SELECT,
  type RealOrderRow,
} from '@/app/admin/commandes/manual-orders'
import { InvoiceDocument } from '@/app/admin/commandes/pdf/invoice-document'
import { DeliveryNoteDocument } from '@/app/admin/commandes/pdf/delivery-note-document'
import { resolveOrderImages } from '@/app/admin/commandes/pdf/pdf-image'
import { mintDocumentNumber, uploadDocumentPdf } from '@/lib/document-storage'
import { sendOrderConfirmationEmail } from '@/lib/emails/order-confirmation'
import type { AdminOrder } from '@/app/admin/commandes/manual-orders'

export const runtime = 'nodejs'

const PAID_TYPES = new Set(['payment.captured'])
const FAILED_TYPES = new Set(['payment.rejected', 'payment.cancelled'])
const REFUNDED_TYPES = new Set(['payment.refunded'])

// Pulled out to plain function calls (not inline JSX) so the numbering +
// archiving try/catch below doesn't construct JSX directly inside a
// try block — @react-pdf/renderer's renderToBuffer still rejects on error
// exactly the same way, this is purely to keep the linter happy about
// error-boundary semantics that don't actually apply to PDF rendering.
function renderInvoiceBuffer(
  order: AdminOrder,
  invoiceNumber: string,
  imageSrcByUrl: Record<string, string | null>
) {
  return renderToBuffer(
    <InvoiceDocument order={order} invoiceNumber={invoiceNumber} imageSrcByUrl={imageSrcByUrl} />
  )
}
function renderDeliveryNoteBuffer(
  order: AdminOrder,
  deliveryNoteNumber: string,
  imageSrcByUrl: Record<string, string | null>
) {
  return renderToBuffer(
    <DeliveryNoteDocument
      order={order}
      deliveryNoteNumber={deliveryNoteNumber}
      imageSrcByUrl={imageSrcByUrl}
    />
  )
}

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
      const year = new Date().getFullYear()

      // Mint the dedicated, gapless facture/BL numbers and archive the
      // exact PDFs issued right now — this is what makes them immutable:
      // every future download serves this same file, never a re-render
      // from (possibly since-edited) live order data. See migration 0032.
      let invoiceBuffer: Buffer | undefined
      try {
        const invoiceNumber = await mintDocumentNumber(supabase, 'facture', year)
        const deliveryNoteNumber = await mintDocumentNumber(supabase, 'bon_livraison', year)
        const imageSrcByUrl = await resolveOrderImages(fullOrder.items)

        invoiceBuffer = await renderInvoiceBuffer(fullOrder, invoiceNumber, imageSrcByUrl)
        const deliveryNoteBuffer = await renderDeliveryNoteBuffer(
          fullOrder,
          deliveryNoteNumber,
          imageSrcByUrl
        )

        const invoicePdfPath = `invoices/${order.id}.pdf`
        const deliveryNotePdfPath = `delivery-notes/${order.id}.pdf`
        await uploadDocumentPdf(supabase, invoicePdfPath, invoiceBuffer)
        await uploadDocumentPdf(supabase, deliveryNotePdfPath, deliveryNoteBuffer)

        await supabase
          .from('orders')
          .update({
            invoice_number: invoiceNumber,
            invoice_pdf_path: invoicePdfPath,
            delivery_note_number: deliveryNoteNumber,
            delivery_note_pdf_path: deliveryNotePdfPath,
          })
          .eq('id', order.id)
      } catch (archiveError) {
        // A numbering/archiving failure must not block the confirmation
        // email — the facture/document.tsx routes fall back to on-the-fly
        // rendering (via order_number) when invoice_number is still null,
        // so nothing is unrecoverable; this just needs investigating.
        console.error('[cawl webhook] invoice/BL numbering or archiving failed:', archiveError)
      }

      try {
        await sendOrderConfirmationEmail(fullOrder, { invoiceBuffer })
      } catch (emailError) {
        console.error('[cawl webhook] confirmation email failed:', emailError)
      }
    }
  }

  return NextResponse.json({ result: 'OK' })
}
