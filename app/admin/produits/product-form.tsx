'use client'

import { useActionState, useState } from 'react'
import type { ProductFormState } from './actions'
import { PRODUCT_CATEGORIES } from '@/lib/product-categories'
import { ImageUploadField } from './image-upload-field'

const COFFEE_SUBCATEGORIES = [
  { key: '', label: 'Sans sous-catégorie (prix fixe)' },
  { key: 'classique', label: 'Classique' },
  { key: 'bio', label: 'Bio' },
  { key: 'decafeine', label: 'Décaféiné' },
] as const

// Kept in sync with app/compte/produits/choisir-son-cafe/guide-wizard.tsx's
// FLAVOR_KEYWORDS — these are the only tags the guide knows how to show as
// a button.
const FLAVOR_OPTIONS = ['chocolat', 'corsé', 'doux', 'épicé', 'intense', 'noisette', 'caramel']

type ProductDefaults = {
  category: string
  subcategory: string | null
  tag: string | null
  name: string
  description: string | null
  short_description: string | null
  flavor_tags: string[]
  price: number | null
  image_url: string | null
  hover_image_url: string | null
  sort_order: number
  purchasable: boolean
  active: boolean
  net_weight_grams: number
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
  const [category, setCategory] = useState(defaults?.category ?? PRODUCT_CATEGORIES[0].key)
  // `defaults?.subcategory ?? 'classique'` would be wrong here: it can't tell
  // "no defaults at all" (new product, 'classique' is a fine starting point)
  // apart from "editing an existing fixed-price coffee whose subcategory is
  // genuinely null" — collapsing both to 'classique' is exactly what silently
  // reassigned Déca KAWA back onto the shared per-kg pricing on its first re-save.
  const [subcategory, setSubcategory] = useState(defaults ? defaults.subcategory ?? '' : 'classique')
  const [flavorTags, setFlavorTags] = useState<string[]>(defaults?.flavor_tags ?? [])
  const isCoffee = category === 'cafe'

  function toggleFlavor(flavor: string) {
    setFlavorTags((prev) =>
      prev.includes(flavor) ? prev.filter((f) => f !== flavor) : [...prev, flavor]
    )
  }
  // Coffee normally follows the shared per-kg pricing (Products → Tarification
  // des cafés), but a coffee with no subcategory — like the 200g Déca KAWA —
  // is priced directly, same as a non-coffee product.
  const hasFixedPrice = !isCoffee || subcategory === ''

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
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 w-full border border-kawa-200 rounded-lg px-3 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
          >
            {PRODUCT_CATEGORIES.map((c) => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {isCoffee && (
          <div>
            <label className="text-sm font-medium text-kawa-700">Sous-catégorie</label>
            <select
              name="subcategory"
              value={subcategory}
              onChange={(e) => setSubcategory(e.target.value)}
              className="mt-1 w-full border border-kawa-200 rounded-lg px-3 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              {COFFEE_SUBCATEGORIES.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div>
        <label className="text-sm font-medium text-kawa-700">Description courte (grille produits)</label>
        <textarea
          name="short_description"
          rows={2}
          defaultValue={defaults?.short_description ?? ''}
          className="mt-1 w-full border border-kawa-200 rounded-lg px-3 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
      </div>

      <div>
        <label className="text-sm font-medium text-kawa-700">Description détaillée (fiche produit)</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={defaults?.description ?? ''}
          className="mt-1 w-full border border-kawa-200 rounded-lg px-3 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
      </div>

      {isCoffee && (
        <div>
          <label className="text-sm font-medium text-kawa-700 block mb-1">
            Tags de goût (guide &quot;Choisir son café&quot;)
          </label>
          <details className="relative">
            <summary className="cursor-pointer list-none w-full border border-kawa-200 rounded-lg px-3 py-2 flex items-center justify-between gap-2 focus:outline-none focus:ring-2 focus:ring-sky-400">
              <span className={flavorTags.length > 0 ? 'text-kawa-800 capitalize' : 'text-kawa-400'}>
                {flavorTags.length > 0 ? flavorTags.join(', ') : 'Choisir un ou plusieurs goûts'}
              </span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="text-kawa-400 shrink-0">
                <path d="M6 9l6 6 6-6" />
              </svg>
            </summary>
            <div className="absolute z-10 mt-1 w-full bg-white border border-kawa-200 rounded-lg shadow-lg p-2 flex flex-col gap-0.5">
              {FLAVOR_OPTIONS.map((flavor) => (
                <label
                  key={flavor}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-kawa-50 cursor-pointer text-sm text-kawa-700 capitalize"
                >
                  <input
                    type="checkbox"
                    name="flavor_tags"
                    value={flavor}
                    checked={flavorTags.includes(flavor)}
                    onChange={() => toggleFlavor(flavor)}
                    className="rounded border-kawa-300 text-sky-500 focus:ring-sky-400"
                  />
                  {flavor}
                </label>
              ))}
            </div>
          </details>
        </div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {hasFixedPrice && (
          <div>
            <label className="text-sm font-medium text-kawa-700">Prix (€)</label>
            <input
              type="number"
              step="0.01"
              min={0}
              name="price"
              defaultValue={defaults?.price ?? ''}
              className="mt-1 w-full border border-kawa-200 rounded-lg px-3 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>
        )}

        {isCoffee && (
          <div>
            <label className="text-sm font-medium text-kawa-700">Poids du sachet (g)</label>
            <input
              type="number"
              step="1"
              min={1}
              name="net_weight_grams"
              defaultValue={defaults?.net_weight_grams ?? 1000}
              className="mt-1 w-full border border-kawa-200 rounded-lg px-3 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>
        )}

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
      {isCoffee && !hasFixedPrice && (
        <p className="text-xs text-kawa-400 -mt-3">
          Le prix des cafés est calculé automatiquement depuis la tarification café (onglet
          Products → Tarification des cafés) et la remise de l&apos;entreprise du salarié.
        </p>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <ImageUploadField
          name="image_url"
          label="Image"
          defaultValue={defaults?.image_url}
        />
        <ImageUploadField
          name="hover_image_url"
          label="Image au survol (optionnel)"
          defaultValue={defaults?.hover_image_url}
        />
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
