import { createClient } from '@/lib/supabase/server'
import { CreateOrganizationForm } from '@/app/admin/create-organization-form'
import { CoffeePricingForm } from '@/app/admin/coffee-pricing-form'

const currency = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
})
const dateFormat = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

const STATUS_STYLES: Record<string, string> = {
  completed: 'bg-emerald-50 text-emerald-700',
  paid: 'bg-emerald-50 text-emerald-700',
  pending: 'bg-amber-50 text-amber-700',
  cancelled: 'bg-red-50 text-red-700',
  failed: 'bg-red-50 text-red-700',
}

function StatusBadge({ status }: { status: string | null }) {
  const key = (status ?? 'pending').toLowerCase()
  const style = STATUS_STYLES[key] ?? 'bg-kawa-100 text-kawa-600'
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${style}`}>
      {status ?? 'pending'}
    </span>
  )
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-2xl border border-kawa-200 p-5">
      <p className="text-sm text-kawa-500">{label}</p>
      <p className="text-2xl font-bold text-kawa-800 mt-1">{value}</p>
    </div>
  )
}

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const [{ data: organizations }, { data: profiles }, { data: orders }, { data: coffeePricing }] =
    await Promise.all([
      supabase
        .from('organizations')
        .select('id, name, domain, discount_rate, active, created_at')
        .order('name'),
      supabase
        .from('profiles')
        .select('id, full_name, organization_id, created_at')
        .order('created_at', { ascending: false }),
      supabase
        .from('orders')
        .select('id, user_id, organization_id, total_amount, status, created_at')
        .order('created_at', { ascending: false })
        .limit(50),
      supabase.from('coffee_pricing').select('subcategory, base_price, discount_percent'),
    ])

  const orgs = organizations ?? []
  const allProfiles = profiles ?? []
  const recentOrders = orders ?? []

  const orgById = new Map(orgs.map((o) => [o.id, o]))
  const profileById = new Map(allProfiles.map((p) => [p.id, p]))

  const employeeCountByOrg = new Map<string, number>()
  for (const p of allProfiles) {
    if (!p.organization_id) continue
    employeeCountByOrg.set(
      p.organization_id,
      (employeeCountByOrg.get(p.organization_id) ?? 0) + 1
    )
  }

  const orderCountByOrg = new Map<string, number>()
  for (const o of recentOrders) {
    if (!o.organization_id) continue
    orderCountByOrg.set(
      o.organization_id,
      (orderCountByOrg.get(o.organization_id) ?? 0) + 1
    )
  }

  const totalRevenue = recentOrders.reduce(
    (sum, o) => sum + (o.total_amount ?? 0),
    0
  )

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-bold text-kawa-800">Vue d&apos;ensemble</h1>
        <p className="text-kawa-500 text-sm mt-1">
          Entreprises clientes, salariés inscrits et commandes.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatTile
          label="Entreprises actives"
          value={String(orgs.filter((o) => o.active).length)}
        />
        <StatTile label="Salariés inscrits" value={String(allProfiles.length)} />
        <StatTile label="Commandes récentes" value={String(recentOrders.length)} />
        <StatTile label="Montant (commandes récentes)" value={currency.format(totalRevenue)} />
      </div>

      <section className="bg-white rounded-2xl border border-kawa-200 overflow-hidden">
        <h2 className="text-sm font-semibold text-kawa-800 px-5 py-4 border-b border-kawa-200">
          Tarification des cafés
        </h2>
        <div className="p-5">
          <CoffeePricingForm rules={coffeePricing ?? []} />
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-kawa-200 overflow-hidden">
        <h2 className="text-sm font-semibold text-kawa-800 px-5 py-4 border-b border-kawa-200">
          Entreprises clientes
        </h2>
        <div className="px-5 py-4 border-b border-kawa-200 bg-kawa-50">
          <CreateOrganizationForm />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-kawa-500 border-b border-kawa-100">
                <th className="px-5 py-2 font-medium">Nom</th>
                <th className="px-5 py-2 font-medium">Domaine</th>
                <th className="px-5 py-2 font-medium">Remise</th>
                <th className="px-5 py-2 font-medium">Salariés</th>
                <th className="px-5 py-2 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {orgs.map((org) => (
                <tr key={org.id} className="border-b border-kawa-50 last:border-0">
                  <td className="px-5 py-3 text-kawa-800">{org.name}</td>
                  <td className="px-5 py-3 text-kawa-500">{org.domain}</td>
                  <td className="px-5 py-3 text-kawa-500">{org.discount_rate}%</td>
                  <td className="px-5 py-3 text-kawa-500">
                    {employeeCountByOrg.get(org.id) ?? 0}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        org.active
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-kawa-100 text-kawa-600'
                      }`}
                    >
                      {org.active ? 'active' : 'inactive'}
                    </span>
                  </td>
                </tr>
              ))}
              {orgs.length === 0 && (
                <tr>
                  <td className="px-5 py-6 text-kawa-400 text-center" colSpan={5}>
                    Aucune entreprise cliente pour le moment.
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
                <th className="px-5 py-2 font-medium">Nom</th>
                <th className="px-5 py-2 font-medium">Entreprise</th>
                <th className="px-5 py-2 font-medium">Inscrit le</th>
              </tr>
            </thead>
            <tbody>
              {allProfiles.map((profile) => (
                <tr key={profile.id} className="border-b border-kawa-50 last:border-0">
                  <td className="px-5 py-3 text-kawa-800">
                    {profile.full_name ?? '—'}
                  </td>
                  <td className="px-5 py-3 text-kawa-500">
                    {profile.organization_id
                      ? orgById.get(profile.organization_id)?.name ?? '—'
                      : '—'}
                  </td>
                  <td className="px-5 py-3 text-kawa-500">
                    {profile.created_at ? dateFormat.format(new Date(profile.created_at)) : '—'}
                  </td>
                </tr>
              ))}
              {allProfiles.length === 0 && (
                <tr>
                  <td className="px-5 py-6 text-kawa-400 text-center" colSpan={3}>
                    Aucun salarié inscrit pour le moment.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-kawa-200 overflow-hidden">
        <h2 className="text-sm font-semibold text-kawa-800 px-5 py-4 border-b border-kawa-200">
          Commandes récentes
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-kawa-500 border-b border-kawa-100">
                <th className="px-5 py-2 font-medium">Date</th>
                <th className="px-5 py-2 font-medium">Salarié</th>
                <th className="px-5 py-2 font-medium">Entreprise</th>
                <th className="px-5 py-2 font-medium">Montant</th>
                <th className="px-5 py-2 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b border-kawa-50 last:border-0">
                  <td className="px-5 py-3 text-kawa-500">
                    {order.created_at ? dateFormat.format(new Date(order.created_at)) : '—'}
                  </td>
                  <td className="px-5 py-3 text-kawa-800">
                    {order.user_id
                      ? profileById.get(order.user_id)?.full_name ?? '—'
                      : '—'}
                  </td>
                  <td className="px-5 py-3 text-kawa-500">
                    {order.organization_id
                      ? orgById.get(order.organization_id)?.name ?? '—'
                      : '—'}
                  </td>
                  <td className="px-5 py-3 text-kawa-800">
                    {order.total_amount != null ? currency.format(order.total_amount) : '—'}
                  </td>
                  <td className="px-5 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                </tr>
              ))}
              {recentOrders.length === 0 && (
                <tr>
                  <td className="px-5 py-6 text-kawa-400 text-center" colSpan={5}>
                    Aucune commande pour le moment.
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
