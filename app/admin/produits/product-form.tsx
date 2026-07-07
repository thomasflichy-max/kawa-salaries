'use client'

import { useActionState } from 'react'
import type { ProductFormState } from './actions'
import { PRODUCT_CATEGORIES } from '@/lib/product-categories'

type ProductDefaults = {
  category: string
  subcategory: string | null
  tag: string | null
  name: string
  description: string | null
  price: number | null
  image_url: string | null
  hover_image_url: string | null
  sort_order: number
  purchasable: boolean
  active: boolean
}

export function ProductForm({
  action,
  defaults,
  submitLabel,
}: {
  action: (state: ProductFormState, formData: FormData) => Promise<ProductFormState>
  defaults?: ProductDefaults
  submitLabel: string
}) {
  const [state, formAction, pending] = useActionState(action, undefined)

  return (
    <form action={formAction} className="flex flex-col gap-5 max-w-2xl">
      <div>
        <label className="text-sm font-medium text-kawa-700">Nom du produit</label>
        <input
          type="text"
          name="name"
          required
          defaultValue={defaults?.name}
          className="mt-1 w-full border border-kawa-200 rounded-lg px-3 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-kawa-700">Catégorie</label>
          <select
            name="category"
            required
            defaultValue={defaults?.category ?? PRODUCT_CATEGORIES[0].key}
            className="mt-1 w-full border border-kawa-200 rounded-lg px-3 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
          >
            {PRODUCT_CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-kawa-700">Sous-catégorie</label>
          <input
            type="text"
            name="subcategory"
            placeholder="classique ou bio (cafés uniquement)"
            defaultValue={defaults?.subcategory ?? ''}
            className="mt-1 w-full border border-kawa-200 rounded-lg px-3 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-kawa-700">Description</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={defaults?.description ?? ''}
          className="mt-1 w-full border border-kawa-200 rounded-lg px-3 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-kawa-700">Prix (€)</label>
          <input
            type="number"
            step="0.01"
            min={0}
            name="price"
            placeholder="Laisser vide pour les cafés (prix calculé)"
            defaultValue={defaults?.price ?? ''}
            className="mt-1 w-full border border-kawa-200 rounded-lg px-3 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
          <p className="text-xs text-kawa-400 mt-1">
            Pour les cafés, le prix est calculé depuis la tarification café (Tableau de bord → tarifs).
          </p>
        </div>

        <div>
          <label className="text-sm font-medium text-kawa-700">Étiquette (tag)</label>
          <input
            type="text"
            name="tag"
            placeholder="Nouveau, Best-seller…"
            defaultValue={defaults?.tag ?? ''}
            className="mt-1 w-full border border-kawa-200 rounded-lg px-3 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-kawa-700">Image (URL)</label>
          <input
            type="text"
            name="image_url"
            placeholder="/products/cafes/blend-kawa-600.jpg"
            defaultValue={defaults?.image_url ?? ''}
            className="mt-1 w-full border border-kawa-200 rounded-lg px-3 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-kawa-700">Image au survol (URL)</label>
          <input
            type="text"
            name="hover_image_url"
            placeholder="Optionnel"
            defaultValue={defaults?.hover_image_url ?? ''}
            className="mt-1 w-full border border-kawa-200 rounded-lg px-3 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 items-end">
        <div>
          <label className="text-sm font-medium text-kawa-700">Ordre d&apos;affichage</label>
          <input
            type="number"
            name="sort_order"
            defaultValue={defaults?.sort_order ?? 0}
            className="mt-1 w-full border border-kawa-200 rounded-lg px-3 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-kawa-700 pb-2">
          <input
            type="checkbox"
            name="purchasable"
            defaultChecked={defaults?.purchasable ?? true}
            className="rounded"
          />
          Achetable directement
        </label>
        <label className="flex items-center gap-2 text-sm text-kawa-700 pb-2">
          <input
            type="checkbox"
            name="active"
            defaultChecked={defaults?.active ?? true}
            className="rounded"
          />
          Actif (visible dans le catalogue)
        </label>
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="self-start bg-sky-500 text-kawa-950 px-4 py-2 rounded-lg font-medium hover:bg-sky-600 transition disabled:opacity-50"
      >
        {pending ? 'Enregistrement…' : submitLabel}
      </button>
    </form>
  )
}
