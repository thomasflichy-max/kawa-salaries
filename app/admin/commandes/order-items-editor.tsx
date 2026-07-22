'use client'

import { useMemo, useState, useTransition } from 'react'
import Image from 'next/image'
import type { DemoOrderItem } from '@/app/admin/demo-data'
import { addOrderItemAction, removeOrderItemAction, updateOrderItemQuantityAction } from './actions'

const currency = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })

function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0-1 14a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1L5 6" />
    </svg>
  )
}

export type CatalogProduct = {
  id: string
  name: string
  category: string
  price: number | null
  imageUrl: string | null
  // Pre-discount price, only set when it differs from `price` (i.e. a coffee
  // product with an organization discount applied) — lets the "create order"
  // picker show the remise instead of just the already-discounted number.
  basePrice?: number | null
}

// Coffee (category "cafe") is taxed as a food product at 5.5%, everything
// else (machines, entretien) at the standard 20% rate — same split used
// everywhere else in the app, from the cart to the invoice PDF.
export function vatRateFor(category: string) {
  return category === 'cafe' ? 0.055 : 0.2
}
export function unitFor(category: string) {
  return category === 'cafe' ? ('Kg' as const) : ('unité' as const)
}

function ItemRow({ orderId, item, locked }: { orderId: string; item: DemoOrderItem; locked: boolean }) {
  const [quantity, setQuantity] = useState(item.quantity)
  const [isPending, startTransition] = useTransition()
  const dirty = quantity !== item.quantity

  function saveQuantity() {
    if (!dirty || quantity < 1) return
    startTransition(async () => {
      await updateOrderItemQuantityAction(orderId, item.id, quantity)
    })
  }

  function handleRemove() {
    if (!confirm(`Retirer "${item.productName}" de la commande ?`)) return
    startTransition(async () => {
      await removeOrderItemAction(orderId, item.id)
    })
  }

  return (
    <tr className="border-b border-kawa-50 last:border-0">
      <td className="px-5 py-3 text-kawa-800">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-kawa-50 shrink-0">
            <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" sizes="48px" />
          </div>
          {item.productName}
        </div>
      </td>
      <td className="px-5 py-3 text-right">
        {locked ? (
          <span className="text-kawa-500">{item.quantity}</span>
        ) : (
          <div className="flex items-center justify-end gap-2">
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
              onBlur={saveQuantity}
              disabled={isPending}
              className="w-16 border border-kawa-200 rounded-lg px-2 py-1 text-right text-sm text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            <button
              type="button"
              onClick={handleRemove}
              disabled={isPending}
              aria-label={`Retirer ${item.productName}`}
              className="text-kawa-400 hover:text-red-600 transition disabled:opacity-50"
            >
              <TrashIcon />
            </button>
          </div>
        )}
      </td>
      <td className="px-5 py-3 text-kawa-500 text-right">{currency.format(item.unitPriceTTC)}</td>
      <td className="px-5 py-3 text-kawa-800 text-right font-medium">
        {currency.format(item.unitPriceTTC * item.quantity)}
      </td>
    </tr>
  )
}

