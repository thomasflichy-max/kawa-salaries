// Placeholder data for the parts of the admin dashboard that depend on a
// real order/checkout pipeline (not built yet). Every screen that reads from
// here must show a "données de démonstration" notice — see DEMO_NOTICE.
// Replace this module entirely once orders are actually written to the
// `orders` table by a real checkout flow.

export const DEMO_NOTICE =
  'Données de démonstration — en attente du paiement en ligne et de la facturation.'

// en_cours: le salarié a commandé et payé (elle n'apparaît qu'une fois payée).
// en_preparation: KAWA prépare la commande.
// pret: la commande est prête, en attente de livraison/retrait.
// livree: livrée chez le client ou récupérée en pick up.
// annulee: seul un admin peut confirmer l'annulation (le salarié peut la demander).
export type DemoOrderStatus = 'en_cours' | 'en_preparation' | 'pret' | 'livree' | 'annulee'
export type DemoDeliveryMode = 'delivery' | 'pickup'

export type DemoOrderItem = {
  // Stable identity for edit/remove operations — independent from
  // productName, which is just a display label and isn't unique (two lines
  // of the same product with different grinds would otherwise collide).
  id: string
  productName: string
  quantity: number
  imageUrl: string
  unit: 'Kg' | 'unité'
  // TTC unit price — matches how prices are shown/charged everywhere else
  // in the app (the cart total is explicitly labeled "TTC", VAT is already
  // baked into the displayed price, never added on top). HT is derived from
  // this for the invoice breakdown, never the other way around.
  // VAT rate differs by product type: 5.5% for coffee (food product), 20%
  // for equipment/cleaning supplies.
  unitPriceTTC: number
  vatRate: number
}

export type DemoOrderHistoryEntry = {
  actor: string
  action: string
  at: string
}

// A refund is its own record (not a boolean) so an order can accumulate
// several partial refunds over time — e.g. one now for a missing item,
// another later for a complaint — as long as the running total never
// exceeds what was actually paid.
export type DemoOrderRefund = {
  id: string
  amount: number
  reason: string
  actor: string
  at: string
}

export type DemoOrder = {
  id: string
  orderNumber: string
  employeeName: string
  employeeEmail: string
  employeePhone: string
  organizationName: string
  status: DemoOrderStatus
  deliveryMode: DemoDeliveryMode
  address: string
  billingAddress: string
  amount: number
  createdAt: string
  items: DemoOrderItem[]
  history: DemoOrderHistoryEntry[]
  // Refunding is independent of status — a delivered order can still be
  // refunded after the fact (goodwill gesture, complaint, missing item...).
  refunds: DemoOrderRefund[]
  // All seed orders are paid — per the en_cours status comment above, an
  // order only ever appears here once payment has gone through. This field
  // exists so the detail page can still show a clear "Payée" indicator, and
  // so a real checkout flow can later create an order before payment
  // confirms (e.g. waiting on a webhook) without changing the shape.
  paid: boolean
}

export const DEMO_ORDER_STATUS_LABELS: Record<DemoOrderStatus, string> = {
  en_cours: 'En cours',
  en_preparation: 'En préparation',
  pret: "Prêt à l'envoi",
  livree: 'Livrée',
  annulee: 'Annulée',
}

export const DEMO_ORDER_STATUS_STYLES: Record<DemoOrderStatus, string> = {
  en_cours: 'bg-amber-50 text-amber-700',
  en_preparation: 'bg-sky-50 text-sky-700',
  pret: 'bg-indigo-50 text-indigo-700',
  livree: 'bg-emerald-50 text-emerald-700',
  annulee: 'bg-red-50 text-red-700',
}

// Seed items don't carry an id — it's generated once when DEMO_ORDERS is
// built below, so every server restart gets fresh stable ids without having
// to hand-write one per seed line.
type DemoOrderItemSeed = Omit<DemoOrderItem, 'id'>
type DemoOrderSeed = Omit<
  DemoOrder,
  'billingAddress' | 'history' | 'amount' | 'refunds' | 'items' | 'paid'
> & { items: DemoOrderItemSeed[] }

const DEMO_ORDER_SEEDS: DemoOrderSeed[] = []

// Cycled across seed orders so the backfilled history below looks like
// several different staff members actually worked these orders, instead of
// always the same one.
const DEMO_STAFF_NAMES = ['Thomas Flichy', 'Brieuc', 'Jean']
const SEED_STATUS_FLOW: DemoOrderStatus[] = ['en_cours', 'en_preparation', 'pret', 'livree']

