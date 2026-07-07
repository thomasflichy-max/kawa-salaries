import {
  DEMO_ORDERS,
  DEMO_ORDER_STATUS_LABELS,
  DEMO_ORDER_STATUS_STYLES,
  DEMO_NOTICE,
} from '@/app/admin/demo-data'
import { DemoBadge } from '@/app/admin/demo-badge'

const currency = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
})
const dateFormat = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'medium',
})

export default function AdminOrdersPage() {
  const orders = [...DEMO_ORDERS].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-kawa-800">Liste des commandes</h1>
        <p className="text-kawa-500 text-sm mt-1">
          Toutes les commandes des salariés, de la plus récente à la plus ancienne.
        </p>
      </div>

      <DemoBadge text={DEMO_NOTICE} />

      <section className="bg-white rounded-2xl border border-kawa-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-kawa-500 border-b border-kawa-100">
                <th className="px-5 py-3 font-medium">N° commande</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Salarié</th>
                <th className="px-5 py-3 font-medium">Entreprise</th>
                <th className="px-5 py-3 font-medium">Adresse</th>
                <th className="px-5 py-3 font-medium">Statut</th>
                <th className="px-5 py-3 font-medium text-right">Montant TTC</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-kawa-50 last:border-0 align-top">
                  <td className="px-5 py-3 text-kawa-800 font-medium whitespace-nowrap">
                    {order.orderNumber}
                  </td>
                  <td className="px-5 py-3 text-kawa-500 whitespace-nowrap">
                    {dateFormat.format(new Date(order.createdAt))}
                  </td>
                  <td className="px-5 py-3 text-kawa-800">{order.employeeName}</td>
                  <td className="px-5 py-3 text-kawa-500">{order.organizationName}</td>
                  <td className="px-5 py-3 text-kawa-500 max-w-[220px]">{order.address}</td>
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
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td className="px-5 py-6 text-kawa-400 text-center" colSpan={7}>
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
