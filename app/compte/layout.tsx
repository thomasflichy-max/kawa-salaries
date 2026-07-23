import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getEmployee } from '@/lib/get-employee'
import { createClient } from '@/lib/supabase/server'
import { EmployeeNav } from './nav'
import { SupportButton } from './support-button'

export const metadata: Metadata = {
  title: 'KAWA salarié',
}

export default async function CompteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user } = await getEmployee()

  const supabase = await createClient()
  const { data: cartItems } = await supabase
    .from('cart_items')
    .select('quantity')
    .eq('user_id', user.id)
  const cartItemCount = (cartItems ?? []).reduce((sum, item) => sum + item.quantity, 0)

  return (
    <div className="min-h-screen bg-kawa-50">
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
      <EmployeeNav cartItemCount={cartItemCount} />
      <main className="max-w-4xl mx-auto px-6 py-10">{children}</main>
      <SupportButton />
    </div>
  )
}
