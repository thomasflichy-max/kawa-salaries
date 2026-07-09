import { LegalHeader } from '../legal-header'

export default function CGVPage() {
  return (
    <div className="min-h-screen bg-kawa-50">
      <LegalHeader />
      <main className="flex justify-center px-6 py-16">
      <div className="max-w-2xl w-full bg-white rounded-2xl border border-kawa-200 p-8 flex flex-col gap-6">
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
          Projet de CGV à faire relire et valider par un juriste avant publication
          officielle — ce contenu n&apos;a pas de valeur juridique en l&apos;état.
        </div>

        <h1 className="text-2xl font-bold text-kawa-800">
          Conditions générales de vente
        </h1>

        <section>
          <h2 className="font-semibold text-kawa-800 mb-1">1. Objet</h2>
          <p className="text-sm text-kawa-600 leading-relaxed">
            Les présentes conditions régissent les commandes passées par les salariés
            des entreprises clientes de KAWA COFFEE NANTES (« KAWA ») sur la
            plateforme kawa-salaries, réservée aux salariés dont l&apos;entreprise a
            été préalablement enregistrée comme cliente de KAWA.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-kawa-800 mb-1">2. Produits et prix</h2>
          <p className="text-sm text-kawa-600 leading-relaxed">
            Les cafés sont vendus en sachets de 1 kg à un tarif fixé à partir d&apos;un
            prix de base, minoré d&apos;une remise appliquée par catégorie (café
            classique ou bio), identique pour tous les salariés quelle que soit leur
            entreprise. Les produits d&apos;entretien et les machines reconditionnées
            sont vendus au prix affiché sur leur fiche produit. Certains produits sont
            proposés « sur demande » : leur achat nécessite un contact préalable avec
            KAWA et ne peut se faire directement sur la plateforme.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-kawa-800 mb-1">3. Commande</h2>
          <p className="text-sm text-kawa-600 leading-relaxed">
            La commande est passée depuis l&apos;espace personnel du salarié après
            connexion. Elle n&apos;est définitive qu&apos;après confirmation par KAWA
            et, le cas échéant, réception du paiement selon les modalités indiquées
            lors du passage de commande.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-kawa-800 mb-1">4. Livraison</h2>
          <p className="text-sm text-kawa-600 leading-relaxed">
            La livraison est offerte, selon deux modalités au choix : livraison dans
            les locaux de l&apos;entreprise cliente à l&apos;occasion de sa prochaine
            commande groupée, ou retrait directement dans les locaux de KAWA au 75 Bd
            Ernest Dalby, 44000 Nantes, entre 9h et 18h.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-kawa-800 mb-1">5. Paiement</h2>
          <p className="text-sm text-kawa-600 leading-relaxed">
            Les modalités de paiement seront précisées au moment du passage de
            commande. À défaut de paiement en ligne disponible, KAWA se réserve le
            droit de facturer directement l&apos;entreprise cliente ou le salarié
            selon l&apos;accord en vigueur.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-kawa-800 mb-1">6. Réclamations et SAV</h2>
          <p className="text-sm text-kawa-600 leading-relaxed">
            Toute réclamation relative à une commande (produit non conforme,
            manquant, défectueux) doit être adressée à nantes@kawa.coffee dans les
            plus brefs délais suivant la réception.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-kawa-800 mb-1">7. Remboursement</h2>
          <p className="text-sm text-kawa-600 leading-relaxed">
            L&apos;annulation d&apos;une commande par KAWA n&apos;entraîne pas de remboursement
            automatique. Un remboursement, total ou partiel, peut néanmoins être accordé par
            KAWA, notamment dans les cas suivants : produit non conforme à la commande, produit
            détérioré à la livraison, produit manquant, ou commande annulée après acceptation par
            KAWA. Toute demande de remboursement doit être adressée à nantes@kawa.coffee. Un email
            de confirmation, accompagné d&apos;un justificatif, est transmis au salarié pour tout
            remboursement effectué.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-kawa-800 mb-1">8. Données personnelles</h2>
          <p className="text-sm text-kawa-600 leading-relaxed">
            Le traitement des données personnelles des salariés dans le cadre de
            kawa-salaries est décrit dans notre Politique de confidentialité.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-kawa-800 mb-1">9. Droit applicable</h2>
          <p className="text-sm text-kawa-600 leading-relaxed">
            Les présentes conditions sont soumises au droit français. Tout litige
            relève, à défaut de résolution amiable, des tribunaux compétents du
            ressort de Nantes.
          </p>
        </section>
      </div>
      </main>
    </div>
  )
}
