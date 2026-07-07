import { LegalHeader } from '../legal-header'

export default function MentionsLegalesPage() {
  return (
    <div className="min-h-screen bg-kawa-50">
      <LegalHeader />
      <main className="flex justify-center px-6 py-16">
      <div className="max-w-2xl w-full bg-white rounded-2xl border border-kawa-200 p-8 flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-kawa-800">Mentions légales</h1>

        <section>
          <h2 className="font-semibold text-kawa-800 mb-1">Éditeur du site</h2>
          <p className="text-sm text-kawa-600 leading-relaxed">
            KAWA COFFEE NANTES, société par actions simplifiée (SAS) au capital de
            1 000 €, dont le siège social est situé 3bis rue Germain Boffrand, 44000
            Nantes.
            <br />
            RCS Nantes — SIRET 889 062 600 00016 — TVA intracommunautaire FR55
            889062600.
            <br />
            Directeur de la publication : Thomas Flichy.
            <br />
            Contact : nantes@kawa.coffee
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-kawa-800 mb-1">Hébergement</h2>
          <p className="text-sm text-kawa-600 leading-relaxed">
            Ce site est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA
            91723, États-Unis.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-kawa-800 mb-1">Propriété intellectuelle</h2>
          <p className="text-sm text-kawa-600 leading-relaxed">
            L&apos;ensemble des contenus présents sur ce site (textes, images, logos)
            est la propriété de KAWA COFFEE NANTES, sauf mention contraire, et ne peut
            être reproduit sans autorisation préalable.
          </p>
        </section>
      </div>
      </main>
    </div>
  )
}
