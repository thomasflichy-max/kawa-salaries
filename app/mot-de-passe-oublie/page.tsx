import Link from 'next/link'
import { getLocale } from '@/lib/i18n/locale'
import { getDictionary } from '@/lib/i18n/dictionary'
import { LanguageSwitcher } from '@/app/language-switcher'
import { RequestResetForm } from './request-form'

export default async function MotDePasseOubliePage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string }>
}) {
  const { erreur } = await searchParams
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
            <h1 className="text-2xl font-bold text-kawa-800">{t.passwordReset.requestTitle}</h1>
            <p className="text-kawa-500 mt-2">{t.passwordReset.requestSubtitle}</p>
          </div>

          {erreur === 'lien_invalide' && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">
              {t.passwordReset.invalidLink}
            </p>
          )}

          <RequestResetForm t={t.passwordReset} />

          <p className="text-center text-sm text-kawa-400 mt-6">
            <Link href="/connexion" className="text-sky-700 underline">
              {t.passwordReset.backToLogin}
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
