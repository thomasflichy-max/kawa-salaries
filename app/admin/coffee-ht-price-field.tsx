'use client'

import { useState } from 'react'
import { coffeeDiscountFromHtPrice } from '@/lib/order-item-vat'

const currency = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })

// The admin types what the employer pays HT per kg for this coffee — the
// salarié-facing remise (organization_coffee_discounts.discount_amount) is
// derived from it server-side (see coffeeDiscountFromHtPrice), this is just
// the live preview so staff can see the resulting TTC price and remise
// before saving.
export function CoffeeHtPriceField({
  name,
  label,
  basePriceTtc,
  defaultValue,
  placeholder = '24.00',
}: {
  name: string
  label: string
  basePriceTtc: number
  defaultValue?: number
  placeholder?: string
}) {
  const [raw, setRaw] = useState(defaultValue != null ? String(defaultValue) : '')
  const parsed = Number(raw)
  const hasValue = raw.trim() !== '' && Number.isFinite(parsed)
  const discount = hasValue ? coffeeDiscountFromHtPrice(basePriceTtc, parsed) : null

  return (
    <div>
      <label className="text-xs text-kawa-500">{label}</label>
      <input
        type="number"
        name={name}
        min={0}
        step="0.01"
        placeholder={placeholder}
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        required
        className="mt-1 w-full border border-kawa-200 rounded-lg px-3 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
      />
      {hasValue && discount !== null && (
        <p className={`text-xs mt-1 ${discount < 0 ? 'text-red-600 font-medium' : 'text-kawa-400'}`}>
          {discount < 0
            ? `Supérieur au tarif de base salarié (${currency.format(basePriceTtc)} TTC)`
            : `→ ${currency.format(basePriceTtc - discount)} TTC pour le salarié · remise ${currency.format(discount)}`}
        </p>
      )}
    </div>
  )
}
