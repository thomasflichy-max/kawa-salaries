import { NextResponse } from 'next/server'
import JSZip from 'jszip'
import { renderToBuffer } from '@react-pdf/renderer'
import { createClient } from '@/lib/supabase/server'
import { isKawaStaffEmail } from '@/lib/is-kawa-staff'
import { getAllAdminOrders } from '@/app/admin/commandes/manual-orders'
import { resolveDateRange, toInputDate } from '@/app/admin/date-range'
import { InvoiceDocument } from '@/app/admin/commandes/pdf/invoice-document'
import { resolveOrderImages } from '@/app/admin/commandes/pdf/pdf-image'
import { downloadDocumentPdf } from '@/lib/document-storage'

export const runtime = 'nodejs'

export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!isKawaStaffEmail(user?.email)) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const range = resolveDateRange({
    from: searchParams.get('from') ?? undefined,
    to: searchParams.get('to') ?? undefined,
  })

  const allOrders = await getAllAdminOrders()
  const orders = allOrders.filter((order) => {
    const createdAt = new Date(order.createdAt)
    // Only paid orders get an invoice — a pending real-checkout order (not
    // yet confirmed by the CAWL webhook) or an unconfirmed virement/lien_cb
    // manual order must not be invoiced yet.
    return (
      createdAt >= range.from && createdAt <= range.to && order.status !== 'annulee' && order.paid
    )
  })

  const zip = new JSZip()
  for (const order of orders) {
    const archived =
      order.source === 'real' && order.invoicePdfPath
        ? await downloadDocumentPdf(supabase, order.invoicePdfPath)
        : null
    const buffer =
      archived ??
      (await renderToBuffer(
        <InvoiceDocument order={order} imageSrcByUrl={await resolveOrderImages(order.items)} />
      ))
    zip.file(`facture-${order.invoiceNumber ?? order.orderNumber}.pdf`, buffer)
  }

  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })
  const filename = `factures-${toInputDate(range.from)}-au-${toInputDate(range.to)}.zip`

  return new NextResponse(new Uint8Array(zipBuffer), {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
