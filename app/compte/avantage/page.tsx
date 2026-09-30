import Image from 'next/image'
import Link from 'next/link'
import { getEmployee } from '@/lib/get-employee'
import { createClient } from '@/lib/supabase/server'
import { getLocale } from '@/lib/i18n/locale'
import { getDictionary } from '@/lib/i18n/dictionary'

export default async function AvantagePage() {
  const { organization } = await getEmployee()
  const locale = await getLocale()
  const t = getDictionary(locale).avantage
  const orgName = organization?.name ?? t.defaultOrgName

  const supabase = await createClient()
  const { count: coffeeCount } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('category', 'cafe')
    .eq('active', true)

  const stats = [
    { value: t.stats.rank, label: t.stats.rankLabel },
    { value: String(coffeeCount ?? 9), label: t.stats.coffeesLabel },
    { value: t.stats.pickupValue, label: t.stats.pickupLabel },
    { value: t.stats.deliveryValue, label: t.stats.deliveryLabel },
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
            {t.eyebrow}
          </p>
          <h1 className="mt-2 text-2xl sm:text-4xl font-bold text-white max-w-xl leading-tight">
            {t.heroTitle}
          </h1>
          <p className="mt-2 text-sm sm:text-base text-white/80 max-w-lg">
            {t.heroSubtitle(orgName)}
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
            {t.votreAvantageEyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-bold text-kawa-800 leading-snug">
            {t.votreAvantageTitle}
          </h2>
        </div>
        <div className="sm:col-span-8">
          <p className="text-kawa-600 leading-relaxed">{t.votreAvantageBody(orgName)}</p>
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
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
            {t.qualiteEyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-bold text-kawa-800 leading-snug">{t.qualiteTitle}</h2>
          <p className="mt-4 text-kawa-600 leading-relaxed">{t.qualiteBody}</p>
          <dl className="mt-6 flex flex-col gap-4">
            {t.savoirFaire.map((item) => (
              <div key={item.title} className="flex gap-3">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-sky-500 shrink-0" />
                <div>
                  <dt className="font-medium text-kawa-800">{item.title}</dt>
                  <dd className="text-sm text-kawa-500 mt-0.5">{item.text}</dd>
                </div>
              </div>
            ))}
          </dl>
          <p className="mt-6 text-sm text-kawa-500 leading-relaxed">{t.qualiteFooter}</p>
        </div>
      </section>

      <div className="h-px bg-kawa-200" />

      {/* LIVRAISON */}
      <section className="py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-600">
          {t.livraisonEyebrow}
        </p>
        <h2 className="mt-2 text-2xl font-bold text-kawa-800 leading-snug">{t.livraisonTitle}</h2>
        <p className="mt-3 text-kawa-600 max-w-2xl">{t.livraisonIntro}</p>

        <div className="grid sm:grid-cols-2 gap-5 mt-8">
          <div>
            <div className="relative h-48 rounded-2xl overflow-hidden">
              <Image
                src="/avantage/agence-kawa.jpg"
                alt="Façade de l'agence KAWA à Nantes"
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-kawa-950/80 via-kawa-950/10 to-transparent" />
              <p className="absolute bottom-3 left-4 text-white font-bold text-lg">
                {t.pickupCardTitle}
              </p>
            </div>
            <p className="text-sm text-kawa-500 mt-3">{t.pickupCardBody}</p>
          </div>

          <div>
            <div className="relative h-48 rounded-2xl overflow-hidden">
              <Image
                src="/avantage/triporteur-anneaux.jpg"
                alt="Triporteur électrique KAWA devant Les Anneaux de Buren, à Nantes"
                fill
                sizes="(min-width: 640px) 50vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-kawa-950/80 via-kawa-950/10 to-transparent" />
              <p className="absolute bottom-3 left-4 text-white font-bold text-lg">
                {t.deliveryCardTitle}
              </p>
            </div>
            <p className="text-sm text-kawa-500 mt-3">{t.deliveryCardBody}</p>
          </div>
        </div>
      </section>

      <div className="h-px bg-kawa-200" />

      {/* CLOSER */}
      <section className="py-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <p className="text-kawa-600">{t.closerText}</p>
        <Link
          href="/compte/produits"
          className="inline-flex items-center gap-2 self-start sm:self-auto bg-sky-500 text-kawa-950 px-5 py-2.5 rounded-lg font-medium hover:bg-sky-600 transition"
        >
          {t.closerCta}
        </Link>
      </section>
    </div>
  )
}
