import Link from 'next/link'
import { RequestResetForm } from './request-form'

export default async function MotDePasseOubliePage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string }>
}) {
  const { erreur } = await searchParams

  return (
    <main className="min-h-screen bg-kawa-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-kawa-800">Mot de passe oublié</h1>
          <p className="text-kawa-500 mt-2">
            Indiquez votre email, nous vous envoyons un lien pour en choisir un
            nouveau.
          </p>
        </div>

        {erreur === 'lien_invalide' && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-4">
            Ce lien n&apos;est plus valide, merci de refaire une demande ci-dessous.
          </p>
        )}

        <RequestResetForm />

        <p className="text-center text-sm text-kawa-400 mt-6">
          <Link href="/connexion" className="text-sky-700 underline">
            Retour à la connexion
          </Link>
        </p>
      </div>
    </main>
  )
}