// Seed orders start further along than "just created" (some are already
// livree/annulee), so we backfill the intermediate status-change entries
// they would have accumulated — otherwise their history would jump straight
// from creation to a final status with no trail of who did what.
function buildSeedHistory(seed: DemoOrderSeed, seedIndex: number): DemoOrderHistoryEntry[] {
  const created = new Date(seed.createdAt).getTime()
  const history: DemoOrderHistoryEntry[] = [
    { actor: seed.employeeName, action: 'Commande créée et payée', at: seed.createdAt },
  ]
  const staffFor = (step: number) => DEMO_STAFF_NAMES[(seedIndex + step) % DEMO_STAFF_NAMES.length]
  const HOUR = 3600 * 1000

  if (seed.status === 'annulee') {
    history.push({
      actor: staffFor(1),
      action: `Statut changé : ${DEMO_ORDER_STATUS_LABELS.en_cours} → ${DEMO_ORDER_STATUS_LABELS.annulee}`,
      at: new Date(created + 2 * HOUR).toISOString(),
    })
    return history
  }

  const targetIndex = SEED_STATUS_FLOW.indexOf(seed.status)
  for (let step = 1; step <= targetIndex; step++) {
    history.push({
      actor: staffFor(step),
      action: `Statut changé : ${DEMO_ORDER_STATUS_LABELS[SEED_STATUS_FLOW[step - 1]]} → ${DEMO_ORDER_STATUS_LABELS[SEED_STATUS_FLOW[step]]}`,
      at: new Date(created + step * 6 * HOUR).toISOString(),
    })
  }
  return history
}

export type OrderTotals = {
  totalHT: number
  totalVAT: number
  totalTTC: number
  // TVA due grouped by rate, since French invoices must show each rate's
  // base and amount separately when an order mixes coffee (5.5%) and
  // equipment/cleaning supplies (20%).
  vatByRate: { rate: number; amount: number }[]
}

export function computeOrderTotals(items: DemoOrderItem[]): OrderTotals {
  const vatByRateMap = new Map<number, number>()
  let totalHT = 0

  for (const item of items) {
    // Prices are TTC (what the employee actually pays) — HT and VAT are
    // backed out of that, not added on top of a separate HT figure.
    const lineTTC = item.unitPriceTTC * item.quantity
    const lineHT = lineTTC / (1 + item.vatRate)
    const lineVAT = lineTTC - lineHT
    totalHT += lineHT
    vatByRateMap.set(item.vatRate, (vatByRateMap.get(item.vatRate) ?? 0) + lineVAT)
  }

  const totalVAT = [...vatByRateMap.values()].reduce((sum, v) => sum + v, 0)

  return {
    totalHT,
    totalVAT,
    totalTTC: totalHT + totalVAT,
    vatByRate: [...vatByRateMap.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([rate, amount]) => ({ rate, amount })),
  }
}

// Billing follows the company regardless of pickup/delivery, so it starts
// out identical to the company address. `amount` (Total TTC) is derived
// from the items' real unit price + VAT rate rather than hand-entered, so
// it can never drift from what the invoice actually itemizes.
export const DEMO_ORDERS: DemoOrder[] = DEMO_ORDER_SEEDS.map((seed, i) => {
  const items: DemoOrderItem[] = seed.items.map((item, itemIndex) => ({
    ...item,
    id: `${seed.id}-item-${itemIndex}`,
  }))
  return {
    ...seed,
    items,
    billingAddress: seed.address,
    amount: computeOrderTotals(items).totalTTC,
    history: buildSeedHistory(seed, i),
    refunds: [],
    paid: true,
  }
})

// Delivery mode drives what the "Livraison" column/detail should show:
// the client's own address, or the KAWA office when it's a pickup order.
export function getDeliveryLabel(order: Pick<DemoOrder, 'deliveryMode' | 'address'>) {
  return order.deliveryMode === 'pickup' ? `Retrait ${KAWA_OFFICE.shortName}` : order.address
}

export function getDemoOrderById(id: string) {
  return DEMO_ORDERS.find((order) => order.id === id) ?? null
}

// Chronological path a non-cancelled order goes through. Mutating `.status`
// in place (rather than reassigning DEMO_ORDERS) is what makes this demo
// store double as a shared in-memory backend for the admin action buttons —
// there's no real `orders` pipeline yet, so this only survives for the life
// of the server process (resets on redeploy/restart).
const ORDER_STATUS_FLOW: DemoOrderStatus[] = ['en_cours', 'en_preparation', 'pret', 'livree']

export function getNextOrderStatus(status: DemoOrderStatus): DemoOrderStatus | null {
  const index = ORDER_STATUS_FLOW.indexOf(status)
  if (index === -1 || index === ORDER_STATUS_FLOW.length - 1) return null
  return ORDER_STATUS_FLOW[index + 1]
}

function pushHistory(order: DemoOrder, actor: string, action: string) {
  order.history.push({ actor, action, at: new Date().toISOString() })
}

