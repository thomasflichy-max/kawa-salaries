import { createClient } from '@/lib/supabase/server'
import { MfaSettings } from './mfa-settings'

export default async function AdminSecuritePage() {
  const supabase = await createClient()
  const { data: factorsData } = await supabase.auth.mfa.listFactors()
  const verifiedFactor = factorsData?.totp?.find((f) => f.status === 'verified') ?? null

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-kawa-800">Sécurité</h1>

      <section className="bg-white rounded-2xl border border-kawa-200 overflow-hidden">
        <h2 className="text-sm font-semibold text-kawa-800 px-5 py-4 border-b border-kawa-200">
          Vérification en deux étapes
        </h2>
        <div className="p-5">
          <MfaSettings hasVerifiedFactor={!!verifiedFactor} factorId={verifiedFactor?.id ?? null} />
        </div>
      </section>
    </div>
  )
}
