'use client'

import { useActionState, useState } from 'react'
import { updateDefaultAddress } from '@/app/actions/auth'
import { placeOrderAction } from '@/app/actions/checkout'
import type { Dictionary } from '@/lib/i18n/dictionary'

type Address = { id: string; label: string; address: string }
type Step = 1 | 2 | 3

const currency = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })

function StepHeader({
  number,
  title,
  status,
  onEdit,
  editLabel,
}: {
  number: number
  title: string
  status: 'done' | 'active' | 'locked'
  onEdit?: () => void
  editLabel: string
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
          {editLabel}
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
  t,
}: {
  total: number
  itemCount: number
  addresses: Address[]
  defaultAddressId: string | null
  t: Dictionary['checkout']
}) {
  const [step, setStep] = useState<Step>(1)
  const [selectedAddress, setSelectedAddress] = useState(defaultAddressId ?? '')
  const [confirmedAddress, setConfirmedAddress] = useState<string | null>(null)
  const [state, action, pending] = useActionState(updateDefaultAddress, undefined)
  const [payState, payAction, payPending] = useActionState(placeOrderAction, undefined)

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
          title={t.confirmCart}
          status={step === 1 ? 'active' : 'done'}
          onEdit={() => setStep(1)}
          editLabel={t.edit}
        />
        {step === 1 && (
          <div className="pl-10 flex flex-col gap-3">
            <p className="text-sm text-kawa-500">
              {itemCount} {itemCount > 1 ? t.itemPlural : t.itemSingular} — {currency.format(total)}{' '}
              {t.ttc}
            </p>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="self-start bg-sky-500 text-kawa-950 px-4 py-2 rounded-lg font-medium hover:bg-sky-600 transition"
            >
              {t.confirmCart}
            </button>
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col gap-3">
        <StepHeader
          number={2}
          title={t.deliveryStepTitle}
          status={step === 2 ? 'active' : step > 2 ? 'done' : 'locked'}
          onEdit={() => setStep(2)}
          editLabel={t.edit}
        />
        {step === 2 && (
          <form action={action} className="pl-10 flex flex-col gap-3 max-w-sm">
            <select
              name="default_address_id"
              value={selectedAddress}
              onChange={(e) => setSelectedAddress(e.target.value)}
              className="w-full border border-kawa-200 rounded-lg px-4 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              <option value="">{t.retraitOption}</option>
              {addresses.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.label} — {site.address}
                </option>
              ))}
            </select>
            {selectedAddress !== '' ? (
              <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                {t.deliveryNoteWithAddress}
              </p>
            ) : (
              <p className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                {t.deliveryNotePickup}
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
              {pending ? t.saving : t.confirmDelivery}
            </button>
          </form>
        )}
        {step > 2 && (
          <p className="pl-10 text-sm text-kawa-500">
            {confirmedSite ? `${confirmedSite.label} — ${confirmedSite.address}` : t.retraitOption}
          </p>
        )}
      </div>

      <div className="p-5 flex flex-col gap-3">
        <StepHeader
          number={3}
          title={t.paymentStepTitle}
          status={step === 3 ? 'active' : 'locked'}
          editLabel={t.edit}
        />
        {step === 3 && (
          <form action={payAction} className="pl-10 flex flex-col gap-3">
            <button
              type="submit"
              disabled={payPending}
              className="w-full sm:w-auto bg-sky-500 text-kawa-950 px-6 py-3 rounded-lg font-medium hover:bg-sky-600 transition disabled:opacity-50"
            >
              {payPending ? t.redirecting : `${t.payCtaPrefix} ${currency.format(total)}`}
            </button>
            {payState?.error && (
              <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 max-w-sm">
                {payState.error}
              </p>
            )}
            <p className="text-xs text-kawa-400">
              {t.secureRedirectPrefix} {selectedSite ? selectedSite.label : t.retraitOption}.
            </p>
            <p className="text-xs text-kawa-400 max-w-md">{t.marketingNotice}</p>
          </form>
        )}
      </div>
    </div>
  )
}
