'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV_ITEMS = [
  { href: '/admin', label: 'Tableau de bord' },
  { href: '/admin/commandes', label: 'Liste Commande' },
  { href: '/admin/produits', label: 'Products' },
  { href: '/admin/clients', label: 'Ajout Client' },
  { href: '/admin/comptes', label: 'Comptes' },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const isActive =
          item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              isActive
                ? 'bg-sky-500 text-kawa-950'
                : 'text-kawa-600 hover:bg-kawa-100 hover:text-kawa-800'
            }`}
          >
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}
