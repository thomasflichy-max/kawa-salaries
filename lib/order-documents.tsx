import { renderToBuffer } from '@react-pdf/renderer'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/types'
import { mintDocumentNumber, uploadDocumentPdf } from '@/lib/document-storage'
import { logSecurityEvent } from '@/lib/log-security-event'
import {
  mapRealOrderRow,
  REAL_ORDER_SELECT,
  type RealOrderRow,
} from '@/app/admin/commandes/manual-orders'
import { InvoiceDocument } from '@/app/admin/commandes/pdf/invoice-document'
import { DeliveryNoteDocument } from '@/app/admin/commandes/pdf/delivery-note-document'
import { RefundCertificateDocument } from '@/app/admin/commandes/pdf/refund-certificate-document'
import { resolveOrderImages } from '@/app/admin/commandes/pdf/pdf-image'

// Mints the dedicated FACT-/BL-{year}-{seq} numbers, renders both PDFs, and
// archives them — shared by the CAWL webhook (first attempt, right after
// payment.captured) and the "Régénérer" admin retry action (see
// app/admin/commandes/regenerate-documents.ts), so there's exactly one place
// this can go wrong or be fixed. A failure here logs a security_event —
// mintDocumentNumber() already incremented the sequence by the time
// rendering/upload could fail, so that number is burned (a gap), which is
// exactly the scenario worth alerting staff about immediately rather than
// discovering it later during a fiscal audit.
export async function archiveOrderInvoiceAndDeliveryNote(
  supabase: SupabaseClient<Database>,
  orderId: string
): Promise<{ ok: true; invoiceBuffer: Buffer } | { ok: false; error: string }> {
  const { data: rowData, error: loadError } = await supabase
    .from('orders')
    .select(REAL_ORDER_SELECT)
    .eq('id', orderId)
    .single()

  if (loadError || !rowData) {
    return { ok: false, error: 'Commande introuvable.' }
  }

  const order = mapRealOrderRow(rowData as unknown as RealOrderRow)
  const year = new Date().getFullYear()

  try {
    const invoiceNumber = await mintDocumentNumber(supabase, 'facture', year)
    const deliveryNoteNumber = await mintDocumentNumber(supabase, 'bon_livraison', year)
    const imageSrcByUrl = await resolveOrderImages(order.items)

    const invoiceBuffer = await renderToBuffer(
      <InvoiceDocument order={order} invoiceNumber={invoiceNumber} imageSrcByUrl={imageSrcByUrl} />
    )
    const deliveryNoteBuffer = await renderToBuffer(
      <DeliveryNoteDocument
        order={order}
        deliveryNoteNumber={deliveryNoteNumber}
        imageSrcByUrl={imageSrcByUrl}
      />
    )

    const invoicePdfPath = `invoices/${orderId}.pdf`
    const deliveryNotePdfPath = `delivery-notes/${orderId}.pdf`
    await uploadDocumentPdf(supabase, invoicePdfPath, invoiceBuffer)
    await uploadDocumentPdf(supabase, deliveryNotePdfPath, deliveryNoteBuffer)

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        invoice_number: invoiceNumber,
        invoice_pdf_path: invoicePdfPath,
        delivery_note_number: deliveryNoteNumber,
        delivery_note_pdf_path: deliveryNotePdfPath,
      })
      .eq('id', orderId)

    if (updateError) throw updateError

    return { ok: true, invoiceBuffer }
  } catch (error) {
    console.error('[archiveOrderInvoiceAndDeliveryNote] failed:', error)
    logSecurityEvent(supabase, {
      eventType: 'document_archiving_failed',
      email: order.employeeEmail,
      detail: `Facture/BL — commande ${order.orderNumber}`,
    })
    return { ok: false, error: "L'archivage de la facture/BL a échoué." }
  }
}

// Same reasoning as above, for the AVOIR-{year}-{seq} refund certificate
// series — used by the refund action (app/admin/commandes/actions.tsx) and
// its "Régénérer" retry counterpart.
export async function archiveRefundCertificate(
  supabase: SupabaseClient<Database>,
  orderId: string,
  refundId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data: rowData, error: loadError } = await supabase
    .from('orders')
    .select(REAL_ORDER_SELECT)
    .eq('id', orderId)
    .single()

  if (loadError || !rowData) {
    return { ok: false, error: 'Commande introuvable.' }
  }

  const order = mapRealOrderRow(rowData as unknown as RealOrderRow)
  const refundRow = order.refunds.find((r) => r.id === refundId)
  if (!refundRow) {
    return { ok: false, error: 'Remboursement introuvable.' }
  }

  const year = new Date().getFullYear()

  try {
    const refundNumber = await mintDocumentNumber(supabase, 'avoir', year)
    const buffer = await renderToBuffer(
      <RefundCertificateDocument order={order} refund={refundRow} refundNumber={refundNumber} />
    )
    const pdfPath = `refund-certificates/${refundRow.id}.pdf`
    await uploadDocumentPdf(supabase, pdfPath, buffer)

    const { error: updateError } = await supabase
      .from('order_refunds')
      .update({ refund_number: refundNumber, pdf_path: pdfPath })
      .eq('id', refundRow.id)

    if (updateError) throw updateError

    return { ok: true }
  } catch (error) {
    console.error('[archiveRefundCertificate] failed:', error)
    logSecurityEvent(supabase, {
      eventType: 'document_archiving_failed',
      email: order.employeeEmail,
      detail: `Avoir — commande ${order.orderNumber}`,
    })
    return { ok: false, error: "L'archivage de l'avoir a échoué." }
  }
}
