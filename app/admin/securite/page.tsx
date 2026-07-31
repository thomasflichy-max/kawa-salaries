import { createClient } from '@/lib/supabase/server'
import { MfaSettings } from './mfa-settings'
import { WebauthnSettings } from './webauthn-settings'
import { ChangePasswordForm } from '@/app/compte/change-password-form'

export default async function AdminSecuritePage() {
  const supabase = await createClient()
  const { data: factorsData } = await supabase.auth.mfa.listFactors()
  const totpFactor = factorsData?.totp?.find((f) => f.status === 'verified') ?? null
  const webauthnFactor = factorsData?.webauthn?.find((f) => f.status === 'verified') ?? null

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-kawa-800">Sécurité</h1>

      <section className="bg-white rounded-2xl border border-kawa-200 overflow-hidden">
        <h2 className="text-sm font-semibold text-kawa-800 px-5 py-4 border-b border-kawa-200">
          Empreinte digitale / Face ID
        </h2>
        <div className="p-5">
          <WebauthnSettings
            hasVerifiedFactor={!!webauthnFactor}
            factorId={webauthnFactor?.id ?? null}
          />
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-kawa-200 overflow-hidden">
        <h2 className="text-sm font-semibold text-kawa-800 px-5 py-4 border-b border-kawa-200">
          Application d&apos;authentification (code à 6 chiffres)
        </h2>
        <div className="p-5">
          <MfaSettings hasVerifiedFactor={!!totpFactor} factorId={totpFactor?.id ?? null} />
        </div>
      </section>

      <section className="bg-white rounded-2xl border border-kawa-200 overflow-hidden">
        <h2 className="text-sm font-semibold text-kawa-800 px-5 py-4 border-b border-kawa-200">
          Mot de passe
        </h2>
        <div className="p-5">
          <ChangePasswordForm />
        </div>
      </section>
    </div>
  )
}
