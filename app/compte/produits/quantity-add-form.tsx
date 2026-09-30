'use client'

import { useState } from 'react'
import { AddToCartButton } from './add-to-cart-button'
import { GRIND_OPTIONS } from '@/lib/grind-type'
import type { Dictionary } from '@/lib/i18n/dictionary'
import type { Locale } from '@/lib/i18n/locale'

export function QuantityAddForm({
  productId,
  showGrind = false,
  initialGrind,
  t,
  locale,
}: {
  productId: string
  showGrind?: boolean
  initialGrind?: (typeof GRIND_OPTIONS)[number]['value']
  t: Dictionary['produits']
  locale: Locale
}) {
  const [quantity, setQuantity] = useState(1)
  const [grind, setGrind] = useState<(typeof GRIND_OPTIONS)[number]['value']>(initialGrind ?? 'grain')

  return (
    <div className="flex flex-col gap-4">
      {showGrind && (
        <div>
          <label className="text-sm font-medium text-kawa-700 block mb-1">{t.grindLabel}</label>
          <div className="flex flex-wrap gap-2">
            {GRIND_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setGrind(option.value)}
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition ${
                  grind === option.value
                    ? 'border-sky-500 bg-sky-50 text-sky-700'
                    : 'border-kawa-200 text-kawa-600 hover:border-kawa-300'
                }`}
              >
                {locale === 'en' ? option.labelEn : option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="text-sm font-medium text-kawa-700 block mb-1">{t.quantityLabel}</label>
        <div className="inline-flex items-center border border-kawa-200 rounded-lg">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-10 h-10 text-kawa-600 hover:bg-kawa-50 transition"
          >
            −
          </button>
          <span className="w-10 text-center text-kawa-800 font-medium">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => q + 1)}
            className="w-10 h-10 text-kawa-600 hover:bg-kawa-50 transition"
          >
            +
          </button>
        </div>
      </div>

      <AddToCartButton
        productId={productId}
        quantity={quantity}
        grindType={showGrind ? grind : null}
        t={t}
      />
    </div>
  )
}
