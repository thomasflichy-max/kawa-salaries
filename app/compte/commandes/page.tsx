import Link from 'next/link'
import { getEmployee } from '@/lib/get-employee'
import {
  DEMO_ORDERS,
  DEMO_ORDER_STATUS_STYLES,
  getDeliveryLabel,
  orderStatusLabel,
} from '@/app/admin/demo-data'
import { getManualOrders, getRealOrders } from '@/app/admin/commandes/manual-orders'
import { getLocale } from '@/lib/i18n/locale'
import { getDictionary } from '@/lib/i18n/dictionary'
import { OrderContactButton } from './order-contact-button'

const currency = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })

export default async function CommandesPage() {
  const { user } = await getEmployee()
  const locale = await getLocale()
  const t = getDictionary(locale)
  const dateFormat = new Intl.DateTimeFormat(locale === 'en' ? 'en-GB' : 'fr-FR', { dateStyle: 'long' })

  // RLS scopes getManualOrders/getRealOrders to the caller's own rows for a
  // regular employee — but a @kawa.coffee staff account also matches the
  // "kawa staff can manage orders" policy and would otherwise get EVERY
  // order here. Filter by the current user explicitly, same as DEMO_ORDERS.
  const [manualOrders, realOrders] = await Promise.all([getManualOrders(), getRealOrders()])
  const orders = [...DEMO_ORDERS, ...manualOrders, ...realOrders]
    .filter((order) => order.employeeEmail === user.email)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-kawa-800">{t.nav.commandes}</h1>
        <p className="text-kawa-500 mt-1">{t.commandes.subtitle}</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-kawa-200 p-10 text-center">
          <p className="text-kawa-500">{t.commandes.empty}</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-4">
          {orders.map((order) => (
            <li
              key={order.id}
              className="bg-white rounded-2xl border border-kawa-200 p-6 flex flex-col gap-3"
            >
              <Link
                href={`/compte/commandes/${order.id}`}
                className="flex items-start justify-between gap-4 flex-wrap hover:opacity-80 transition"
              >
                <div>
                  <p className="font-semibold text-kawa-800">{order.orderNumber}</p>
                  <p className="text-sm text-kawa-500 mt-0.5">
                    {dateFormat.format(new Date(order.createdAt))} — {getDeliveryLabel(order, locale)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${DEMO_ORDER_STATUS_STYLES[order.status]}`}
                  >
                    {orderStatusLabel(order.status, locale)}
                  </span>
                  <span className="font-semibold text-kawa-800">{currency.format(order.amount)}</span>
                </div>
              </Link>
              <OrderContactButton
                orderNumber={order.orderNumber}
                t={t.orderContact}
                supportT={t.support}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
