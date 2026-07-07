import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/actions/auth'
import { isKawaStaffEmail } from '@/lib/is-kawa-staff'

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
    <div className="min-h-screen bg-kawa-50">
      <header className="bg-white border-b border-kawa-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/admin" className="font-bold text-kawa-800">
            kawa admin
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-kawa-500">{user.email}</span>
            <form action={logout}>
              <button className="text-sky-700 underline">
                Se déconnecter
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="max-w-6xl mx-auto px-6 py-8">{children}</div>
    </div>
  )
}
