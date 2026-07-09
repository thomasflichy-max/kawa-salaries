import { NextResponse } from 'next/server'
import JSZip from 'jszip'
import { renderToBuffer } from '@react-pdf/renderer'
import { createClient } from '@/lib/supabase/server'
import { isKawaStaffEmail } from '@/lib/is-kawa-staff'
import { DEMO_ORDERS } from '@/app/admin/demo-data'
import { resolveDateRange, toInputDate } from '@/app/admin/date-range'
import { RefundCertificateDocument } from '@/app/admin/commandes/pdf/refund-certificate-document'

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

  const zip = new JSZip()
  // Filtered by when the refund itself happened, not when the order was
  // placed — a refund on an old order still belongs to the period it was
  // actually issued in.
  for (const order of DEMO_ORDERS) {
    for (const refund of order.refunds) {
      const refundedAt = new Date(refund.at)
      if (refundedAt < range.from || refundedAt > range.to) continue
      const buffer = await renderToBuffer(<RefundCertificateDocument order={order} refund={refund} />)
      zip.file(`justificatif-remboursement-${order.orderNumber}-${refund.id.slice(0, 8)}.pdf`, buffer)
    }
  }

  const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })
  const filename = `justificatifs-remboursement-${toInputDate(range.from)}-au-${toInputDate(range.to)}.zip`

  return new NextResponse(new Uint8Array(zipBuffer), {
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  })
}
