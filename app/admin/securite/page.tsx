import { createClient } from '@/lib/supabase/server'
import { MfaSettings } from './mfa-settings'
import { WebauthnSettings } from './webauthn-settings'
import { ChangePasswordForm } from '@/app/compte/change-password-form'

// Supabase rejects WebAuthn enrollment on this project ("MFA enroll is
// disabled for WebAuthn") — there's no dashboard toggle for it either
// (Authentication > Multi-Factor Authentication only exposes TOTP and
// Phone/SMS), unlike the other two factor types. Hidden until Supabase
// enables it project-side; the feature itself (webauthn-settings.tsx,
// app/connexion/mfa's biometric option) is otherwise complete — flip this
// back to true to re-show it, no other changes needed.
const WEBAUTHN_ENABLED = false

export default async function AdminSecuritePage() {
  const supabase = await createClient()
  const { data: factorsData } = await supabase.auth.mfa.listFactors()
  const totpFactor = factorsData?.totp?.find((f) => f.status === 'verified') ?? null
  const webauthnFactor = factorsData?.webauthn?.find((f) => f.status === 'verified') ?? null

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-bold text-kawa-800">Sécurité</h1>

      {WEBAUTHN_ENABLED && (
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
      )}

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
