import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isKawaStaffEmail } from '@/lib/is-kawa-staff'
import { SITE_URL } from '@/lib/emails/shared'

export const runtime = 'nodejs'

const BOM = '﻿'

function csvCell(value: string) {
  const escaped = value.replace(/"/g, '""')
  return /[";\n\r]/.test(value) ? `"${escaped}"` : escaped
}

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!isKawaStaffEmail(user?.email)) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 })
  }

  // Contactable = has completed at least one paid order (real checkout or
  // staff-entered) AND has not opted out. The art. L34-5 "clients existants"
  // list — never the registered-but-never-ordered.
  const [{ data: realOrders }, { data: manualOrders }, { data: orgs }] = await Promise.all([
    supabase.from('orders').select('profile_id').eq('paid', true),
    supabase.from('manual_orders').select('profile_id').eq('paid', true),
    supabase.from('organizations').select('id, name'),
  ])

  const buyerIds = new Set<string>()
  for (const row of realOrders ?? []) if (row.profile_id) buyerIds.add(row.profile_id)
  for (const row of manualOrders ?? []) if (row.profile_id) buyerIds.add(row.profile_id)

  const header = 'Nom;Email;Entreprise;Lien désinscription'

  if (buyerIds.size === 0) {
    return csvResponse(BOM + header)
  }

  const { data: rows, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, organization_id, marketing_opt_out, marketing_unsub_token')
    .in('id', [...buyerIds])
    .eq('marketing_opt_out', false)
    .order('email')

  if (error) {
    console.error('[export/newsletter] query failed:', error)
    return NextResponse.json({ error: 'Export impossible.' }, { status: 500 })
  }

  const orgById = new Map((orgs ?? []).map((o) => [o.id, o.name]))
  const lines = [header]
  for (const row of rows ?? []) {
    lines.push(
      [
        row.full_name ?? '',
        row.email ?? '',
        row.organization_id ? orgById.get(row.organization_id) ?? '' : '',
        `${SITE_URL}/desinscription?t=${row.marketing_unsub_token}`,
      ]
        .map(csvCell)
        .join(';')
    )
  }

  return csvResponse(BOM + lines.join('\r\n'))
}

function csvResponse(csv: string) {
  const today = new Date().toISOString().slice(0, 10)
  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="newsletter-kawa-${today}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
