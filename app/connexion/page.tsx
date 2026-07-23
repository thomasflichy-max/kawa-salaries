import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isKawaStaffEmail } from '@/lib/is-kawa-staff'
import { LoginForm } from './login-form'

export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; erreur?: string }>
}) {
  const { next, erreur } = await searchParams
  const wantsAdmin = next === '/admin' || next?.startsWith('/admin/')

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    // Guard against a redirect loop: a logged-in non-staff user hitting
    // /admin would otherwise bounce here (via the admin guard) and straight
    // back to /admin (via this redirect) forever.
    redirect(wantsAdmin && !isKawaStaffEmail(user.email) ? '/compte/avantage' : next || '/compte/avantage')
  }

  return (
    <main className="min-h-screen bg-kawa-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-kawa-800">Connexion</h1>
          <p className="text-kawa-500 mt-2">Accédez à vos avantages KAWA</p>
        </div>

        {erreur === 'lien_invalide' && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">
            Ce lien n&apos;est plus valide. Si c&apos;était un lien de confirmation de compte,
            réessayez de vous connecter — il se peut que le compte soit déjà actif.
          </p>
        )}

        <LoginForm next={next ?? '/compte/avantage'} />

        <p className="text-center text-sm text-kawa-400 mt-6">
          Pas encore de compte ?{' '}
          <Link href="/" className="text-sky-700 underline">
            Créer un compte
          </Link>
        </p>
        {wantsAdmin && (
          <p className="text-center text-sm text-kawa-400 mt-2">
            Équipe KAWA sans accès admin ?{' '}
            <Link href="/inscription-staff" className="text-sky-700 underline">
              Créer mon accès
            </Link>
          </p>
        )}
      </div>
    </main>
  )
}
