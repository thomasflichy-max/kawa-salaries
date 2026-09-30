import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SignupForm } from '@/app/signup-form'
import { getLocale } from '@/lib/i18n/locale'
import { getDictionary } from '@/lib/i18n/dictionary'
import { LanguageSwitcher } from '@/app/language-switcher'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/compte/avantage')
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
            <h1 className="text-2xl font-bold text-kawa-800">{t.home.title}</h1>
            <p className="text-kawa-500 mt-2">{t.home.subtitle}</p>
          </div>

          <SignupForm t={t.signupForm} passwordForm={t.passwordForm} passwordInput={t.passwordInput} />

          <p className="text-center text-sm text-kawa-400 mt-6">
            {t.home.alreadyAccount}{' '}
            <Link href="/connexion" className="text-sky-700 underline">
              {t.home.login}
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
