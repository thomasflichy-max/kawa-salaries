'use client'

import { useState } from 'react'
import { AddToCartButton } from './add-to-cart-button'

const GRINDS = [
  { value: 'grain', label: 'En grains' },
  { value: 'filtre', label: 'Moulu filtre' },
  { value: 'espresso', label: 'Moulu espresso' },
] as const

export function QuantityAddForm({
  productId,
  showGrind = false,
}: {
  productId: string
  showGrind?: boolean
}) {
  const [quantity, setQuantity] = useState(1)
  const [grind, setGrind] = useState<(typeof GRINDS)[number]['value']>('grain')

  return (
    <div className="flex flex-col gap-4">
      {showGrind && (
        <div>
          <label className="text-sm font-medium text-kawa-700 block mb-1">Mouture</label>
          <div className="flex flex-wrap gap-2">
            {GRINDS.map((option) => (
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
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="text-sm font-medium text-kawa-700 block mb-1">Quantité</label>
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
      />
    </div>
  )
}
