import Image from 'next/image'
import Link from 'next/link'

export function SiteFooter() {
  return (
    <footer className="bg-kawa-50 text-kawa-900 mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-8">
        <div className="flex flex-col gap-2 text-sm">
          <a
            href="https://www.google.com/maps/search/?api=1&query=75+Bd+Ernest+Dalby%2C+44000+Nantes"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-sky-700 hover:underline transition w-fit"
          >
            75 Bd Ernest Dalby, 44000 Nantes
          </a>
          <a href="tel:0977715302" className="hover:text-sky-700 hover:underline transition w-fit">
            09 77 71 53 02
          </a>
          <a
            href="mailto:nantes@kawa.coffee"
            className="hover:text-sky-700 hover:underline transition w-fit"
          >
            nantes@kawa.coffee
          </a>
        </div>

        <div className="flex items-center gap-5">
          <a
            href="https://kawanantespro.com"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Site web KAWA Nantes"
          >
            <Image
              src="/logo-kawa-nantes-transparent.png"
              alt="KAWA Nantes"
              width={100}
              height={100}
              className="h-32 w-32 opacity-90 hover:opacity-100 transition"
            />
          </a>
          <a
            href="https://www.linkedin.com/company/kawa-coffee-nantes/?viewAsMember=true"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn KAWA Coffee Nantes"
            className="text-kawa-900 hover:text-sky-700 transition"
          >
            <svg viewBox="0 0 24 24" width="40" height="40" fill="currentColor" aria-hidden="true">
              <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z" />
            </svg>
          </a>
        </div>
      </div>

      <div className="border-t border-kawa-200">
        <div className="max-w-6xl mx-auto px-6 py-4 text-xs text-kawa-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <span>© 2026 KAWA Coffee Nantes — Tous droits réservés</span>
          <div className="flex flex-wrap gap-x-2">
            <Link href="/mentions-legales" className="hover:text-sky-700 hover:underline">
              Mentions légales
            </Link>
            <span>-</span>
            <Link href="/confidentialite" className="hover:text-sky-700 hover:underline">
              Politique de confidentialité
            </Link>
            <span>-</span>
            <Link href="/cgv" className="hover:text-sky-700 hover:underline">
              CGV
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