export function advanceDemoOrderStatus(id: string, actor: string) {
  const order = DEMO_ORDERS.find((o) => o.id === id)
  if (!order) return null
  const next = getNextOrderStatus(order.status)
  if (!next) return null
  return setDemoOrderStatus(id, next, actor)
}

// Sets the status directly to any value (used by the status dropdown on the
// order detail page, which — unlike the list's quick "next step" button —
// can jump straight to any status, including "Annulée").
export function setDemoOrderStatus(id: string, status: DemoOrderStatus, actor: string) {
  const order = DEMO_ORDERS.find((o) => o.id === id)
  if (!order) return null
  if (order.status === status) return order
  const fromLabel = DEMO_ORDER_STATUS_LABELS[order.status]
  const toLabel = DEMO_ORDER_STATUS_LABELS[status]
  order.status = status
  pushHistory(order, actor, `Statut changé : ${fromLabel} → ${toLabel}`)
  return order
}

export function setDemoOrderPaid(id: string, paid: boolean, actor: string) {
  const order = DEMO_ORDERS.find((o) => o.id === id)
  if (!order) return null
  if (order.paid === paid) return order
  order.paid = paid
  pushHistory(order, actor, paid ? 'Marquée comme payée' : 'Marquée en attente de paiement')
  return order
}

export function updateDemoOrderBillingAddress(id: string, value: string, actor: string) {
  const order = DEMO_ORDERS.find((o) => o.id === id)
  if (!order) return null
  order.billingAddress = value
  pushHistory(order, actor, 'Adresse de facturation modifiée')
  return order
}

// The shipping address only applies to delivery orders — pickup orders are
// always fulfilled at the fixed KAWA office, not an editable address.
export function updateDemoOrderShippingAddress(id: string, value: string, actor: string) {
  const order = DEMO_ORDERS.find((o) => o.id === id)
  if (!order || order.deliveryMode !== 'delivery') return null
  order.address = value
  pushHistory(order, actor, 'Adresse de livraison modifiée')
  return order
}

export function getOrderRefundTotal(order: Pick<DemoOrder, 'refunds'>) {
  return order.refunds.reduce((sum, refund) => sum + refund.amount, 0)
}

export type OrderRefundStatus = 'none' | 'partial' | 'full'

export function getOrderRefundStatus(order: Pick<DemoOrder, 'refunds' | 'amount'>): OrderRefundStatus {
  const refunded = getOrderRefundTotal(order)
  if (refunded <= 0) return 'none'
  // Small epsilon guards against float rounding ever leaving a fully-refunded
  // order stuck showing as "partial" by a fraction of a cent.
  return refunded >= order.amount - 0.005 ? 'full' : 'partial'
}

// Refunding is a separate track from the delivery status — there's no real
// payment/refund pipeline yet, so this only records the fact for now (who
// refunded how much, when, and why), it doesn't move any money. Several
// partial refunds can accumulate over time as long as the running total
// never exceeds what was actually paid.
export function addDemoOrderRefund(id: string, amount: number, reason: string, actor: string) {
  const order = DEMO_ORDERS.find((o) => o.id === id)
  if (!order) return null
  const remaining = order.amount - getOrderRefundTotal(order)
  if (amount <= 0 || amount > remaining + 0.005) return null
  order.refunds.push({
    id: crypto.randomUUID(),
    amount,
    reason,
    actor,
    at: new Date().toISOString(),
  })
  const amountLabel = amount.toFixed(2).replace('.', ',')
  const isFull = getOrderRefundStatus(order) === 'full'
  pushHistory(
    order,
    actor,
    `Remboursement ${isFull ? 'total' : 'partiel'} de ${amountLabel} € — ${reason}`
  )
  return order
}

// Snapshots the picked catalog product's current name/image/price/VAT rate
// into the order line (rather than a live reference to it), matching how the
// rest of the order already works — a placed order must never silently
// change because the catalog changed later.
export function addDemoOrderItem(orderId: string, item: Omit<DemoOrderItem, 'id'>, actor: string) {
  const order = DEMO_ORDERS.find((o) => o.id === orderId)
  if (!order || item.quantity < 1) return null
  order.items.push({ ...item, id: crypto.randomUUID() })
  order.amount = computeOrderTotals(order.items).totalTTC
  pushHistory(order, actor, `Article ajouté : ${item.productName} (× ${item.quantity})`)
  return order
}

export function updateDemoOrderItemQuantity(
  orderId: string,
  itemId: string,
  quantity: number,
  actor: string
) {
  const order = DEMO_ORDERS.find((o) => o.id === orderId)
  if (!order || quantity < 1) return null
  const item = order.items.find((i) => i.id === itemId)
  if (!item) return null
  const previousQuantity = item.quantity
  if (previousQuantity === quantity) return order
  item.quantity = quantity
  order.amount = computeOrderTotals(order.items).totalTTC
  pushHistory(order, actor, `Quantité modifiée : ${item.productName} (${previousQuantity} → ${quantity})`)
  return order
}

