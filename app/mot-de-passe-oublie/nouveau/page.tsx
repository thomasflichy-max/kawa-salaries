import { getLocale } from '@/lib/i18n/locale'
import { getDictionary } from '@/lib/i18n/dictionary'
import { LanguageSwitcher } from '@/app/language-switcher'
import { NewPasswordForm } from './new-password-form'

export default async function NouveauMotDePassePage() {
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
            <h1 className="text-2xl font-bold text-kawa-800">{t.passwordReset.newPasswordTitle}</h1>
            <p className="text-kawa-500 mt-2">{t.passwordReset.newPasswordSubtitle}</p>
          </div>

          <NewPasswordForm t={t.passwordReset} passwordForm={t.passwordForm} passwordInput={t.passwordInput} />
        </div>
      </div>
    </main>
  )
}
