import Link from 'next/link'

// Just a "thanks, we're processing it" screen — the CAWL webhook
// (app/api/webhooks/cawl/route.ts) is the source of truth for payment
// status, not this browser redirect (the employee might close the tab
// before landing back here). No order lookup needed on this page.
export default function PanierRetourPage() {
  return (
    <div className="flex flex-col items-center text-center gap-4 py-16">
      <h1 className="text-2xl font-bold text-kawa-800">Merci pour votre commande</h1>
      <p className="text-kawa-500 max-w-md">
        Votre paiement est en cours de traitement. Vous recevrez un email de confirmation dès
        qu&apos;il sera validé.
      </p>
      <Link
        href="/compte/commandes"
        className="mt-2 bg-sky-500 text-kawa-950 px-5 py-2.5 rounded-lg font-medium hover:bg-sky-600 transition"
      >
        Voir mes commandes
      </Link>
    </div>
  )
}
