import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { isKawaStaffEmail } from '@/lib/is-kawa-staff'

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

  const [{ data: rows, error }, { data: orgs, error: orgsError }] = await Promise.all([
    supabase
      .from('profiles')
      // organization_id null = KAWA staff account, not a client salarié
      .select('full_name, email, created_at, is_suspended, organization_id')
      .not('organization_id', 'is', null)
      .order('email'),
    supabase.from('organizations').select('id, name, domain'),
  ])

  if (error || orgsError) {
    console.error('[export/salaries] query failed:', error ?? orgsError)
    return NextResponse.json({ error: 'Export impossible.' }, { status: 500 })
  }

  const orgById = new Map((orgs ?? []).map((o) => [o.id, o]))

  const header = ['Nom', 'Email', 'Entreprise', 'Domaine', 'Inscription', 'Statut']
  const lines = [header.join(';')]
  for (const row of rows ?? []) {
    const org = row.organization_id ? orgById.get(row.organization_id) : undefined
    lines.push(
      [
        row.full_name ?? '',
        row.email ?? '',
        org?.name ?? '',
        org?.domain ?? '',
        row.created_at ? row.created_at.slice(0, 10) : '',
        row.is_suspended ? 'suspendu' : 'actif',
      ]
        .map(csvCell)
        .join(';')
    )
  }

  // Leading BOM + ";" separator so Excel (FR locale) opens it without a
  // manual import step.
  const csv = BOM + lines.join('\r\n')
  const today = new Date().toISOString().slice(0, 10)

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="salaries-kawa-${today}.csv"`,
      'Cache-Control': 'no-store',
    },
  })
}
