import { NewPasswordForm } from './new-password-form'

export default function NouveauMotDePassePage() {
  return (
    <main className="min-h-screen bg-kawa-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-kawa-800">Nouveau mot de passe</h1>
          <p className="text-kawa-500 mt-2">Choisissez votre nouveau mot de passe.</p>
        </div>

        <NewPasswordForm />
      </div>
    </main>
  )
}
