import Link from 'next/link'
import { LegalHeader } from '../legal-header'
import { createClient } from '@/lib/supabase/server'

// One-click unsubscribe target for the link in marketing emails. Public (no
// session): the ?t= token is the per-profile marketing_unsub_token, checked
// by the unsubscribe_marketing() security-definer function.
export default async function DesinscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>
}) {
  const { t } = await searchParams

  let status: 'ok' | 'invalid' = 'invalid'
  if (t) {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('unsubscribe_marketing', { p_token: t })
    if (!error && data) status = 'ok'
    else if (error) console.error('[desinscription] rpc failed:', error)
  }

  return (
    <div className="min-h-screen bg-kawa-50">
      <LegalHeader />
      <main className="flex justify-center px-6 py-16">
        <div className="max-w-md w-full bg-white rounded-2xl border border-kawa-200 p-8 flex flex-col gap-4 text-center">
          {status === 'ok' ? (
            <>
              <h1 className="text-2xl font-bold text-kawa-800">Désinscription confirmée</h1>
              <p className="text-kawa-600 text-sm leading-relaxed">
                Vous ne recevrez plus les offres et actualités commerciales de KAWA. Les emails
                liés à vos commandes (confirmations, factures) continueront de vous être envoyés.
                Vous pouvez vous réabonner à tout moment depuis Mon Compte.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-kawa-800">Lien invalide</h1>
              <p className="text-kawa-600 text-sm leading-relaxed">
                Ce lien de désinscription n&apos;est pas valide ou a expiré. Vous pouvez gérer vos
                préférences directement depuis votre compte.
              </p>
              <Link href="/compte" className="text-sky-700 underline text-sm">
                Aller à Mon Compte
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
