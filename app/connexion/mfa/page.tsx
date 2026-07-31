import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/actions/auth'
import { MfaChallengeForm } from './mfa-challenge-form'

export default async function MfaChallengePage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = await searchParams
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/connexion')
  }

  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel()

  // Nothing to verify (already aal2, or MFA not required for this account) —
  // don't show the challenge unnecessarily.
  if (!aal || aal.nextLevel !== 'aal2' || aal.currentLevel === 'aal2') {
    redirect(next || '/admin')
  }

  const { data: factorsData } = await supabase.auth.mfa.listFactors()
  const totpFactor = factorsData?.totp?.find((f) => f.status === 'verified')
  const webauthnFactor = factorsData?.webauthn?.find((f) => f.status === 'verified')

  if (!totpFactor && !webauthnFactor) {
    // Shouldn't happen (nextLevel is only 'aal2' once a verified factor
    // exists), but don't strand the user on a dead-end form if it does.
    redirect('/connexion')
  }

  return (
    <main className="min-h-screen bg-kawa-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-kawa-800">Vérification en deux étapes</h1>
          <p className="text-kawa-500 mt-2">
            {webauthnFactor
              ? 'Utilisez votre empreinte digitale, Face ID ou Windows Hello.'
              : "Saisissez le code généré par votre application d'authentification."}
          </p>
        </div>

        <MfaChallengeForm
          totpFactorId={totpFactor?.id ?? null}
          webauthnFactorId={webauthnFactor?.id ?? null}
          next={next ?? '/admin'}
        />

        <form action={logout} className="mt-6 text-center">
          <button className="text-sm text-sky-700 underline">
            Ce n&apos;est pas vous ? Se déconnecter
          </button>
        </form>
      </div>
    </main>
  )
}
