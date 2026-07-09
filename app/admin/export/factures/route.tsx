import { NextResponse } from 'next/server'
import JSZip from 'jszip'
import { renderToBuffer } from '@react-pdf/renderer'
import { createClient } from '@/lib/supabase/server'
import { isKawaStaffEmail } from '@/lib/is-kawa-staff'
import { DEMO_ORDERS } from '@/app/admin/demo-data'
import { resolveDateRange, toInputDate } from '@/app/admin/date-range'
import { InvoiceDocument } from '@/app/admin/commandes/pdf/invoice-document'

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

  const orders = DEMO_ORDERS.filter((order) => {
    const createdAt = new Date(order.createdAt)
    return createdAt >= range.from && createdAt <= range.to && order.status !== 'annulee'
  })

  const zip = new JSZip()
  for (const order of orders) {
    const buffer = await renderToBuffer(<InvoiceDocument order={order} />)
    zip.file(`facture-${order.orderNumber}.pdf`, buffer)
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
