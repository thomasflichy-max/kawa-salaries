import { createClient } from '@/lib/supabase/server'
import { DEMO_ORDERS, getDemoOrderById, type DemoOrder } from '@/app/admin/demo-data'

// Unifies DEMO_ORDERS (in-memory, resets on redeploy) with real,
// Supabase-persisted `manual_orders` (created by staff from
// /admin/commandes/nouvelle for orders that involve real money — see
// supabase/migrations/0027, 0028). AdminOrder deliberately keeps the exact
// DemoOrder shape so the existing list/detail rendering, getDeliveryLabel,
// computeOrderTotals and the PDF documents (InvoiceDocument,
// DeliveryNoteDocument) work unmodified for both sources. `status` is not
// tracked for manual orders (see manual-orders.ts non-goals in the plan) and
// is fixed at 'en_cours' — UI must not render the prep/delivery status flow
// for source === 'manual'.
export type ManualOrderPaymentMethod = 'virement' | 'lien_cb' | 'boutique'

export type AdminOrder = DemoOrder & {
  source: 'demo' | 'manual'
  paymentLink: string | null
  comment: string | null
  paymentMethod: ManualOrderPaymentMethod | null
}

export function toAdminOrder(order: DemoOrder): AdminOrder {
  return { ...order, source: 'demo', paymentLink: null, comment: null, paymentMethod: null }
}

const MANUAL_ORDER_SELECT =
  'id, order_number, employee_name, employee_email, organization_id, organizations(name), delivery_mode, address, billing_address, amount, paid, payment_link, order_date, comment, payment_method, created_at, created_by, manual_order_items(id, product_name, quantity, image_url, unit, unit_price_ttc, vat_rate)'

type ManualOrderItemRow = {
  id: string
  product_name: string
  quantity: number
  image_url: string
  unit: string
  unit_price_ttc: number
  vat_rate: number
}

type ManualOrderRow = {
  id: string
  order_number: string
  employee_name: string
  employee_email: string
  organization_id: string
  organizations: { name: string } | null
  delivery_mode: string
  address: string
  billing_address: string
  amount: number
  paid: boolean
  payment_link: string | null
  order_date: string
  comment: string | null
  payment_method: string
  created_at: string
  created_by: string | null
  manual_order_items: ManualOrderItemRow[]
}

function mapManualOrderRow(row: ManualOrderRow): AdminOrder {
  return {
    id: row.id,
    orderNumber: row.order_number,
    employeeName: row.employee_name,
    employeeEmail: row.employee_email,
    employeePhone: '',
    organizationName: row.organizations?.name ?? '',
    status: 'en_cours',
    deliveryMode: row.delivery_mode === 'pickup' ? 'pickup' : 'delivery',
    address: row.address,
    billingAddress: row.billing_address,
    amount: row.amount,
    createdAt: row.order_date,
    items: row.manual_order_items.map((item) => ({
      id: item.id,
      productName: item.product_name,
      quantity: item.quantity,
      imageUrl: item.image_url,
      unit: item.unit === 'Kg' ? 'Kg' : 'unité',
      unitPriceTTC: item.unit_price_ttc,
      vatRate: item.vat_rate,
    })),
    history: [
      {
        actor: row.created_by ?? 'KAWA',
        action: 'Commande créée manuellement',
        at: row.created_at,
      },
    ],
    refunds: [],
    paid: row.paid,
    source: 'manual',
    paymentLink: row.payment_link,
    comment: row.comment,
    paymentMethod: row.payment_method as ManualOrderPaymentMethod,
  }
}

export async function getManualOrders(): Promise<AdminOrder[]> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('manual_orders').select(MANUAL_ORDER_SELECT)

  if (error) {
    console.error('[manual-orders] failed to load manual orders:', error)
    return []
  }

  return (data as unknown as ManualOrderRow[]).map(mapManualOrderRow)
}

export async function getAllAdminOrders(): Promise<AdminOrder[]> {
  const manualOrders = await getManualOrders()
  return [...DEMO_ORDERS.map(toAdminOrder), ...manualOrders]
}

export async function getAdminOrderById(id: string): Promise<AdminOrder | null> {
  const demoOrder = getDemoOrderById(id)
  if (demoOrder) {
    return toAdminOrder(demoOrder)
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('manual_orders')
    .select(MANUAL_ORDER_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('[manual-orders] failed to load manual order:', error)
    return null
  }
  if (!data) return null

  return mapManualOrderRow(data as unknown as ManualOrderRow)
}
