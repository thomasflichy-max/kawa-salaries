import { getEmployee } from '@/lib/get-employee'
import {
  DEMO_ORDERS,
  DEMO_ORDER_STATUS_LABELS,
  DEMO_ORDER_STATUS_STYLES,
  getDeliveryLabel,
} from '@/app/admin/demo-data'
import { OrderContactButton } from './order-contact-button'

const currency = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })
const dateFormat = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' })

export default async function CommandesPage() {
  const { user } = await getEmployee()

  const orders = DEMO_ORDERS.filter((order) => order.employeeEmail === user.email).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-kawa-800">Mes Commandes</h1>
        <p className="text-kawa-500 mt-1">Votre historique de commandes et vos factures.</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-kawa-200 p-10 text-center">
          <p className="text-kawa-500">
            Aucune commande pour le moment — le catalogue produits arrive bientôt.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {orders.map((order) => (
            <li
              key={order.id}
              className="bg-white rounded-2xl border border-kawa-200 p-6 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="font-semibold text-kawa-800">{order.orderNumber}</p>
                  <p className="text-sm text-kawa-500 mt-0.5">
                    {dateFormat.format(new Date(order.createdAt))} — {getDeliveryLabel(order)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${DEMO_ORDER_STATUS_STYLES[order.status]}`}
                  >
                    {DEMO_ORDER_STATUS_LABELS[order.status]}
                  </span>
                  <span className="font-semibold text-kawa-800">{currency.format(order.amount)}</span>
                </div>
              </div>
              <OrderContactButton orderNumber={order.orderNumber} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