function AddItemForm({ orderId, products }: { orderId: string; products: CatalogProduct[] }) {
  const [custom, setCustom] = useState(false)
  const [productId, setProductId] = useState(products[0]?.id ?? '')
  const [customName, setCustomName] = useState('')
  const [customPrice, setCustomPrice] = useState('')
  const [customCategory, setCustomCategory] = useState<'cafe' | 'autre'>('autre')
  const [quantity, setQuantity] = useState(1)
  const [isPending, startTransition] = useTransition()

  const selectedProduct = products.find((p) => p.id === productId) ?? null

  function handleAdd() {
    if (custom) {
      const price = Number(customPrice.replace(',', '.'))
      if (!customName.trim() || !(price > 0) || quantity < 1) return
      startTransition(async () => {
        await addOrderItemAction(orderId, {
          productName: customName.trim(),
          quantity,
          imageUrl: '/logo-kawa-nantes.png',
          unit: unitFor(customCategory),
          unitPriceTTC: price,
          vatRate: vatRateFor(customCategory),
        })
        setCustomName('')
        setCustomPrice('')
        setQuantity(1)
      })
      return
    }
    if (!selectedProduct || selectedProduct.price == null || quantity < 1) return
    startTransition(async () => {
      await addOrderItemAction(orderId, {
        productName: selectedProduct.name,
        quantity,
        imageUrl: selectedProduct.imageUrl ?? '/logo-kawa-nantes.png',
        unit: unitFor(selectedProduct.category),
        unitPriceTTC: selectedProduct.price!,
        vatRate: vatRateFor(selectedProduct.category),
      })
      setQuantity(1)
    })
  }

  return (
    <div className="px-5 py-4 bg-kawa-50 flex flex-col gap-3">
      <p className="text-sm font-medium text-kawa-700">Ajouter un article manquant</p>
      <div className="flex flex-wrap items-end gap-2">
        {!custom ? (
          <>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="border border-kawa-200 rounded-lg px-3 py-2 text-sm text-kawa-800 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 min-w-[220px]"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id} disabled={p.price == null}>
                  {p.name} {p.price != null ? `— ${currency.format(p.price)}` : '(sans prix)'}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
              className="w-20 border border-kawa-200 rounded-lg px-2 py-2 text-sm text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Nom du produit"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              className="border border-kawa-200 rounded-lg px-3 py-2 text-sm text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            <input
              type="text"
              inputMode="decimal"
              placeholder="Prix TTC"
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
              className="w-24 border border-kawa-200 rounded-lg px-3 py-2 text-sm text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
            <select
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value as 'cafe' | 'autre')}
              className="border border-kawa-200 rounded-lg px-3 py-2 text-sm text-kawa-800 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              <option value="cafe">Café (TVA 5,5 %)</option>
              <option value="autre">Autre (TVA 20 %)</option>
            </select>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
              className="w-20 border border-kawa-200 rounded-lg px-2 py-2 text-sm text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
            />
          </>
        )}
        <button
          type="button"
          onClick={handleAdd}
          disabled={isPending}
          className="bg-sky-500 text-kawa-950 px-4 py-2 rounded-lg text-sm font-medium hover:bg-sky-600 transition disabled:opacity-50"
        >
          {isPending ? 'Ajout…' : 'Ajouter'}
        </button>
      </div>
      <button
        type="button"
        onClick={() => setCustom((v) => !v)}
        className="text-xs text-sky-700 hover:underline w-fit"
      >
        {custom ? 'Choisir un produit du catalogue' : 'La référence n’est pas dans le catalogue →'}
      </button>
    </div>
  )
}

export function OrderItemsEditor({
  orderId,
  items,
  amount,
  products,
  readOnly,
}: {
  orderId: string
  items: DemoOrderItem[]
  amount: number
  products: CatalogProduct[]
  readOnly?: boolean
}) {
  const [editing, setEditing] = useState(false)
  const sortedProducts = useMemo(
    () => [...products].sort((a, b) => a.name.localeCompare(b.name)),
    [products]
  )

  return (
    <section className="bg-white rounded-2xl border border-kawa-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-kawa-200">
        <h2 className="text-sm font-semibold text-kawa-800">Articles commandés</h2>
        {!readOnly && (
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className="flex items-center gap-1.5 text-kawa-400 hover:text-sky-700 transition text-xs font-medium"
          >
            <PencilIcon />
            {editing ? 'Terminer' : 'Modifier'}
          </button>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-kawa-500 border-b border-kawa-100">
              <th className="px-5 py-3 font-medium">Produit</th>
              <th className="px-5 py-3 font-medium text-right">Quantité</th>
              <th className="px-5 py-3 font-medium text-right">Prix unitaire TTC</th>
              <th className="px-5 py-3 font-medium text-right">Total TTC</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <ItemRow key={item.id} orderId={orderId} item={item} locked={!editing} />
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="px-5 py-3 text-right text-kawa-500 font-medium">
                Total TTC
              </td>
              <td className="px-5 py-3 text-right text-kawa-800 font-semibold">
                {currency.format(amount)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      {editing && <AddItemForm orderId={orderId} products={sortedProducts} />}
    </section>
  )
}
