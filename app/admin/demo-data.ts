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
  // refunded after the fact (goodwill gesture, complaint, etc).
  refundedAt: string | null
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

type DemoOrderSeed = Omit<DemoOrder, 'billingAddress' | 'history' | 'amount' | 'refundedAt'>

const DEMO_ORDER_SEEDS: DemoOrderSeed[] = [
  {
    id: 'demo-1',
    orderNumber: 'CMD-2026-0142',
    employeeName: 'Camille Roussel',
    employeeEmail: 'camille.roussel@atlanticdigital.fr',
    employeePhone: '06 12 34 56 78',
    organizationName: 'Atlantic Digital',
    status: 'livree',
    deliveryMode: 'delivery',
    address: '12 Rue de Strasbourg, 44000 Nantes',
    createdAt: '2026-06-28T09:15:00Z',
    items: [
      { productName: 'Blend KAWA — Grains 1kg', quantity: 3, imageUrl: '/products/cafes/blend-kawa-600.jpg', unit: 'Kg', unitPriceTTC: 26.0, vatRate: 0.055 },
      { productName: 'Détartrant machine à café', quantity: 1, imageUrl: '/products/entretien/durgol.png', unit: 'unité', unitPriceTTC: 6.5, vatRate: 0.2 },
    ],
  },
  {
    id: 'demo-2',
    orderNumber: 'CMD-2026-0141',
    employeeName: 'Hugo Ferreira',
    employeeEmail: 'hugo.ferreira@colbert-assurances.fr',
    employeePhone: '06 23 45 67 89',
    organizationName: 'Colbert Assurances',
    status: 'en_preparation',
    deliveryMode: 'pickup',
    address: '8 Quai de Versailles, 44000 Nantes',
    createdAt: '2026-06-27T14:02:00Z',
    items: [{ productName: 'Rosa Blend — Grains 1kg', quantity: 2, imageUrl: '/products/cafes/rosa-blend-600.jpg', unit: 'Kg', unitPriceTTC: 27.0, vatRate: 0.055 }],
  },
  {
    id: 'demo-3',
    orderNumber: 'CMD-2026-0140',
    employeeName: 'Léa Bourdin',
    employeeEmail: 'lea.bourdin@atlanticdigital.fr',
    employeePhone: '06 34 56 78 90',
    organizationName: 'Atlantic Digital',
    status: 'en_cours',
    deliveryMode: 'delivery',
    address: '12 Rue de Strasbourg, 44000 Nantes',
    createdAt: '2026-06-26T11:40:00Z',
    items: [{ productName: 'Moka Lekempti — Moulu filtre 1kg', quantity: 1, imageUrl: '/products/cafes/moka-lekempti-600.jpg', unit: 'Kg', unitPriceTTC: 28.5, vatRate: 0.055 }],
  },
  {
    id: 'demo-4',
    orderNumber: 'CMD-2026-0139',
    employeeName: 'Nadia Belkacem',
    employeeEmail: 'nadia.belkacem@studiovertigo.fr',
    employeePhone: '06 45 67 89 01',
    organizationName: 'Studio Vertigo',
    status: 'livree',
    deliveryMode: 'delivery',
    address: '45 Boulevard Guist\'hau, 44000 Nantes',
    createdAt: '2026-06-20T08:30:00Z',
    items: [
      { productName: 'Blend 189 — Grains 1kg', quantity: 4, imageUrl: '/products/cafes/blend-189-600.jpg', unit: 'Kg', unitPriceTTC: 26.5, vatRate: 0.055 },
      { productName: 'Todos Santa Rita — Grains 1kg', quantity: 2, imageUrl: '/products/cafes/todosantarita-600.jpg', unit: 'Kg', unitPriceTTC: 29.0, vatRate: 0.055 },
    ],
  },
  {
    id: 'demo-5',
    orderNumber: 'CMD-2026-0138',
    employeeName: 'Thibault Guérin',
    employeeEmail: 'thibault.guerin@colbert-assurances.fr',
    employeePhone: '06 56 78 90 12',
    organizationName: 'Colbert Assurances',
    status: 'livree',
    deliveryMode: 'delivery',
    address: '8 Quai de Versailles, 44000 Nantes',
    createdAt: '2026-06-15T16:20:00Z',
    items: [{ productName: 'Blend Espresso — Grains 1kg', quantity: 2, imageUrl: '/products/cafes/blend-espresso-600.jpg', unit: 'Kg', unitPriceTTC: 27.5, vatRate: 0.055 }],
  },
  {
    id: 'demo-6',
    orderNumber: 'CMD-2026-0137',
    employeeName: 'Élise Marchand',
    employeeEmail: 'elise.marchand@studiovertigo.fr',
    employeePhone: '06 67 89 01 23',
    organizationName: 'Studio Vertigo',
    status: 'annulee',
    deliveryMode: 'delivery',
    address: '45 Boulevard Guist\'hau, 44000 Nantes',
    createdAt: '2026-06-10T10:05:00Z',
    items: [{ productName: 'Boa Esperança — Grains 1kg', quantity: 1, imageUrl: '/products/cafes/boa-esperanca-600.jpg', unit: 'Kg', unitPriceTTC: 30.0, vatRate: 0.055 }],
  },
  {
    id: 'demo-7',
    orderNumber: 'CMD-2026-0136',
    employeeName: 'Camille Roussel',
    employeeEmail: 'camille.roussel@atlanticdigital.fr',
    employeePhone: '06 12 34 56 78',
    organizationName: 'Atlantic Digital',
    status: 'livree',
    deliveryMode: 'pickup',
    address: '12 Rue de Strasbourg, 44000 Nantes',
    createdAt: '2026-05-30T13:45:00Z',
    items: [{ productName: 'Mamma Mia — Grains 1kg', quantity: 3, imageUrl: '/products/cafes/mamma-mia-600.jpg', unit: 'Kg', unitPriceTTC: 26.0, vatRate: 0.055 }],
  },
  {
    id: 'demo-8',
    orderNumber: 'CMD-2026-0135',
    employeeName: 'Youssef Amrani',
    employeeEmail: 'youssef.amrani@colbert-assurances.fr',
    employeePhone: '06 78 90 12 34',
    organizationName: 'Colbert Assurances',
    status: 'livree',
    deliveryMode: 'delivery',
    address: '8 Quai de Versailles, 44000 Nantes',
    createdAt: '2026-05-18T09:00:00Z',
    items: [{ productName: 'Déca — Moulu espresso 1kg', quantity: 1, imageUrl: '/products/cafes/deca-600.jpg', unit: 'Kg', unitPriceTTC: 28.0, vatRate: 0.055 }],
  },
  {
    id: 'demo-9',
    orderNumber: 'CMD-2026-0134',
    employeeName: 'Manon Perrault',
    employeeEmail: 'manon.perrault@studiovertigo.fr',
    employeePhone: '06 89 01 23 45',
    organizationName: 'Studio Vertigo',
    status: 'livree',
    deliveryMode: 'pickup',
    address: '45 Boulevard Guist\'hau, 44000 Nantes',
    createdAt: '2026-04-22T11:10:00Z',
    items: [{ productName: 'Blend KAWA — Grains 1kg', quantity: 4, imageUrl: '/products/cafes/blend-kawa-600.jpg', unit: 'Kg', unitPriceTTC: 26.0, vatRate: 0.055 }],
  },
  {
    id: 'demo-10',
    orderNumber: 'CMD-2026-0133',
    employeeName: 'Antoine Le Goff',
    employeeEmail: 'antoine.legoff@atlanticdigital.fr',
    employeePhone: '06 90 12 34 56',
    organizationName: 'Atlantic Digital',
    status: 'livree',
    deliveryMode: 'delivery',
    address: '12 Rue de Strasbourg, 44000 Nantes',
    createdAt: '2026-03-14T15:30:00Z',
    items: [{ productName: 'Rosa Blend — Grains 1kg', quantity: 2, imageUrl: '/products/cafes/rosa-blend-600.jpg', unit: 'Kg', unitPriceTTC: 27.0, vatRate: 0.055 }],
  },
  {
    // Demonstrates the mixed case: two employees of the same company,
    // one picking up at the KAWA office, the other delivered on-site —
    // the two pins (company address + KAWA office) turn red/orange
    // independently, with no conflict.
    id: 'demo-11',
    orderNumber: 'CMD-2026-0143',
    employeeName: 'Sarah Klein',
    employeeEmail: 'sarah.klein@colbert-assurances.fr',
    employeePhone: '06 01 23 45 67',
    organizationName: 'Colbert Assurances',
    status: 'en_cours',
    deliveryMode: 'delivery',
    address: '8 Quai de Versailles, 44000 Nantes',
    createdAt: '2026-07-01T10:00:00Z',
    items: [{ productName: 'Déca — Moulu espresso 1kg', quantity: 1, imageUrl: '/products/cafes/deca-600.jpg', unit: 'Kg', unitPriceTTC: 28.0, vatRate: 0.055 }],
  },
  {
    id: 'demo-12',
    orderNumber: 'CMD-2026-0144',
    employeeName: 'Julie Perrin',
    employeeEmail: 'julie.perrin@studiovertigo.fr',
    employeePhone: '06 11 22 33 44',
    organizationName: 'Studio Vertigo',
    status: 'pret',
    deliveryMode: 'delivery',
    address: '45 Boulevard Guist\'hau, 44000 Nantes',
    createdAt: '2026-07-02T09:30:00Z',
    items: [{ productName: 'Boa Esperança — Grains 1kg', quantity: 2, imageUrl: '/products/cafes/boa-esperanca-600.jpg', unit: 'Kg', unitPriceTTC: 30.0, vatRate: 0.055 }],
  },
]

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
export const DEMO_ORDERS: DemoOrder[] = DEMO_ORDER_SEEDS.map((seed, i) => ({
  ...seed,
  billingAddress: seed.address,
  amount: computeOrderTotals(seed.items).totalTTC,
  history: buildSeedHistory(seed, i),
  refundedAt: null,
}))

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

