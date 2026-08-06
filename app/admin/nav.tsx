'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/admin', label: 'Tableau de bord' },
  { href: '/admin/commandes', label: 'Liste Commande' },
  { href: '/admin/produits', label: 'Products' },
  { href: '/admin/clients', label: 'Ajout Client' },
  { href: '/admin/comptes', label: 'Comptes' },
  { href: '/admin/inscriptions', label: "Canal d'inscriptions" },
  { href: '/admin/securite', label: 'Sécurité' },
  { href: '/admin/securite/evenements', label: 'Account Management' },
]

// '/admin' and '/admin/securite' both now have a child route with its own
// nav entry (e.g. /admin/securite/evenements) — an exact match here stops
// both from lighting up at once when on that child page.
const EXACT_MATCH_ONLY = new Set(['/admin', '/admin/securite'])

export function AdminNav({
  inscriptionsUnreadCount = 0,
  securityEventsUnreadCount = 0,
}: {
  inscriptionsUnreadCount?: number
  securityEventsUnreadCount?: number
}) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const isActive = EXACT_MATCH_ONLY.has(item.href)
          ? pathname === item.href
          : pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
              isActive
                ? 'bg-sky-500 text-kawa-950'
                : 'text-kawa-600 hover:bg-kawa-100 hover:text-kawa-800'
            }`}
          >
            {item.label}
            {item.href === '/admin/inscriptions' && inscriptionsUnreadCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-xs font-bold">
                {inscriptionsUnreadCount > 99 ? '99+' : inscriptionsUnreadCount}
              </span>
            )}
            {item.href === '/admin/securite/evenements' && securityEventsUnreadCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-red-500 text-white text-xs font-bold">
                {securityEventsUnreadCount > 99 ? '99+' : securityEventsUnreadCount}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
