import Image from 'next/image'
import Link from 'next/link'
import { getEmployee } from '@/lib/get-employee'
import { createClient } from '@/lib/supabase/server'

const SAVOIR_FAIRE = [
  {
    title: 'Torréfacteur TANAT',
    text: '12ᵉ meilleur torréfacteur mondial en 2024, torréfié en petites séries dans son atelier parisien.',
  },
  {
    title: 'Circuit court',
    text: 'Une relation directe avec nos producteurs de cafés de spécialité, pour des cafés tracés.',
  },
  {
    title: 'Toujours frais',
    text: 'Chaque café est torréfié spécialement pour votre machine, en petite série.',
  },
]

export default async function AvantagePage() {
  const { organization } = await getEmployee()
  const orgName = organization?.name ?? 'votre entreprise'

  const supabase = await createClient()
  const { count: coffeeCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('category', 'cafe')
    .eq('active', true)

  const stats = [
    { value: '12ᵉ', label: 'Meilleur torréfacteur mondial' },
    { value: String(coffeeCount ?? 9), label: 'Cafés à découvrir' },
    { value: '24h', label: 'Retrait en agence' },
    { value: '7j ouvrés', label: 'Livraison au travail' },
  ]

  return (
    <div className="flex flex-col">
      {/* HERO */}
      <div className="relative h-72 sm:h-96 rounded-3xl overflow-hidden">
        <Image
          src="/avantage/hero-machine.png"
          alt="Préparation d'un café à la machine KAWA"
          fill
          priority
          sizes="(min-width: 1024px) 896px, 100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-kawa-950/85 via-kawa-950/25 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">
            Votre avantage KAWA
          </p>
          <h1 className="mt-2 text-2xl sm:text-4xl font-bold text-white max-w-xl leading-tight">
            Le café d&apos;exception, à la maison.
          </h1>
          <p className="mt-2 text-sm sm:text-base text-white/80 max-w-lg">
            Grâce à {orgName}, profitez d&apos;un café de qualité à prix réduit, à déguster chez
            vous.
          </p>
        </div>
      </div>

      {/* STATS STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-kawa-200 bg-white rounded-2xl border border-kawa-200 mt-6 overflow-hidden">
        {stats.map((stat) => (
          <div key={stat.label} className="p-5 text-center">
            <p className="text-xl sm:text-2xl font-bold text-kawa-800">{stat.value}</p>
            <p className="text-xs text-kawa-500 mt-1 uppercase tracking-wide">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* VOTRE AVANTAGE */}
      <section className="grid sm:grid-cols-12 gap-6 sm:gap-10 py-16">
        <div className="sm:col-span-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
            Votre avantage
          </p>
          <h2 className="mt-2 text-2xl font-bold text-kawa-800 leading-snug">
            Un café d&apos;exception, à prix réduit, pour la maison
          </h2>
        </div>
        <div className="sm:col-span-8">
          <p className="text-kawa-600 leading-relaxed">
            Parce que {orgName} est partenaire de KAWA Nantes, vous bénéficiez d&apos;une réduction
            personnelle sur nos cafés à déguster chez vous, ainsi que sur nos produits
            d&apos;entretien et nos machines reconditionnées. Une offre réservée aux salariés des
            entreprises partenaires de KAWA, basés à Nantes.
          </p>
        </div>
      </section>

      <div className="h-px bg-kawa-200" />

      {/* SAVOIR-FAIRE / QUALITÉ */}
      <section className="grid sm:grid-cols-12 gap-6 sm:gap-10 py-16 items-center">
        <div className="sm:col-span-5 sm:order-2 relative h-64 sm:h-80 rounded-2xl overflow-hidden">
          <Image
            src="/avantage/torrefacteur-loring.jpg"
            alt="Torréfacteur Loring — atelier TANAT"
            fill
            sizes="(min-width: 640px) 40vw, 100vw"
            className="object-cover"
          />
        </div>
        <div className="sm:col-span-7 sm:order-1">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">Qualité</p>
          <h2 className="mt-2 text-2xl font-bold text-kawa-800 leading-snug">
            Un café d&apos;exception, sélectionné avec soin
          </h2>
          <p className="mt-4 text-kawa-600 leading-relaxed">
            KAWA Nantes vous propose les cafés TANAT — des cafés de spécialité choisis pour leur
            qualité, dès la sélection des grains.
          </p>
          <dl className="mt-6 flex flex-col gap-4">
            {SAVOIR_FAIRE.map((item) => (
              <div key={item.title} className="flex gap-3">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                <div>
                  <dt className="font-medium text-kawa-800">{item.title}</dt>
                  <dd className="text-sm text-kawa-500 mt-0.5">{item.text}</dd>
                </div>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-sm text-kawa-500 leading-relaxed">
            Le même café que nous servons à nos clients professionnels, à retrouver dans votre
            tasse à la maison.
          </p>
        </div>
      </section>

      <div className="h-px bg-kawa-200" />

      {/* LIVRAISON */}
      <section className="py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">Livraison</p>
        <h2 className="mt-2 text-2xl font-bold text-kawa-800 leading-snug">
          Deux façons de repartir avec votre café
        </h2>
        <p className="mt-3 text-kawa-600 max-w-2xl">
          La livraison est gratuite, avec deux solutions au choix — il ne vous reste plus qu&apos;à
          l&apos;emporter chez vous.
        </p>

        <div className="grid sm:grid-cols-2 gap-5 mt-8">
          <div className="rounded-2xl overflow-hidden">
            <div className="relative h-48">
              <Image
                src="/avantage/agence-kawa.jpg"
                alt="Façade de l'agence KAWA à Nantes"
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-kawa-950/80 via-kawa-950/10 to-transparent" />
              <p className="absolute bottom-3 left-4 text-white font-bold text-lg">
                Retrait en agence — sous 24h
              </p>
            </div>
            <p className="text-sm text-kawa-500 mt-3">
              Venez la récupérer directement dans nos locaux du 75 Bd Ernest Dalby, à Nantes,
              entre 9h et 18h, et repartez avec votre café du jour.
            </p>
          </div>

          <div className="rounded-2xl overflow-hidden">
            <div className="relative h-48">
              <Image
                src="/avantage/triporteur-anneaux.jpg"
                alt="Triporteur électrique KAWA devant Les Anneaux de Buren, à Nantes"
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-kawa-950/80 via-kawa-950/10 to-transparent" />
              <p className="absolute bottom-3 left-4 text-white font-bold text-lg">
                Livraison au travail — 7 jours ouvrés
              </p>
            </div>
            <p className="text-sm text-kawa-500 mt-3">
              Votre café est livré gratuitement sur votre lieu de travail, en triporteur
              électrique — vous n&apos;avez plus qu&apos;à l&apos;emporter chez vous le soir.
            </p>
          </div>
        </div>
      </section>

      <div className="h-px bg-kawa-200" />

      {/* CLOSER */}
      <section className="py-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="text-kawa-600">Envie de vous régaler chez vous ?</p>
        <Link
          href="/compte/produits"
          className="inline-flex items-center gap-2 self-start sm:self-auto bg-sky-500 text-kawa-950 px-5 py-2.5 rounded-lg font-medium hover:bg-sky-600 transition"
        >
          Voir le catalogue →
        </Link>
      </section>
    </div>
  )
}
