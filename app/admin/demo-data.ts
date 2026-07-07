// Placeholder data for the parts of the admin dashboard that depend on a
// real order/checkout pipeline (not built yet). Every screen that reads from
// here must show a "données de démonstration" notice — see DEMO_NOTICE.
// Replace this module entirely once orders are actually written to the
// `orders` table by a real checkout flow.

export const DEMO_NOTICE =
  'Données de démonstration — en attente du paiement en ligne et de la facturation.'

export type DemoOrderStatus = 'pending' | 'processing' | 'delivered' | 'cancelled'

export type DemoOrderItem = {
  productName: string
  quantity: number
}

export type DemoOrder = {
  id: string
  orderNumber: string
  employeeName: string
  organizationName: string
  status: DemoOrderStatus
  address: string
  amount: number
  createdAt: string
  items: DemoOrderItem[]
}

export const DEMO_ORDER_STATUS_LABELS: Record<DemoOrderStatus, string> = {
  pending: 'En attente',
  processing: 'En préparation',
  delivered: 'Livrée',
  cancelled: 'Annulée',
}

export const DEMO_ORDER_STATUS_STYLES: Record<DemoOrderStatus, string> = {
  pending: 'bg-amber-50 text-amber-700',
  processing: 'bg-sky-50 text-sky-700',
  delivered: 'bg-emerald-50 text-emerald-700',
  cancelled: 'bg-red-50 text-red-700',
}

export const DEMO_ORDERS: DemoOrder[] = [
  {
    id: 'demo-1',
    orderNumber: 'CMD-2026-0142',
    employeeName: 'Camille Roussel',
    organizationName: 'Atlantic Digital',
    status: 'delivered',
    address: '12 Rue de Strasbourg, 44000 Nantes',
    amount: 143.4,
    createdAt: '2026-06-28T09:15:00Z',
    items: [
      { productName: 'Blend KAWA — Grains 1kg', quantity: 3 },
      { productName: 'Détartrant machine à café', quantity: 1 },
    ],
  },
  {
    id: 'demo-2',
    orderNumber: 'CMD-2026-0141',
    employeeName: 'Hugo Ferreira',
    organizationName: 'Colbert Assurances',
    status: 'processing',
    address: '8 Quai de Versailles, 44000 Nantes',
    amount: 79.8,
    createdAt: '2026-06-27T14:02:00Z',
    items: [{ productName: 'Rosa Blend — Grains 1kg', quantity: 2 }],
  },
  {
    id: 'demo-3',
    orderNumber: 'CMD-2026-0140',
    employeeName: 'Léa Bourdin',
    organizationName: 'Atlantic Digital',
    status: 'pending',
    address: '12 Rue de Strasbourg, 44000 Nantes',
    amount: 31.9,
    createdAt: '2026-06-26T11:40:00Z',
    items: [{ productName: 'Moka Lekempti — Moulu 1kg', quantity: 1 }],
  },
  {
    id: 'demo-4',
    orderNumber: 'CMD-2026-0139',
    employeeName: 'Nadia Belkacem',
    organizationName: 'Studio Vertigo',
    status: 'delivered',
    address: '45 Boulevard Guist\'hau, 44000 Nantes',
    amount: 210.6,
    createdAt: '2026-06-20T08:30:00Z',
    items: [
      { productName: 'Blend 189 — Grains 1kg', quantity: 4 },
      { productName: 'Todos Santa Rita — Grains 1kg', quantity: 2 },
    ],
  },
  {
    id: 'demo-5',
    orderNumber: 'CMD-2026-0138',
    employeeName: 'Thibault Guérin',
    organizationName: 'Colbert Assurances',
    status: 'delivered',
    address: '8 Quai de Versailles, 44000 Nantes',
    amount: 63.8,
    createdAt: '2026-06-15T16:20:00Z',
    items: [{ productName: 'Blend Espresso — Grains 1kg', quantity: 2 }],
  },
  {
    id: 'demo-6',
    orderNumber: 'CMD-2026-0137',
    employeeName: 'Élise Marchand',
    organizationName: 'Studio Vertigo',
    status: 'cancelled',
    address: '45 Boulevard Guist\'hau, 44000 Nantes',
    amount: 31.9,
    createdAt: '2026-06-10T10:05:00Z',
    items: [{ productName: 'Boa Esperança — Grains 1kg', quantity: 1 }],
  },
  {
    id: 'demo-7',
    orderNumber: 'CMD-2026-0136',
    employeeName: 'Camille Roussel',
    organizationName: 'Atlantic Digital',
    status: 'delivered',
    address: '12 Rue de Strasbourg, 44000 Nantes',
    amount: 95.7,
    createdAt: '2026-05-30T13:45:00Z',
    items: [{ productName: 'Mamma Mia — Grains 1kg', quantity: 3 }],
  },
  {
    id: 'demo-8',
    orderNumber: 'CMD-2026-0135',
    employeeName: 'Youssef Amrani',
    organizationName: 'Colbert Assurances',
    status: 'delivered',
    address: '8 Quai de Versailles, 44000 Nantes',
    amount: 31.9,
    createdAt: '2026-05-18T09:00:00Z',
    items: [{ productName: 'Déca — Moulu 1kg', quantity: 1 }],
  },
  {
    id: 'demo-9',
    orderNumber: 'CMD-2026-0134',
    employeeName: 'Manon Perrault',
    organizationName: 'Studio Vertigo',
    status: 'delivered',
    address: '45 Boulevard Guist\'hau, 44000 Nantes',
    amount: 127.6,
    createdAt: '2026-04-22T11:10:00Z',
    items: [{ productName: 'Blend KAWA — Grains 1kg', quantity: 4 }],
  },
  {
    id: 'demo-10',
    orderNumber: 'CMD-2026-0133',
    employeeName: 'Antoine Le Goff',
    organizationName: 'Atlantic Digital',
    status: 'delivered',
    address: '12 Rue de Strasbourg, 44000 Nantes',
    amount: 63.8,
    createdAt: '2026-03-14T15:30:00Z',
    items: [{ productName: 'Rosa Blend — Grains 1kg', quantity: 2 }],
  },
]

export type DemoClientPin = {
  organizationName: string
  address: string
  // Approximate coordinates around Nantes, used only to place a dot on the
  // demo map — not geocoded from the real address yet.
  lat: number
  lng: number
}

export const DEMO_CLIENT_PINS: DemoClientPin[] = [
  { organizationName: 'Atlantic Digital', address: '12 Rue de Strasbourg, 44000 Nantes', lat: 47.219, lng: -1.552 },
  { organizationName: 'Colbert Assurances', address: '8 Quai de Versailles, 44000 Nantes', lat: 47.2175, lng: -1.5486 },
  { organizationName: 'Studio Vertigo', address: '45 Boulevard Guist\'hau, 44000 Nantes', lat: 47.2138, lng: -1.5595 },
]
