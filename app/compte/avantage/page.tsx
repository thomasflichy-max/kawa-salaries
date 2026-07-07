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
              {`Parce que ${organization?.name ?? 'votre entreprise'} est cliente de KAWA Nantes, vous bénéficiez d'une réduction sur nos cafés ainsi que l'accès à nos produits d'entretiens et à nos machines reconditionnées. C'est une offre réservée exclusivement aux salariés des entreprises clientes de KAWA, basés à Nantes.`}
            </p>
          </div>
          <div className="relative w-40 sm:w-48 h-full min-h-40 mx-auto sm:mx-0 rounded-xl overflow-hidden">
            <Image
              src="/avantage/sachets-oranges.jpg"
              alt="Sachets de café KAWA"
              fill
              sizes="192px"
              className="object-cover"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-16 items-stretch">
          <div className="bg-white rounded-2xl border border-kawa-200 p-8">
            <p className="font-semibold text-kawa-800 text-lg">Conditions de livraison</p>
            <p className="text-kawa-500 mt-2">
              La livraison est gratuite, avec deux solutions au choix : votre café peut
              vous être livré directement dans vos bureaux lors de la prochaine commande
              de votre entreprise, ou vous pouvez venir le récupérer directement dans nos
              locaux du 75 Bd Ernest Dalby, entre 9h et 18h.
            </p>
          </div>
          <div className="relative w-40 sm:w-48 h-full min-h-40 mx-auto sm:mx-0 rounded-xl overflow-hidden">
            <Image
              src="/avantage/grains-cafe.jpg"
              alt="Grains de café KAWA"
              fill
              sizes="192px"
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
