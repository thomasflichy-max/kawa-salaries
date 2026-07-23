'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AdminNav } from './nav'

function MenuIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  )
}

// Mobile-only top bar + slide-in drawer, shown below the `md` breakpoint
// where app/admin/layout.tsx hides the fixed sidebar entirely. Duplicates
// the sidebar's content (logo, nav, account footer) rather than sharing it
// via a prop — same drawer/overlay idiom as the order preview modal
// (fixed inset-0 bg-black/40 + stopPropagation), just no external library.
export function AdminMobileNav({
  userEmail,
  logoutAction,
}: {
  userEmail: string
  logoutAction: () => void
}) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="md:hidden flex items-center justify-between px-5 py-4 border-b border-kawa-200 bg-white">
        <Link href="/admin" className="font-bold text-kawa-800">
          KAWA admin
        </Link>
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Ouvrir le menu"
          className="text-kawa-700 p-1"
        >
          <MenuIcon />
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 md:hidden bg-black/40"
          onClick={() => setOpen(false)}
        >
          <div
            className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-5 border-b border-kawa-200 flex items-center justify-between">
              <Link href="/admin" className="font-bold text-kawa-800" onClick={() => setOpen(false)}>
                KAWA admin
              </Link>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fermer"
                className="text-kawa-400 hover:text-kawa-700 text-lg leading-none"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 px-3 py-4" onClick={() => setOpen(false)}>
              <AdminNav />
            </div>
            <div className="px-5 py-4 border-t border-kawa-200 text-sm">
              <p className="text-kawa-500 truncate">{userEmail}</p>
              <Link
                href="/compte/avantage"
                onClick={() => setOpen(false)}
                className="block mt-2 text-sky-700 underline"
              >
                Voir l&apos;espace salarié
              </Link>
              <form action={logoutAction} className="mt-2">
                <button className="text-sky-700 underline">Se déconnecter</button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
