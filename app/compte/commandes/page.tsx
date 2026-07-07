export default function CommandesPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-kawa-800">Mes Commandes</h1>
        <p className="text-kawa-500 mt-1">
          Votre historique de commandes et vos factures apparaîtront ici.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-kawa-200 p-10 text-center">
        <p className="text-kawa-500">
          Aucune commande pour le moment — le catalogue produits arrive bientôt.
        </p>
      </div>
    </div>
  )
}