// Keeps at least one line on the order — an order with zero items has no
// invoice to generate and no delivery to fulfill, so it isn't a valid state.
export function removeDemoOrderItem(orderId: string, itemId: string, actor: string) {
  const order = DEMO_ORDERS.find((o) => o.id === orderId)
  if (!order || order.items.length <= 1) return null
  const item = order.items.find((i) => i.id === itemId)
  if (!item) return null
  order.items = order.items.filter((i) => i.id !== itemId)
  order.amount = computeOrderTotals(order.items).totalTTC
  pushHistory(order, actor, `Article retiré : ${item.productName} (× ${item.quantity})`)
  return order
}

export type DemoClientPin = {
  organizationName: string
  address: string
  // Geocoded via Nominatim (OpenStreetMap) — the addresses themselves are
  // still fictional demo companies, but the pin sits on the real address.
  lat: number
  lng: number
}

export const DEMO_CLIENT_PINS: DemoClientPin[] = [
  { organizationName: 'Atlantic Digital', address: '12 Rue de Strasbourg, 44000 Nantes', lat: 47.2159357, lng: -1.5510733 },
  { organizationName: 'Colbert Assurances', address: '8 Quai de Versailles, 44000 Nantes', lat: 47.2216199, lng: -1.5537311 },
  { organizationName: 'Studio Vertigo', address: '45 Boulevard Guist\'hau, 44000 Nantes', lat: 47.2156525, lng: -1.5646006 },
]

// Fixed pickup point, geocoded via Nominatim.
export const KAWA_OFFICE = {
  name: 'KAWA Nantes (retrait bureau)',
  shortName: 'KAWA Nantes',
  address: '75 Bd Ernest Dalby, 44000 Nantes',
  lat: 47.2226487,
  lng: -1.5305237,
}

export type MapPinColor = 'blue' | 'red' | 'orange'
export type MapPinKind = 'company' | 'office'

export type ClientMapPin = {
  label: string
  address: string
  lat: number
  lng: number
  color: MapPinColor
  detail: string
  kind: MapPinKind
}

// Not yet delivered/picked up and not cancelled.
export const ACTIVE_ORDER_STATUSES: DemoOrderStatus[] = ['en_cours', 'en_preparation', 'pret']

// Just the fields getClientMapPins actually needs, structurally compatible
// with AdminOrder (app/admin/commandes/manual-orders.ts) — kept as a local
// Pick-style type here rather than importing AdminOrder, which would create
// a circular import (manual-orders.ts already imports from this file).
type OrderForMapPin = {
  organizationName: string
  deliveryMode: DemoDeliveryMode
  status: DemoOrderStatus
  paid: boolean
}

// Two independent signals plotted as two different pins, so a company
// with one employee picking up and another getting delivered never has to
// pick a single color for both: the company pin only tracks deliveries to
// its address, the KAWA office pin only tracks pending pickups.
//
// `companyPins` are the real geocoded client sites (organization_addresses,
// see app/admin/page.tsx). `orders` should be every source (demo/manual/real,
// via getAllAdminOrders()) — pending-delivery status is matched by
// organization name only, same fragile-by-name link used elsewhere in this
// file. Only paid orders count as "pending" — an unpaid real order hasn't
// actually been placed yet from a fulfillment point of view.
export function getClientMapPins(
  companyPins: DemoClientPin[] = DEMO_CLIENT_PINS,
  orders: OrderForMapPin[] = DEMO_ORDERS
): ClientMapPin[] {
  const mappedCompanyPins: ClientMapPin[] = companyPins.map((pin) => {
    const hasPendingDelivery = orders.some(
      (order) =>
        order.organizationName === pin.organizationName &&
        order.deliveryMode === 'delivery' &&
        order.paid &&
        ACTIVE_ORDER_STATUSES.includes(order.status)
    )
    return {
      label: pin.organizationName,
      address: pin.address,
      lat: pin.lat,
      lng: pin.lng,
      color: hasPendingDelivery ? 'red' : 'blue',
      detail: hasPendingDelivery ? 'Livraison en attente' : 'Aucune livraison en cours',
      kind: 'company',
    }
  })

  const hasPendingPickup = orders.some(
    (order) => order.deliveryMode === 'pickup' && order.paid && ACTIVE_ORDER_STATUSES.includes(order.status)
  )

  const officePin: ClientMapPin = {
    label: KAWA_OFFICE.name,
    address: KAWA_OFFICE.address,
    lat: KAWA_OFFICE.lat,
    lng: KAWA_OFFICE.lng,
    color: hasPendingPickup ? 'orange' : 'blue',
    detail: hasPendingPickup ? 'Retrait en attente' : 'Aucun retrait en cours',
    kind: 'office',
  }

  return [...mappedCompanyPins, officePin]
}
