import Link from 'next/link'

export default function InscriptionConfirmationPage() {
  return (
    <main className="min-h-screen bg-kawa-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-kawa-800">Compte créé</h1>
        <p className="text-kawa-500 mt-3">
          Merci pour votre inscription. Si la confirmation par email est
          activée sur votre compte, vérifiez votre boîte de réception pour
          activer votre compte kawa.
        </p>
        <Link
          href="/connexion"
          className="inline-block mt-6 text-sky-700 underline text-sm"
        >
          Aller à la connexion
        </Link>
      </div>
    </main>
  )
}
