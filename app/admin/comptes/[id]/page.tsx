import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DEMO_ORDERS, DEMO_NOTICE } from '@/app/admin/demo-data'
import { DemoBadge } from '@/app/admin/demo-badge'
import { resolveDateRange, toInputDate } from '@/app/admin/date-range'
import { DateRangePicker } from '@/app/admin/date-range-picker'
import { EditOrganizationInfoForm } from './edit-organization-info-form'
import { EditOrganizationSitesForm } from './edit-organization-sites-form'
import { EditOrganizationSampleEmailsForm } from './edit-organization-sample-emails-form'
import { EditOrganizationDiscountsForm } from './edit-organization-discounts-form'

const currency = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
})
const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' })

export default async function AdminAccountDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ from?: string; to?: string; preset?: string }>
}) {
  const { id } = await params
  const range = resolveDateRange(await searchParams)
  const supabase = await createClient()

  const [{ data: org }, { data: employees }, { data: addresses }, { data: sampleEmails }, { data: discounts }] =
    await Promise.all([
      supabase
        .from('organizations')
        .select('id, name, domain, active, created_at')
        .eq('id', id)
        .maybeSingle(),
      supabase
        .from('profiles')
        .select('id, full_name, email, created_at')
        .eq('organization_id', id)
        .order('full_name'),
      supabase
        .from('organization_addresses')
        .select('id, label, address')
        .eq('organization_id', id)
        .order('label'),
      supabase
        .from('organization_sample_emails')
        .select('id, email')
        .eq('organization_id', id)
        .order('email'),
      supabase
        .from('organization_coffee_discounts')
        .select('subcategory, discount_amount')
        .eq('organization_id', id),
    ])

  if (!org) {
    notFound()
  }

  const discountBySubcategory = new Map(
    (discounts ?? []).map((rule) => [rule.subcategory, rule.discount_amount])
  )

  // Orders aren't wired to real organizations yet (no checkout pipeline) —
  // matched here by name purely for the demo view.
  const ordersForOrg = DEMO_ORDERS.filter((o) => o.organizationName === org.name)
  const ordersInRange = ordersForOrg.filter((o) => {
    const createdAt = new Date(o.createdAt)
    return createdAt >= range.from && createdAt <= range.to
  })

  const employeeStats = new Map<string, { name: string; total: number; count: number }>()
  for (const order of ordersInRange) {
    const existing = employeeStats.get(order.employeeEmail)
    if (existing) {
      existing.total += order.amount
      existing.count += 1
    } else {
      employeeStats.set(order.employeeEmail, {
        name: order.employeeName,
        total: order.amount,
        count: 1,
      })
    }
  }
  const totalCaInRange = ordersInRange.reduce((sum, o) => sum + o.amount, 0)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/comptes" className="text-sky-700 hover:underline text-sm">
          ← Retour aux comptes
        </Link>
        <h1 className="text-xl font-bold text-kawa-800 mt-2">{org.name}</h1>
      </div>

      <section className="bg-white rounded-2xl border border-kawa-200 overflow-hidden">
        <h2 className="text-sm font-semibold text-kawa-800 px-5 py-4 border-b border-kawa-200">
          Informations
        </h2>
        <p className="px-5 pt-4 text-xs text-kawa-400">
          Client depuis le {org.created_at ? dateFormat.format(new Date(org.created_at)) : '—'}
        </p>
        <EditOrganizationInfoForm
          organizationId={org.id}
          name={org.name}
          domain={org.domain}
          active={org.active ?? false}
        />
      </section>

      <section className="bg-white rounded-2xl border border-kawa-200 overflow-hidden">
        <h2 className="text-sm font-semibold text-kawa-800 px-5 py-4 border-b border-kawa-200">
          Mails types
        </h2>
        <EditOrganizationSampleEmailsForm
          organizationId={org.id}
          initialEmails={(sampleEmails ?? []).map((entry) => ({
            id: entry.id,
            email: entry.email,
          }))}
        />
      </section>

      <section className="bg-white rounded-2xl border border-kawa-200 overflow-hidden">
        <h2 className="text-sm font-semibold text-kawa-800 px-5 py-4 border-b border-kawa-200">
          Sites de livraison
        </h2>
        <EditOrganizationSitesForm
          organizationId={org.id}
          initialSites={(addresses ?? []).map((site) => ({
            id: site.id,
            label: site.label,
            address: site.address,
          }))}
        />
      </section>

      <section className="bg-white rounded-2xl border border-kawa-200 overflow-hidden">
        <h2 className="text-sm font-semibold text-kawa-800 px-5 py-4 border-b border-kawa-200">
          Tarification
        </h2>
        <EditOrganizationDiscountsForm
          organizationId={org.id}
          classique={discountBySubcategory.get('classique') ?? 0}
          bio={discountBySubcategory.get('bio') ?? 0}
          decafeine={discountBySubcategory.get('decafeine') ?? 0}
        />
      </section>

      <section className="bg-white rounded-2xl border border-kawa-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-kawa-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-kawa-800">Salariés ayant commandé</h2>
            <DemoBadge text={DEMO_NOTICE} />
          </div>
          <DateRangePicker preset={range.preset} from={toInputDate(range.from)} to={toInputDate(range.to)} />
        </div>
        <p className="px-5 pt-4 text-sm text-kawa-500">
          CA généré sur la période :{' '}
          <span className="font-semibold text-kawa-800">{currency.format(totalCaInRange)}</span>
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-kawa-500 border-b border-kawa-100">
                <th className="px-5 py-3 font-medium">Salarié</th>
                <th className="px-5 py-3 font-medium">Commandes</th>
                <th className="px-5 py-3 font-medium text-right">Total dépensé TTC</th>
              </tr>
            </thead>
            <tbody>
              {[...employeeStats.entries()].map(([email, stats]) => (
                <tr key={email} className="border-b border-kawa-50 last:border-0">
                  <td className="px-5 py-3">
                    <Link
                      href={`/admin/comptes/${org.id}/salaries/${encodeURIComponent(email)}`}
                      className="text-kawa-800 hover:underline"
                    >
                      {stats.name}
                    </Link>
                  </td>
                  <td className="px-5 py-3 text-kawa-500">{stats.count}</td>
                  <td className="px-5 py-3 text-kawa-800 text-right">{currency.format(stats.total)}</td>
                </tr>
              ))}
              {employeeStats.size === 0 && (
                <tr>
                  <td className="px-5 py-6 text-kawa-400 text-center" colSpan={3}>
                    Aucune commande pour cette entreprise sur la période.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-kawa-200 overflow-hidden">
        <h2 className="text-sm font-semibold text-kawa-800 px-5 py-4 border-b border-kawa-200">
          Salariés inscrits
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-kawa-500 border-b border-kawa-100">
                <th className="px-5 py-3 font-medium">Nom</th>
                <th className="px-5 py-3 font-medium">Inscrit le</th>
              </tr>
            </thead>
            <tbody>
              {(employees ?? []).map((employee) => (
                <tr key={employee.id} className="border-b border-kawa-50 last:border-0">
                  <td className="px-5 py-3">
                    {employee.email ? (
                      <Link
                        href={`/admin/comptes/${org.id}/salaries/${encodeURIComponent(employee.email)}`}
                        className="text-kawa-800 hover:underline"
                      >
                        {employee.full_name ?? '—'}
                      </Link>
                    ) : (
                      <span className="text-kawa-800">{employee.full_name ?? '—'}</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-kawa-500">
                    {employee.created_at ? dateFormat.format(new Date(employee.created_at)) : '—'}
                  </td>
                </tr>
              ))}
              {(employees ?? []).length === 0 && (
                <tr>
                  <td className="px-5 py-6 text-kawa-400 text-center" colSpan={2}>
                    Aucun salarié inscrit pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
