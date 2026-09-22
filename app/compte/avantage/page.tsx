import Image from 'next/image'
import { getEmployee } from '@/lib/get-employee'

export default async function AvantagePage() {
  const { organization } = await getEmployee()

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-kawa-800">Votre Avantage</h1>
        <p className="text-kawa-500 mt-1">
          Ce que {organization?.name ?? 'votre entreprise'} vous fait gagner chez KAWA.
        </p>
      </div>

      <div className="flex flex-col gap-10 w-full">
        <div className="grid sm:grid-cols-2 gap-16 items-stretch">
          <div className="bg-white rounded-2xl border border-kawa-200 p-8">
            <p className="font-semibold text-kawa-800 text-lg">Remise sur le café</p>
            <p className="text-kawa-500 mt-2">
              {`Parce que ${organization?.name ?? 'votre entreprise'} est client de KAWA Nantes, vous bénéficiez d'une réduction sur nos cafés ainsi que l'accès à nos produits d'entretiens et à nos machines reconditionnées. C'est une offre réservée exclusivement aux salariés des entreprises clientes de KAWA, basés à Nantes.`}
            </p>
          </div>
          <div className="relative w-full h-56 sm:w-48 sm:h-full sm:min-h-40 rounded-xl overflow-hidden">
            <Image
              src="/avantage/sachets-tanat.jpg"
              alt="Sachets de café KAWA"
              fill
              sizes="(min-width: 640px) 192px, 100vw"
              className="object-cover object-[50%_65%]"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-16 items-stretch">
          <div className="bg-white rounded-2xl border border-kawa-200 p-8">
            <p className="font-semibold text-kawa-800 text-lg">Un savoir-faire artisanal</p>
            <p className="text-kawa-500 mt-2">
              KAWA Nantes est un torréfacteur artisanal : chaque café est torréfié dans notre atelier,
              en petites séries et spécialement pour votre machine, pour préserver toute sa fraîcheur
              et ses arômes. Nous travaillons en direct avec nos producteurs de cafés de spécialité, en
              circuit court, pour des cafés tracés et d&apos;une grande qualité. Fondée à Nantes en
              2020, notre équipe locale accompagne aujourd&apos;hui plus de 200 entreprises en
              Loire-Atlantique.
            </p>
          </div>
          <div className="relative w-full h-56 sm:w-48 sm:h-full sm:min-h-40 rounded-xl overflow-hidden">
            <Image
              src="/avantage/torrefacteur-loring.jpg"
              alt="Torréfacteur dans l'atelier KAWA à Nantes"
              fill
              sizes="(min-width: 640px) 192px, 100vw"
              className="object-cover"
            />
          </div>
        </div>

        <div>
          <p className="font-semibold text-kawa-800 text-lg">Conditions de livraison</p>
          <p className="text-kawa-500 mt-2 max-w-3xl">
            La livraison est gratuite, avec deux solutions au choix selon vos besoins.
          </p>

          <div className="grid sm:grid-cols-2 gap-6 mt-6">
            <div className="bg-white rounded-2xl border border-kawa-200 overflow-hidden flex flex-col">
              <div className="relative w-full h-44">
                <Image
                  src="/avantage/equipe-kawa.jpeg"
                  alt="L'équipe KAWA Nantes"
                  fill
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="object-cover object-top"
                />
              </div>
              <div className="p-6 flex flex-col gap-2">
                <span className="inline-block w-fit px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-semibold uppercase tracking-wide">
                  Retrait en agence — sous 24h
                </span>
                <p className="font-semibold text-kawa-800 mt-1">Récupérez votre commande rapidement</p>
                <p className="text-kawa-500 text-sm">
                  Venez la récupérer directement dans nos locaux du 75 Bd Ernest Dalby, à Nantes,
                  entre 9h et 18h — disponible sous 24h.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-kawa-200 overflow-hidden flex flex-col">
              <div className="relative w-full h-44">
                <Image
                  src="/avantage/triporteur-chateau.jpg"
                  alt="Triporteur électrique KAWA à Nantes"
                  fill
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="p-6 flex flex-col gap-2">
                <span className="inline-block w-fit px-3 py-1 rounded-full bg-sky-100 text-sky-700 text-xs font-semibold uppercase tracking-wide">
                  Livraison en entreprise — 7 jours ouvrés
                </span>
                <p className="font-semibold text-kawa-800 mt-1">Livré directement à vos bureaux</p>
                <p className="text-kawa-500 text-sm">
                  Votre café est livré gratuitement dans vos locaux, en triporteur électrique, sous 7
                  jours ouvrés.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
