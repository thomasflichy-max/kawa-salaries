import Image from 'next/image'
import Link from 'next/link'

export function LegalHeader() {
  return (
    <header className="bg-white border-b border-kawa-100">
      <div className="max-w-4xl mx-auto px-6 py-4 flex items-center">
        <Link href="/compte/avantage">
          <Image
            src="/logo-kawa-nantes.png"
            alt="Kawa Nantes"
            width={183}
            height={60}
            className="h-16 w-auto"
          />
        </Link>
      </div>
    </header>
  )
}
