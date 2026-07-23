'use client'

import { useState } from 'react'
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
  `px-3 py-3 text-sm sm:px-4 sm:py-4 sm:text-lg font-medium whitespace-nowrap border-b-2 transition ${
    isActive
      ? 'border-sky-500 text-kawa-900'
      : 'border-transparent text-kawa-500 hover:text-kawa-800 hover:border-sky-500'
  }`

export function EmployeeNav({ cartItemCount = 0 }: { cartItemCount?: number }) {
  const pathname = usePathname()
  const [produitsOpen, setProduitsOpen] = useState(false)

  return (
    <nav className="bg-white border-b border-kawa-200">
      <div className="max-w-4xl mx-auto px-6 flex flex-wrap">
        {TABS.map((tab) => {
          if (tab.href === '/compte/produits') {
            const isActive = pathname.startsWith('/compte/produits')
            return (
              <div key={tab.href} className="relative flex items-stretch group">
                <Link href={tab.href} className={tabClasses(isActive)}>
                  {tab.label}
                </Link>
                <button
                  type="button"
                  onClick={() => setProduitsOpen((v) => !v)}
                  aria-label="Voir les catégories de produits"
                  className={`px-1.5 flex items-center border-b-2 transition ${
                    isActive ? 'border-sky-500 text-kawa-900' : 'border-transparent text-kawa-500 hover:text-kawa-800'
                  }`}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {/* Backdrop only needed for the tap-to-open path (mobile) — hover
                    dismisses on its own via group-hover when the mouse leaves. */}
                {produitsOpen && (
                  <div className="fixed inset-0 z-10" onClick={() => setProduitsOpen(false)} />
                )}
                {/* Shown on hover (instant, mouse/trackpad — same fluid feel as
                    before) or via the chevron tap-toggle above (touch devices,
                    which have no hover). */}
                <div
                  className={`absolute left-0 top-full bg-white border border-kawa-200 rounded-lg shadow-lg py-2 min-w-[220px] z-20 ${
                    produitsOpen ? 'block' : 'hidden group-hover:block'
                  }`}
                >
                  <Link
                    href="/compte/produits"
                    onClick={() => setProduitsOpen(false)}
                    className="block px-4 py-2 text-sm text-kawa-700 hover:bg-kawa-50 hover:underline decoration-sky-500 decoration-2 underline-offset-4 whitespace-nowrap"
                  >
                    Tous les produits
                  </Link>
                  {PRODUCT_CATEGORIES.map((category) => (
                    <Link
                      key={category.slug}
                      href={`/compte/produits/${category.slug}`}
                      onClick={() => setProduitsOpen(false)}
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
            <Link key={tab.href} href={tab.href} className={`${tabClasses(isActive)} flex items-center gap-1.5`}>
              {tab.label}
              {tab.href === '/compte/panier' && cartItemCount > 0 && (
                <span className="bg-sky-500 text-kawa-950 text-xs font-bold rounded-full min-w-5 h-5 px-1 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
