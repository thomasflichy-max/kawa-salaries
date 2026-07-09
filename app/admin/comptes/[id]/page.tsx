import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DEMO_ORDERS, DEMO_NOTICE } from '@/app/admin/demo-data'
import { DemoBadge } from '@/app/admin/demo-badge'

const currency = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
})
const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' })

export default async function AdminAccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: org }, { data: employees }, { data: addresses }, { data: discounts }] =
    await Promise.all([
      supabase
        .from('organizations')
        .select('id, name, domain, sample_email, active, created_at')
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
        .from('organization_coffee_discounts')
        .select('subcategory, discount_amount')
        .eq('organization_id', id),
    ])

  if (!org) {
    notFound()
  }

  const discountLabels: Record<string, string> = {
    classique: 'Classique',
    bio: 'Bio',
    decafeine: 'Décaféiné',
  }

  // Orders aren't wired to real organizations yet (no checkout pipeline) —
  // matched here by name purely for the demo view.
  const ordersForOrg = DEMO_ORDERS.filter((o) => o.organizationName === org.name)
  const spentByEmployee = new Map<string, number>()
  const ordersByEmployee = new Map<string, number>()
  for (const order of ordersForOrg) {
    spentByEmployee.set(
      order.employeeName,
      (spentByEmployee.get(order.employeeName) ?? 0) + order.amount
    )
    ordersByEmployee.set(order.employeeName, (ordersByEmployee.get(order.employeeName) ?? 0) + 1)
  }

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
        <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-4 p-5 text-sm">
          <div>
            <dt className="text-kawa-500">Domaine email</dt>
            <dd className="text-kawa-800 mt-0.5">{org.domain}</dd>
          </div>
          <div>
            <dt className="text-kawa-500">Mail type</dt>
            <dd className="text-kawa-800 mt-0.5">{org.sample_email ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-kawa-500">Client depuis</dt>
            <dd className="text-kawa-800 mt-0.5">
              {org.created_at ? dateFormat.format(new Date(org.created_at)) : '—'}
            </dd>
          </div>
          <div>
            <dt className="text-kawa-500">Statut</dt>
            <dd className="mt-0.5">
              <span
                className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                  org.active ? 'bg-emerald-50 text-emerald-700' : 'bg-kawa-100 text-kawa-600'
                }`}
              >
                {org.active ? 'active' : 'inactive'}
              </span>
            </dd>
          </div>
        </dl>
      </section>

      <section className="bg-white rounded-2xl border border-kawa-200 overflow-hidden">
        <h2 className="text-sm font-semibold text-kawa-800 px-5 py-4 border-b border-kawa-200">
          Sites de livraison
        </h2>
        <div className="p-5 flex flex-col gap-2 text-sm">
          {(addresses ?? []).map((site) => (
            <p key={site.id}>
              <span className="font-medium text-kawa-800">{site.label}</span>{' '}
              <span className="text-kawa-500">— {site.address}</span>
            </p>
          ))}
          {(addresses ?? []).length === 0 && (
            <p className="text-kawa-400">
              Aucun site renseigné — les salariés ne pourront choisir que le retrait KAWA Nantes.
            </p>
          )}
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-kawa-200 overflow-hidden">
        <h2 className="text-sm font-semibold text-kawa-800 px-5 py-4 border-b border-kawa-200">
          Tarification
        </h2>
        <dl className="p-5 grid sm:grid-cols-3 gap-4 text-sm">
          {(discounts ?? []).map((rule) => (
            <div key={rule.subcategory}>
              <dt className="text-kawa-500">{discountLabels[rule.subcategory] ?? rule.subcategory}</dt>
              <dd className="text-kawa-800 font-semibold mt-0.5">
                -{currency.format(rule.discount_amount)}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="bg-white rounded-2xl border border-kawa-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-kawa-200 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-kawa-800">Salariés ayant commandé</h2>
          <DemoBadge text={DEMO_NOTICE} />
        </div>
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
              {[...spentByEmployee.entries()].map(([employeeName, total]) => (
                <tr key={employeeName} className="border-b border-kawa-50 last:border-0">
                  <td className="px-5 py-3 text-kawa-800">{employeeName}</td>
                  <td className="px-5 py-3 text-kawa-500">
                    {ordersByEmployee.get(employeeName) ?? 0}
                  </td>
                  <td className="px-5 py-3 text-kawa-800 text-right">{currency.format(total)}</td>
                </tr>
              ))}
              {spentByEmployee.size === 0 && (
                <tr>
                  <td className="px-5 py-6 text-kawa-400 text-center" colSpan={3}>
                    Aucune commande pour cette entreprise pour le moment.
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
                    <Link
                      href={`/admin/comptes/${org.id}/salaries/${employee.id}`}
                      className="text-kawa-800 hover:underline"
                    >
                      {employee.full_name ?? '—'}
                    </Link>
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
