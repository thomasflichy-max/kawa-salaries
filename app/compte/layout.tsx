import Image from 'next/image'
import { getEmployee } from '@/lib/get-employee'
import { EmployeeNav } from './nav'

export default async function CompteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await getEmployee()

  return (
    <div className="min-h-screen bg-kawa-50">
      <header className="bg-white border-b border-kawa-100">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center">
          <Image
            src="/logo-kawa-nantes.png"
            alt="Kawa Nantes"
            width={183}
            height={60}
            className="h-16 w-auto"
          />
        </div>
      </header>
      <EmployeeNav />
      <main className="max-w-4xl mx-auto px-6 py-10">{children}</main>
    </div>
  )
}
