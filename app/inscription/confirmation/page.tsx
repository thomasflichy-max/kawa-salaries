export default function InscriptionConfirmationPage() {
  return (
    <main className="min-h-screen bg-kawa-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-2xl shadow-sm w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-kawa-800">Presque terminé</h1>
        <p className="text-kawa-500 mt-3">
          Votre compte est créé. Nous venons de vous envoyer un email de
          confirmation : cliquez sur le lien qu&apos;il contient pour activer
          votre compte, puis vous pourrez vous connecter.
        </p>
        <p className="text-kawa-400 text-sm mt-3">
          Rien reçu au bout de quelques minutes ? Vérifiez vos spams.
        </p>
      </div>
    </main>
  )
}
