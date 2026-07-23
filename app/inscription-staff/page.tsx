import Link from 'next/link'
import { AdminSignupForm } from './admin-signup-form'

export default function InscriptionStaffPage() {
  return (
    <main className="min-h-screen bg-kawa-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-kawa-800">Accès admin KAWA</h1>
          <p className="text-kawa-500 mt-2">
            Réservé à l&apos;équipe KAWA — crée ton mot de passe avec ton adresse
            @kawa.coffee pour accéder au tableau de bord admin.
          </p>
        </div>

        <AdminSignupForm />

        <p className="text-center text-sm text-kawa-400 mt-6">
          Déjà un compte ?{' '}
          <Link href="/connexion?next=/admin" className="text-sky-700 underline">
            Se connecter
          </Link>
        </p>
      </div>
    </main>
  )
}
