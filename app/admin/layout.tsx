import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/actions/auth'
import { isKawaStaffEmail } from '@/lib/is-kawa-staff'
import { AdminNav } from './nav'
import { AdminMobileNav } from './mobile-nav'

export const metadata: Metadata = {
  title: 'KAWA admin',
}

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

  // MFA is opt-in (app/admin/securite) but enforced from the moment a staff
  // member has a verified TOTP factor: nextLevel only becomes 'aal2' once
  // one exists, so this doesn't affect accounts that haven't enrolled yet.
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()
  if (aal && aal.nextLevel === 'aal2' && aal.currentLevel !== 'aal2') {
    // A verified recovery code (lost authenticator device) grants a 12h
    // window instead of real aal2 — see supabase/migrations/0036_mfa_recovery.sql
    // for why this can only ever be set by consume_mfa_recovery_code().
    const { data: profile } = await supabase
      .from('profiles')
      .select('mfa_recovery_bypass_until')
      .eq('id', user.id)
      .maybeSingle()
    const bypassActive =
      !!profile?.mfa_recovery_bypass_until &&
      new Date(profile.mfa_recovery_bypass_until).getTime() > Date.now()

    if (!bypassActive) {
      redirect('/connexion/mfa?next=/admin')
    }
  }

  // Unread badge for "Canal d'inscriptions" — count of signup_attempts
  // since this browser's last visit (see app/admin/inscriptions/actions.ts,
  // MarkSeen). No cookie yet (first time in the channel) counts everything,
  // which is the right default: draw attention to it at least once.
  const cookieStore = await cookies()
  const lastSeen = cookieStore.get('inscriptions_last_seen')?.value
  const { count: inscriptionsUnreadCount } = await supabase
    .from('signup_attempts')
    .select('id', { count: 'exact', head: true })
    .gt('created_at', lastSeen ?? '1970-01-01')

  // Same pattern for "Canal de sécurité" (app/admin/securite/evenements).
  const securityEventsLastSeen = cookieStore.get('securite_evenements_last_seen')?.value
  const { count: securityEventsUnreadCount } = await supabase
    .from('security_events')
    .select('id', { count: 'exact', head: true })
    .gt('created_at', securityEventsLastSeen ?? '1970-01-01')

  return (
    <div className="min-h-screen bg-kawa-50 flex flex-col md:flex-row">
      <AdminMobileNav
        userEmail={user.email ?? ''}
        logoutAction={logout}
        inscriptionsUnreadCount={inscriptionsUnreadCount ?? 0}
        securityEventsUnreadCount={securityEventsUnreadCount ?? 0}
      />
      <aside className="hidden md:flex w-64 shrink-0 border-r border-kawa-200 bg-white flex-col">
        <div className="px-5 py-5 border-b border-kawa-200">
          <Link href="/admin" className="font-bold text-kawa-800">
            KAWA admin
          </Link>
        </div>
        <div className="flex-1 px-3 py-4">
          <AdminNav
            inscriptionsUnreadCount={inscriptionsUnreadCount ?? 0}
            securityEventsUnreadCount={securityEventsUnreadCount ?? 0}
          />
        </div>
        <div className="px-5 py-4 border-t border-kawa-200 text-sm">
          <p className="text-kawa-500 truncate">{user.email}</p>
          <Link href="/compte/avantage" className="block mt-2 text-sky-700 underline">
            Voir l&apos;espace salarié
          </Link>
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
