import { LegalHeader } from '../legal-header'

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-kawa-50">
      <LegalHeader />
      <main className="flex justify-center px-6 py-16">
      <div className="max-w-2xl w-full bg-white rounded-2xl border border-kawa-200 p-8 flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-kawa-800">Politique de confidentialité</h1>

        <section>
          <h2 className="font-semibold text-kawa-800 mb-1">Données collectées</h2>
          <p className="text-sm text-kawa-600 leading-relaxed">
            Dans le cadre de kawa-salaries, nous collectons les informations que vous
            nous fournissez à l&apos;inscription (prénom, nom, email professionnel,
            mot de passe), les informations de votre entreprise cliente, ainsi que
            l&apos;historique de vos commandes et demandes (ex : demande d&apos;intérêt
            pour une machine reconditionnée).
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-kawa-800 mb-1">Finalités du traitement</h2>
          <p className="text-sm text-kawa-600 leading-relaxed">
            Ces données sont utilisées pour gérer votre compte et vos commandes,
            appliquer la remise liée à votre entreprise, répondre à vos demandes, et
            assurer la relation commerciale entre KAWA et votre entreprise.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-kawa-800 mb-1">Base légale</h2>
          <p className="text-sm text-kawa-600 leading-relaxed">
            Le traitement repose sur l&apos;exécution du contrat qui lie votre
            entreprise à KAWA, notre intérêt légitime à assurer la sécurité du service,
            et le cas échéant vos obligations comptables et légales.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-kawa-800 mb-1">Durée de conservation</h2>
          <p className="text-sm text-kawa-600 leading-relaxed">
            Vos données sont conservées pendant la durée de votre relation avec KAWA,
            puis archivées selon les obligations légales applicables (notamment 10
            ans pour les données de facturation).
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-kawa-800 mb-1">Sous-traitants</h2>
          <p className="text-sm text-kawa-600 leading-relaxed">
            Vos données peuvent être traitées par nos prestataires techniques
            (hébergement, base de données, envoi d&apos;email), dans le cadre
            strictement nécessaire au fonctionnement du service.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-kawa-800 mb-1">Vos droits</h2>
          <p className="text-sm text-kawa-600 leading-relaxed">
            Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès, de
            rectification, de suppression, d&apos;opposition, de portabilité et de
            limitation du traitement de vos données. Pour exercer ces droits,
            contactez-nous à nantes@kawa.coffee — nous nous engageons à répondre sous
            30 jours. Vous pouvez également saisir la CNIL en cas de réclamation.
          </p>
        </section>
      </div>
      </main>
    </div>
  )
}
