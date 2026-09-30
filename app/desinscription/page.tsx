import Link from 'next/link'
import { LegalHeader } from '../legal-header'
import { createClient } from '@/lib/supabase/server'
import { getLocale } from '@/lib/i18n/locale'
import { getDictionary } from '@/lib/i18n/dictionary'
import { LanguageSwitcher } from '@/app/language-switcher'

// One-click unsubscribe target for the link in marketing emails. Public (no
// session): the ?t= token is the per-profile marketing_unsub_token, checked
// by the unsubscribe_marketing() security-definer function.
export default async function DesinscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>
}) {
  const { t: token } = await searchParams
  const locale = await getLocale()
  const dict = getDictionary(locale)
  const t = dict.desinscription

  let status: 'ok' | 'invalid' = 'invalid'
  if (token) {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('unsubscribe_marketing', { p_token: token })
    if (!error && data) status = 'ok'
    else if (error) console.error('[desinscription] rpc failed:', error)
  }

  return (
    <div className="min-h-screen bg-kawa-50">
      <LegalHeader />
      <main className="flex justify-center px-6 py-16">
        <div className="max-w-md w-full flex flex-col gap-3">
          <div className="flex justify-end">
            <LanguageSwitcher locale={locale} labels={dict.switcher} />
          </div>
          <div className="bg-white rounded-2xl border border-kawa-200 p-8 flex flex-col gap-4 text-center">
            {status === 'ok' ? (
              <>
                <h1 className="text-2xl font-bold text-kawa-800">{t.confirmedTitle}</h1>
                <p className="text-kawa-600 text-sm leading-relaxed">{t.confirmedBody}</p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-kawa-800">{dict.retrait.invalidTitle}</h1>
                <p className="text-kawa-600 text-sm leading-relaxed">{t.invalidBody}</p>
                <Link href="/compte" className="text-sky-700 underline text-sm">
                  {t.goToAccount}
                </Link>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
