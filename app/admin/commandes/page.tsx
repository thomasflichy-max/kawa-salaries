import {
  DEMO_ORDERS,
  DEMO_ORDER_STATUS_LABELS,
  DEMO_ORDER_STATUS_STYLES,
  DEMO_NOTICE,
  ORDER_STATUS_ACTION_LABELS,
  getDeliveryLabel,
  getNextOrderStatus,
  type DemoOrderStatus,
} from '@/app/admin/demo-data'
import { DemoBadge } from '@/app/admin/demo-badge'
import { OrderRow } from './order-row'
import { AdvanceStatusButton } from './advance-status-button'
import { DocumentDownloadLinks } from './document-download-links'
import { OrderPreviewButton } from './order-preview-button'
import { StatusFilter } from './status-filter'

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
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const isValidStatus = (s: string): s is DemoOrderStatus =>
    s in DEMO_ORDER_STATUS_LABELS

  const orders = [...DEMO_ORDERS]
    .filter((order) => !status || (isValidStatus(status) && order.status === status))
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
        <StatusFilter value={status ?? ''} />
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
                <th className="px-5 py-3 font-medium text-right">Montant TTC</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const nextStatus = getNextOrderStatus(order.status)
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
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${DEMO_ORDER_STATUS_STYLES[order.status]}`}
                      >
                        {DEMO_ORDER_STATUS_LABELS[order.status]}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-kawa-800 text-right whitespace-nowrap">
                      {currency.format(order.amount)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {nextStatus ? (
                          <AdvanceStatusButton
                            orderId={order.id}
                            status={order.status}
                            label={ORDER_STATUS_ACTION_LABELS[order.status] ?? ''}
                          />
                        ) : (
                          <span className="text-kawa-300 w-8 text-center">—</span>
                        )}
                        <DocumentDownloadLinks orderId={order.id} />
                      </div>
                    </td>
                  </OrderRow>
                )
              })}
              {orders.length === 0 && (
                <tr>
                  <td className="px-5 py-6 text-kawa-400 text-center" colSpan={8}>
                    {status
                      ? 'Aucune commande avec ce statut.'
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
