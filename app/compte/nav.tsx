'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PRODUCT_CATEGORIES } from '@/lib/product-categories'

const TABS = [
  { href: '/compte/avantage', label: 'Votre Avantage' },
  { href: '/compte/produits', label: 'Produits' },
  { href: '/compte/commandes', label: 'Mes Commandes' },
  { href: '/compte', label: 'Mon Compte' },
  { href: '/compte/panier', label: 'Mon Panier' },
]

const tabClasses = (isActive: boolean) =>
  `px-4 py-4 text-lg font-medium whitespace-nowrap border-b-2 transition ${
    isActive
      ? 'border-sky-500 text-kawa-900'
      : 'border-transparent text-kawa-500 hover:text-kawa-800 hover:border-sky-500'
  }`

export function EmployeeNav() {
  const pathname = usePathname()

  return (
    <nav className="bg-white border-b border-kawa-200">
      <div className="w-[80%] mx-auto flex justify-between">
        {TABS.map((tab) => {
          if (tab.href === '/compte/produits') {
            const isActive = pathname.startsWith('/compte/produits')
            return (
              <div key={tab.href} className="relative group flex">
                <Link href={tab.href} className={tabClasses(isActive)}>
                  {tab.label}
                </Link>
                <div className="absolute left-0 top-full hidden group-hover:block bg-white border border-kawa-200 rounded-lg shadow-lg py-2 min-w-[220px] z-10">
                  {PRODUCT_CATEGORIES.map((category) => (
                    <Link
                      key={category.slug}
                      href={`/compte/produits/${category.slug}`}
                      className="block px-4 py-2 text-sm text-kawa-700 hover:bg-kawa-50 hover:underline decoration-sky-500 decoration-2 underline-offset-4 whitespace-nowrap"
                    >
                      {category.label}
                    </Link>
                  ))}
                </div>
              </div>
            )
          }

          const isActive = pathname === tab.href
          return (
            <Link key={tab.href} href={tab.href} className={tabClasses(isActive)}>
              {tab.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
