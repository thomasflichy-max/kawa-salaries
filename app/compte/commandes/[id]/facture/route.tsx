import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { getEmployee } from '@/lib/get-employee'
import { getAdminOrderById } from '@/app/admin/commandes/manual-orders'
import { InvoiceDocument } from '@/app/admin/commandes/pdf/invoice-document'
import { resolveOrderImages } from '@/app/admin/commandes/pdf/pdf-image'
import { downloadDocumentPdf } from '@/lib/document-storage'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { user } = await getEmployee()
  const { id } = await params
  const order = await getAdminOrderById(id)

  // getAdminOrderById is RLS-scoped to the caller's own orders for
  // manual/real sources — this ownership check is the real gate for demo
  // orders (in-memory, no RLS) and a harmless defense-in-depth check
  // otherwise, same convention as the /compte/commandes/[id] detail page.
  if (!order || order.employeeEmail !== user.email) {
    return NextResponse.json({ error: 'Commande introuvable.' }, { status: 404 })
  }

  // The `documents` Storage bucket is staff-only by RLS (no employee-facing
  // policy exists — see migration 0032) — the admin client is used here
  // only after the ownership check above has already authorized this exact
  // request, same pattern as the CAWL webhook.
  const archived =
    order.source === 'real' && order.invoicePdfPath
      ? await downloadDocumentPdf(createAdminClient(), order.invoicePdfPath)
      : null

  const buffer =
    archived ??
    (await renderToBuffer(
      <InvoiceDocument order={order} imageSrcByUrl={await resolveOrderImages(order.items)} />
    ))

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="facture-${order.invoiceNumber ?? order.orderNumber}.pdf"`,
    },
  })
}
