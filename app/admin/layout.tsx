import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/actions/auth'
import { isKawaStaffEmail } from '@/lib/is-kawa-staff'
import { AdminNav } from './nav'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isKawaStaff = isKawaStaffEmail(user?.email)

  // Proxy already redirects unauthenticated/non-staff requests away from
  // /admin; this is the defense-in-depth check close to the data.
  if (!user || !isKawaStaff) {
    redirect('/connexion?next=/admin')
  }

  return (
    <div className="min-h-screen bg-kawa-50 flex">
      <aside className="w-64 shrink-0 border-r border-kawa-200 bg-white flex flex-col">
        <div className="px-5 py-5 border-b border-kawa-200">
          <Link href="/admin" className="font-bold text-kawa-800">
            KAWA admin
          </Link>
        </div>
        <div className="flex-1 px-3 py-4">
          <AdminNav />
        </div>
        <div className="px-5 py-4 border-t border-kawa-200 text-sm">
          <p className="text-kawa-500 truncate">{user.email}</p>
          <form action={logout} className="mt-2">
            <button className="text-sky-700 underline">Se déconnecter</button>
          </form>
        </div>
      </aside>
      <div className="flex-1 min-w-0">
        <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
      </div>
    </div>
  )
}
