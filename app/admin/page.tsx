import { createClient } from '@/lib/supabase/server'
import { resolveDateRange, toInputDate } from './date-range'
import { DateRangePicker } from './date-range-picker'
import {
  DEMO_ORDERS,
  ACTIVE_ORDER_STATUSES,
  computeOrderTotals,
  getClientMapPins,
  DEMO_NOTICE,
} from './demo-data'
import { DemoBadge } from './demo-badge'
import { ClientsMap } from './clients-map'

const currency = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
})

function StatTile({
  label,
  value,
  subValue,
  hint,
}: {
  label: string
  value: string
  subValue?: string
  hint?: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-kawa-200 p-5">
      <p className="text-sm text-kawa-500">{label}</p>
      <p className="text-2xl font-bold text-kawa-800 mt-1">{value}</p>
      {subValue && <p className="text-sm text-kawa-500 mt-0.5">{subValue}</p>}
      {hint && <p className="text-xs text-kawa-400 mt-1">{hint}</p>}
    </div>
  )
}

export default async function AdminDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; preset?: string }>
}) {
  const params = await searchParams
  const range = resolveDateRange(params)

  const supabase = await createClient()
  const [{ data: organizations }, { data: profiles }] = await Promise.all([
    supabase.from('organizations').select('id, active').order('name'),
    supabase.from('profiles').select('id, organization_id'),
  ])

  const orgs = organizations ?? []
  const allProfiles = profiles ?? []

  const ordersInRange = DEMO_ORDERS.filter((order) => {
    const createdAt = new Date(order.createdAt)
    return createdAt >= range.from && createdAt <= range.to && order.status !== 'annulee'
  })

  const revenueTTC = ordersInRange.reduce((sum, o) => sum + o.amount, 0)
  const revenueHT = ordersInRange.reduce(
    (sum, o) => sum + computeOrderTotals(o.items).totalHT,
    0
  )
  const pendingDeliveries = DEMO_ORDERS.filter((o) =>
    ACTIVE_ORDER_STATUSES.includes(o.status)
  ).length

  const quantityByProduct = new Map<string, number>()
  for (const order of ordersInRange) {
    for (const item of order.items) {
      quantityByProduct.set(
        item.productName,
        (quantityByProduct.get(item.productName) ?? 0) + item.quantity
      )
    }
  }
  const topProducts = [...quantityByProduct.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
  const maxQuantity = topProducts[0]?.[1] ?? 1

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-bold text-kawa-800">Tableau de bord</h1>
        <p className="text-kawa-500 text-sm mt-1">
          Vue d&apos;ensemble de l&apos;activité sur la période sélectionnée.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <DateRangePicker
          preset={range.preset}
          from={toInputDate(range.from)}
          to={toInputDate(range.to)}
        />
        <a
          href={`/admin/export/factures?from=${toInputDate(range.from)}&to=${toInputDate(range.to)}`}
          className="inline-flex items-center gap-2 rounded-lg bg-kawa-800 text-white px-4 py-2 text-sm font-medium hover:bg-kawa-900 transition"
        >
          Export factures (PDF)
        </a>
      </div>

      <DemoBadge text={DEMO_NOTICE} />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatTile
          label="Chiffre d'affaires HT"
          value={currency.format(revenueHT)}
          subValue={`${currency.format(revenueTTC)} TTC`}
          hint="Sur la période"
        />
        <StatTile label="Commandes" value={String(ordersInRange.length)} hint="Sur la période" />
        <StatTile
          label="Commandes en cours à livrer"
          value={String(pendingDeliveries)}
          hint="À date d'aujourd'hui"
        />
        <StatTile label="Entreprises actives" value={String(orgs.filter((o) => o.active).length)} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-2xl border border-kawa-200 overflow-hidden">
          <h2 className="text-sm font-semibold text-kawa-800 px-5 py-4 border-b border-kawa-200">
            Produits vendus
          </h2>
          <div className="p-5 flex flex-col gap-3">
            {topProducts.length === 0 && (
              <p className="text-sm text-kawa-400">Aucune vente sur la période.</p>
            )}
            {topProducts.map(([name, quantity]) => (
              <div key={name} className="flex items-center gap-3">
                <p className="w-40 shrink-0 text-sm text-kawa-700 truncate">{name}</p>
                <div className="flex-1 bg-kawa-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-sky-500 h-full rounded-full"
                    style={{ width: `${(quantity / maxQuantity) * 100}%` }}
                  />
                </div>
                <p className="w-10 text-right text-sm font-medium text-kawa-800">{quantity}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-kawa-200 overflow-hidden">
          <h2 className="text-sm font-semibold text-kawa-800 px-5 py-4 border-b border-kawa-200">
            Adresses clients
          </h2>
          <div className="p-5">
            <ClientsMap pins={getClientMapPins()} />
          </div>
        </section>
      </div>

      <section className="bg-white rounded-2xl border border-kawa-200 p-5">
        <p className="text-sm text-kawa-500">
          {orgs.length} entreprise{orgs.length > 1 ? 's' : ''} cliente
          {orgs.length > 1 ? 's' : ''} · {allProfiles.length} salarié
          {allProfiles.length > 1 ? 's' : ''} inscrit{allProfiles.length > 1 ? 's' : ''}
        </p>
      </section>
    </div>
  )
}
