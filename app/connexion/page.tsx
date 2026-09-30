import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isKawaStaffEmail } from '@/lib/is-kawa-staff'
import { getLocale } from '@/lib/i18n/locale'
import { getDictionary } from '@/lib/i18n/dictionary'
import { LanguageSwitcher } from '@/app/language-switcher'
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

  const locale = await getLocale()
  const t = getDictionary(locale)

  return (
    <main className="min-h-screen bg-kawa-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md flex flex-col gap-3">
        <div className="flex justify-end">
          <LanguageSwitcher locale={locale} labels={t.switcher} />
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm w-full">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-kawa-800">{t.login.title}</h1>
            <p className="text-kawa-500 mt-2">{t.home.subtitle}</p>
          </div>

          {erreur === 'lien_invalide' && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">
              {t.login.errorLienInvalide}
            </p>
          )}
          {erreur === 'compte_desactive' && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">
              {t.login.errorCompteDesactive}
            </p>
          )}
          {erreur === 'compte_suspendu' && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">
              {t.login.errorCompteSuspendu}
            </p>
          )}

          <LoginForm next={next ?? '/compte/avantage'} t={t.login} passwordForm={t.passwordForm} passwordInput={t.passwordInput} />

          <p className="text-center text-sm text-kawa-400 mt-6">
            {t.login.noAccount}{' '}
            <Link href="/" className="text-sky-700 underline">
              {t.login.createAccount}
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
