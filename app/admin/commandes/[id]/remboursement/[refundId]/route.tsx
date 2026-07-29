import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { createClient } from '@/lib/supabase/server'
import { isKawaStaffEmail } from '@/lib/is-kawa-staff'
import { getAdminOrderById } from '@/app/admin/commandes/manual-orders'
import { RefundCertificateDocument } from '@/app/admin/commandes/pdf/refund-certificate-document'
import { downloadDocumentPdf } from '@/lib/document-storage'

export const runtime = 'nodejs'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string; refundId: string }> }
) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!isKawaStaffEmail(user?.email)) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 })
  }

  const { id, refundId } = await params
  const order = await getAdminOrderById(id)
  const refund = order?.refunds.find((r) => r.id === refundId)

  if (!order || !refund) {
    return NextResponse.json({ error: 'Remboursement introuvable.' }, { status: 404 })
  }

  const archived = refund.pdfPath ? await downloadDocumentPdf(supabase, refund.pdfPath) : null
  const buffer =
    archived ?? (await renderToBuffer(<RefundCertificateDocument order={order} refund={refund} />))

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="justificatif-remboursement-${refund.refundNumber ?? order.orderNumber}.pdf"`,
    },
  })
}
