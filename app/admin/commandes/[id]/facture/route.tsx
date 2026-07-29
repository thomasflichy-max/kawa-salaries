import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { createClient } from '@/lib/supabase/server'
import { isKawaStaffEmail } from '@/lib/is-kawa-staff'
import { getAdminOrderById } from '@/app/admin/commandes/manual-orders'
import { InvoiceDocument } from '@/app/admin/commandes/pdf/invoice-document'
import { resolveOrderImages } from '@/app/admin/commandes/pdf/pdf-image'
import { downloadDocumentPdf } from '@/lib/document-storage'

export const runtime = 'nodejs'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!isKawaStaffEmail(user?.email)) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 })
  }

  const { id } = await params
  const order = await getAdminOrderById(id)

  if (!order) {
    return NextResponse.json({ error: 'Commande introuvable.' }, { status: 404 })
  }

  // Real orders with an already-issued invoice serve the exact archived
  // PDF (migration 0032) — never a fresh render, which could differ from
  // what was actually issued if the order's data has since changed.
  const archived =
    order.source === 'real' && order.invoicePdfPath
      ? await downloadDocumentPdf(supabase, order.invoicePdfPath)
      : null

  const buffer =
    archived ??
    (await renderToBuffer(
      <InvoiceDocument order={order} imageSrcByUrl={await resolveOrderImages(order.items)} />
    ))

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="facture-${order.orderNumber}.pdf"`,
    },
  })
}
