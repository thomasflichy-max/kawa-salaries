'use client'

import { useActionState, useState } from 'react'
import { updateDefaultAddress } from '@/app/actions/auth'

type Address = { id: string; label: string; address: string }
type Step = 1 | 2 | 3

const currency = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })

function StepHeader({
  number,
  title,
  status,
  onEdit,
}: {
  number: number
  title: string
  status: 'done' | 'active' | 'locked'
  onEdit?: () => void
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span
          className={`flex items-center justify-center w-7 h-7 rounded-full text-sm font-semibold shrink-0 ${
            status === 'done'
              ? 'bg-emerald-500 text-white'
              : status === 'active'
                ? 'bg-sky-500 text-kawa-950'
                : 'bg-kawa-100 text-kawa-400'
          }`}
        >
          {status === 'done' ? '✓' : number}
        </span>
        <p className={`font-medium ${status === 'locked' ? 'text-kawa-400' : 'text-kawa-800'}`}>
          {title}
        </p>
      </div>
      {status === 'done' && onEdit && (
        <button type="button" onClick={onEdit} className="text-sm text-sky-700 hover:underline">
          Modifier
        </button>
      )}
    </div>
  )
}

export function CheckoutSteps({
  total,
  itemCount,
  addresses,
  defaultAddressId,
}: {
  total: number
  itemCount: number
  addresses: Address[]
  defaultAddressId: string | null
}) {
  const [step, setStep] = useState<Step>(1)
  const [selectedAddress, setSelectedAddress] = useState(defaultAddressId ?? '')
  const [confirmedAddress, setConfirmedAddress] = useState<string | null>(null)
  const [state, action, pending] = useActionState(updateDefaultAddress, undefined)

  // State adjustment driven by the action's result — done during render
  // (React's documented pattern for this), not in a useEffect.
  const [lastHandledState, setLastHandledState] = useState(state)
  if (state !== lastHandledState) {
    setLastHandledState(state)
    if (state?.success) {
      setConfirmedAddress(selectedAddress)
      setStep(3)
    }
  }

  const selectedSite = addresses.find((a) => a.id === selectedAddress)
  const confirmedSite = addresses.find((a) => a.id === confirmedAddress)

  return (
    <div className="border-t border-kawa-100 divide-y divide-kawa-100">
      <div className="p-5 flex flex-col gap-3">
        <StepHeader
          number={1}
          title="Valider mon panier"
          status={step === 1 ? 'active' : 'done'}
          onEdit={() => setStep(1)}
        />
        {step === 1 && (
          <div className="pl-10 flex flex-col gap-3">
            <p className="text-sm text-kawa-500">
              {itemCount} article{itemCount > 1 ? 's' : ''} — {currency.format(total)} TTC
            </p>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="self-start bg-sky-500 text-kawa-950 px-4 py-2 rounded-lg font-medium hover:bg-sky-600 transition"
            >
              Valider mon panier
            </button>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col gap-3">
        <StepHeader
          number={2}
          title="Valider le choix de la livraison"
          status={step === 2 ? 'active' : step > 2 ? 'done' : 'locked'}
          onEdit={() => setStep(2)}
        />
        {step === 2 && (
          <form action={action} className="pl-10 flex flex-col gap-3 max-w-sm">
            <select
              name="default_address_id"
              value={selectedAddress}
              onChange={(e) => setSelectedAddress(e.target.value)}
              className="w-full border border-kawa-200 rounded-lg px-4 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              <option value="">Retrait KAWA Nantes</option>
              {addresses.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.label} — {site.address}
                </option>
              ))}
            </select>
            {selectedAddress !== '' && (
              <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                Votre livraison sera effectuée lors de la prochaine commande de café passée par
                votre entreprise, est-ce que c&apos;est bon pour vous ?
              </p>
            )}
            {state?.error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{state.error}</p>
            )}
            <button
              type="submit"
              disabled={pending}
              className="self-start bg-sky-500 text-kawa-950 px-4 py-2 rounded-lg font-medium hover:bg-sky-600 transition disabled:opacity-50"
            >
              {pending ? 'Enregistrement…' : 'Valider la livraison'}
            </button>
          </form>
        )}
        {step > 2 && (
          <p className="pl-10 text-sm text-kawa-500">
            {confirmedSite ? `${confirmedSite.label} — ${confirmedSite.address}` : 'Retrait KAWA Nantes'}
          </p>
        )}
      </div>

      <div className="p-5 flex flex-col gap-3">
        <StepHeader number={3} title="Passage au paiement" status={step === 3 ? 'active' : 'locked'} />
        {step === 3 && (
          <div className="pl-10">
            <button
              disabled
              className="w-full sm:w-auto bg-kawa-200 text-kawa-500 px-6 py-3 rounded-lg font-medium cursor-not-allowed"
            >
              Passer au paiement — bientôt disponible
            </button>
            <p className="text-xs text-kawa-400 mt-2">
              Le module de paiement n&apos;est pas encore en ligne — ta commande ({selectedSite ? selectedSite.label : 'Retrait KAWA Nantes'}) est prête à être validée dès qu&apos;il le sera.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
