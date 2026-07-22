import Link from 'next/link'
import {
  DEMO_ORDER_STATUS_LABELS,
  DEMO_ORDER_STATUS_STYLES,
  DEMO_NOTICE,
  getDeliveryLabel,
  getNextOrderStatus,
  type DemoOrderStatus,
} from '@/app/admin/demo-data'
import { DemoBadge } from '@/app/admin/demo-badge'
import { createClient } from '@/lib/supabase/server'
import { getAllAdminOrders } from './manual-orders'
import { OrderRow } from './order-row'
import { AdvanceStatusButton } from './advance-status-button'
import { DocumentDownloadLinks } from './document-download-links'
import { OrderPreviewButton } from './order-preview-button'
import { StatusFilter } from './status-filter'
import { OrganizationFilter } from './organization-filter'

const currency = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
})
const dateFormat = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'medium',
})

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; entreprise?: string }>
}) {
  const { status, entreprise } = await searchParams
  const isValidStatus = (s: string): s is DemoOrderStatus =>
    s in DEMO_ORDER_STATUS_LABELS

  const supabase = await createClient()
  const [{ data: organizations }, allOrders] = await Promise.all([
    supabase.from('organizations').select('name').order('name'),
    getAllAdminOrders(),
  ])
  const organizationNames = (organizations ?? []).map((org) => org.name)

  const orders = allOrders
    .filter((order) => !status || (isValidStatus(status) && order.status === status))
    .filter((order) => !entreprise || order.organizationName === entreprise)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-kawa-800">Liste des commandes</h1>
          <p className="text-kawa-500 text-sm mt-1">
            Toutes les commandes des salariés, de la plus récente à la plus ancienne. Clique sur
            une commande pour voir le détail.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <OrganizationFilter value={entreprise ?? ''} organizations={organizationNames} />
          <StatusFilter value={status ?? ''} />
          <Link
            href="/admin/commandes/nouvelle"
            className="bg-sky-500 text-kawa-950 px-4 py-2 rounded-lg text-sm font-medium hover:bg-sky-600 transition"
          >
            + Créer une commande
          </Link>
        </div>
      </div>

      <DemoBadge text={DEMO_NOTICE} />

      <section className="bg-white rounded-2xl border border-kawa-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-kawa-500 border-b border-kawa-100">
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium" />
                <th className="px-5 py-3 font-medium">Salarié</th>
                <th className="px-5 py-3 font-medium">Entreprise</th>
                <th className="px-5 py-3 font-medium">Livraison</th>
                <th className="px-5 py-3 font-medium">Statut</th>
                <th className="px-5 py-3 font-medium">Paiement</th>
                <th className="px-5 py-3 font-medium text-right">Montant TTC</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                return (
                  <OrderRow key={order.id} id={order.id}>
                    <td className="px-5 py-3 text-kawa-500 whitespace-nowrap">
                      {dateFormat.format(new Date(order.createdAt))}
                    </td>
                    <td className="px-5 py-3">
                      <OrderPreviewButton order={order} />
                    </td>
                    <td className="px-5 py-3 text-kawa-800">{order.employeeName}</td>
                    <td className="px-5 py-3 text-kawa-500">{order.organizationName}</td>
                    <td className="px-5 py-3 text-kawa-500 max-w-[220px]">
                      {getDeliveryLabel(order)}
                    </td>
                    <td className="px-5 py-3">
                      {order.source === 'manual' ? (
                        <span className="text-kawa-400">—</span>
                      ) : (
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${DEMO_ORDER_STATUS_STYLES[order.status]}`}
                        >
                          {DEMO_ORDER_STATUS_LABELS[order.status]}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                          order.paid ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {order.paid ? 'Payée' : 'En attente'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-kawa-800 text-right whitespace-nowrap">
                      {currency.format(order.amount)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <AdvanceStatusButton
                          orderId={order.id}
                          status={order.status}
                          label={DEMO_ORDER_STATUS_LABELS[order.status]}
                          disabled={order.source === 'manual' || !getNextOrderStatus(order.status)}
                        />
                        <DocumentDownloadLinks orderId={order.id} />
                      </div>
                    </td>
                  </OrderRow>
                )
              })}
              {orders.length === 0 && (
                <tr>
                  <td className="px-5 py-6 text-kawa-400 text-center" colSpan={9}>
                    {status || entreprise
                      ? 'Aucune commande ne correspond à ce filtre.'
                      : 'Aucune commande pour le moment.'}
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