export const ORDER_STATUS_ACTION_LABELS: Partial<Record<DemoOrderStatus, string>> = {
  en_cours: 'Passer en préparation',
  en_preparation: "Marquer prêt à l'envoi",
  pret: 'Marquer livrée',
}

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

// Refunding is a separate track from the delivery status — there's no real
// payment/refund pipeline yet, so this only records the fact for now (who
// refunded, when), it doesn't move any money.
export function refundDemoOrder(id: string, actor: string) {
  const order = DEMO_ORDERS.find((o) => o.id === id)
  if (!order || order.refundedAt) return null
  order.refundedAt = new Date().toISOString()
  pushHistory(order, actor, 'Remboursement effectué')
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

// Two independent signals plotted as two different pins, so a company
// with one employee picking up and another getting delivered never has to
// pick a single color for both: the company pin only tracks deliveries to
// its address, the KAWA office pin only tracks pending pickups.
export function getClientMapPins(): ClientMapPin[] {
  const companyPins: ClientMapPin[] = DEMO_CLIENT_PINS.map((pin) => {
    const hasPendingDelivery = DEMO_ORDERS.some(
      (order) =>
        order.organizationName === pin.organizationName &&
        order.deliveryMode === 'delivery' &&
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

  const hasPendingPickup = DEMO_ORDERS.some(
    (order) => order.deliveryMode === 'pickup' && ACTIVE_ORDER_STATUSES.includes(order.status)
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

  return [...companyPins, officePin]
}
