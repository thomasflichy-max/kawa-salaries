'use client'

import { useActionState, useState } from 'react'
import { createManualOrderAction } from './manual-order-actions'
import { vatRateFor, unitFor, type CatalogProduct } from './order-items-editor'
import { KAWA_OFFICE } from '@/app/admin/demo-data'
import type { ManualOrderPaymentMethod } from './manual-orders'

const currency = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })

const PAYMENT_METHOD_LABELS: Record<ManualOrderPaymentMethod, string> = {
  virement: 'Virement (en attente)',
  lien_cb: 'Lien de paiement CB',
  boutique: 'En boutique',
}

function todayInputValue() {
  return new Date().toISOString().slice(0, 10)
}

export type OrgEmployee = { id: string; fullName: string; email: string; billingAddress: string | null }
export type OrgSite = { id: string; label: string; address: string }

type DraftItem = {
  productName: string
  quantity: number
  unitPriceTTC: number
  vatRate: number
  unit: 'Kg' | 'unité'
  imageUrl: string
}

export function CreateOrderForm({
  organizations,
  employeesByOrg,
  sitesByOrg,
  catalogByOrg,
}: {
  organizations: { id: string; name: string }[]
  employeesByOrg: Record<string, OrgEmployee[]>
  sitesByOrg: Record<string, OrgSite[]>
  catalogByOrg: Record<string, CatalogProduct[]>
}) {
  const [state, action, pending] = useActionState(createManualOrderAction, undefined)

  const [organizationId, setOrganizationId] = useState('')
  const [profileId, setProfileId] = useState('')
  const [billingAddress, setBillingAddress] = useState('')
  const [deliveryMode, setDeliveryMode] = useState<'pickup' | 'delivery'>('pickup')
  const [siteId, setSiteId] = useState('')
  const [orderDate, setOrderDate] = useState(todayInputValue)
  const [comment, setComment] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<ManualOrderPaymentMethod>('lien_cb')
  const [paymentLink, setPaymentLink] = useState('')
  const [items, setItems] = useState<DraftItem[]>([])

  const [custom, setCustom] = useState(false)
  const [productId, setProductId] = useState('')
  const [catalogPrice, setCatalogPrice] = useState('')
  const [customName, setCustomName] = useState('')
  const [customPrice, setCustomPrice] = useState('')
  const [customCategory, setCustomCategory] = useState<'cafe' | 'autre'>('autre')
  const [quantity, setQuantity] = useState(1)

  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editQuantity, setEditQuantity] = useState(1)
  const [editPrice, setEditPrice] = useState('')

  const employees = employeesByOrg[organizationId] ?? []
  const sites = sitesByOrg[organizationId] ?? []
  const products = [...(catalogByOrg[organizationId] ?? [])].sort((a, b) => a.name.localeCompare(b.name))
  const selectedProduct = products.find((p) => p.id === productId) ?? null
  const address =
    deliveryMode === 'pickup' ? KAWA_OFFICE.address : sites.find((s) => s.id === siteId)?.address ?? ''
  const total = items.reduce((sum, item) => sum + item.unitPriceTTC * item.quantity, 0)

  function handleOrganizationChange(id: string) {
    setOrganizationId(id)
    setProfileId('')
    setBillingAddress('')
    setSiteId('')
    setItems([])
  }

  function handleEmployeeChange(id: string) {
    setProfileId(id)
    const employee = employees.find((e) => e.id === id)
    setBillingAddress(employee?.billingAddress ?? '')
  }

  function handleProductChange(id: string) {
    setProductId(id)
    const product = products.find((p) => p.id === id)
    setCatalogPrice(product?.price != null ? String(product.price) : '')
  }

  function handleAddItem() {
    if (custom) {
      const price = Number(customPrice.replace(',', '.'))
      if (!customName.trim() || !(price >= 0) || quantity < 1) return
      setItems((prev) => [
        ...prev,
        {
          productName: customName.trim(),
          quantity,
          unitPriceTTC: price,
          vatRate: vatRateFor(customCategory),
          unit: unitFor(customCategory),
          imageUrl: '/logo-kawa-nantes.png',
        },
      ])
      setCustomName('')
      setCustomPrice('')
      setQuantity(1)
      return
    }
    const price = Number(catalogPrice.replace(',', '.'))
    if (!selectedProduct || !(price >= 0) || quantity < 1) return
    setItems((prev) => [
      ...prev,
      {
        productName: selectedProduct.name,
        quantity,
        unitPriceTTC: price,
        vatRate: vatRateFor(selectedProduct.category),
        unit: unitFor(selectedProduct.category),
        imageUrl: selectedProduct.imageUrl ?? '/logo-kawa-nantes.png',
      },
    ])
    setQuantity(1)
  }

  function startEditItem(index: number) {
    setEditingIndex(index)
    setEditQuantity(items[index].quantity)
    setEditPrice(String(items[index].unitPriceTTC))
  }

  function saveEditItem() {
    if (editingIndex === null) return
    const price = Number(editPrice.replace(',', '.'))
    if (!(price >= 0) || editQuantity < 1) return
    setItems((prev) =>
      prev.map((item, i) =>
        i === editingIndex ? { ...item, quantity: editQuantity, unitPriceTTC: price } : item
      )
    )
    setEditingIndex(null)
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="organization_id" value={organizationId} />
      <input type="hidden" name="profile_id" value={profileId} />
      <input type="hidden" name="delivery_mode" value={deliveryMode} />
      <input type="hidden" name="address" value={address} />
      {items.map((item, i) => (
        <span key={i}>
          <input type="hidden" name="item_product_name" value={item.productName} />
          <input type="hidden" name="item_quantity" value={item.quantity} />
          <input type="hidden" name="item_unit_price_ttc" value={item.unitPriceTTC} />
          <input type="hidden" name="item_vat_rate" value={item.vatRate} />
          <input type="hidden" name="item_unit" value={item.unit} />
          <input type="hidden" name="item_image_url" value={item.imageUrl} />
        </span>
      ))}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-kawa-700">Entreprise</label>
          <select
            value={organizationId}
            onChange={(e) => handleOrganizationChange(e.target.value)}
            required
            className="mt-1 w-full border border-kawa-200 rounded-lg px-3 py-2 text-kawa-800 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
          >
            <option value="">— Choisir —</option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-kawa-700">Salarié</label>
          <select
            value={profileId}
            onChange={(e) => handleEmployeeChange(e.target.value)}
            required
            disabled={!organizationId}
            className="mt-1 w-full border border-kawa-200 rounded-lg px-3 py-2 text-kawa-800 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 disabled:opacity-50"
          >
            <option value="">— Choisir —</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.fullName} ({employee.email})
              </option>
            ))}
          </select>
          {organizationId && employees.length === 0 && (
            <p className="text-xs text-red-600 mt-1">Aucun salarié inscrit pour cette entreprise.</p>
          )}
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-kawa-700">Adresse de facturation</label>
          <input
            type="text"
            name="billing_address"
            value={billingAddress}
            onChange={(e) => setBillingAddress(e.target.value)}
            required
            disabled={!profileId}
            placeholder={profileId ? '' : 'Choisis d’abord un salarié'}
            className="mt-1 w-full border border-kawa-200 rounded-lg px-3 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400 disabled:opacity-50"
          />
        </div>
        <div>
          <label className="text-sm font-medium text-kawa-700">Date de commande</label>
          <input
            type="date"
            name="order_date"
            value={orderDate}
            onChange={(e) => setOrderDate(e.target.value)}
            required
            className="mt-1 w-full border border-kawa-200 rounded-lg px-3 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-kawa-700">Livraison</label>
        <div className="mt-1 flex gap-3">
          <select
            value={deliveryMode === 'pickup' ? 'pickup' : siteId}
            onChange={(e) => {
              if (e.target.value === 'pickup') {
                setDeliveryMode('pickup')
                setSiteId('')
              } else {
                setDeliveryMode('delivery')
                setSiteId(e.target.value)
              }
            }}
            disabled={!organizationId}
            className="flex-1 border border-kawa-200 rounded-lg px-3 py-2 text-kawa-800 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 disabled:opacity-50"
          >
            <option value="pickup">Retrait {KAWA_OFFICE.shortName}</option>
            {sites.map((site) => (
              <option key={site.id} value={site.id}>
                {site.label} — {site.address}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-kawa-700 mb-2">Articles</p>
        {items.length > 0 && (
          <ul className="flex flex-col gap-2 mb-3">
            {items.map((item, i) =>
              editingIndex === i ? (
                <li key={i} className="flex flex-wrap items-center gap-2 text-sm bg-kawa-50 rounded-lg px-2 py-1.5">
                  <span className="flex-1 text-kawa-800">{item.productName}</span>
                  <input
                    type="number"
                    min={1}
                    value={editQuantity}
                    onChange={(e) => setEditQuantity(Math.max(1, Number(e.target.value) || 1))}
                    className="w-16 border border-kawa-200 rounded-lg px-2 py-1 text-right focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                  <input
                    type="text"
                    inputMode="decimal"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="w-20 border border-kawa-200 rounded-lg px-2 py-1 text-right focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                  <button type="button" onClick={saveEditItem} className="text-sky-700 hover:underline">
                    Enregistrer
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingIndex(null)}
                    className="text-kawa-500 hover:underline"
                  >
                    Annuler
                  </button>
                </li>
              ) : (
                <li key={i} className="flex flex-wrap items-center gap-3 text-sm">
                  <span className="flex-1 text-kawa-800">{item.productName}</span>
                  <span className="text-kawa-500">× {item.quantity}</span>
                  <span className="text-kawa-800 w-24 text-right">
                    {currency.format(item.unitPriceTTC * item.quantity)}
                  </span>
                  <button
                    type="button"
                    onClick={() => startEditItem(i)}
                    className="text-sky-700 hover:underline"
                  >
                    Modifier
                  </button>
                  <button
                    type="button"
                    onClick={() => setItems((prev) => prev.filter((_, idx) => idx !== i))}
                    className="text-red-600 hover:underline"
                  >
                    Retirer
                  </button>
                </li>
              )
            )}
            <li className="flex items-center justify-between text-sm font-semibold text-kawa-800 border-t border-kawa-100 pt-2">
              <span>Total TTC</span>
              <span>{currency.format(total)}</span>
            </li>
          </ul>
        )}

        <div className="bg-kawa-50 rounded-lg p-3 flex flex-wrap items-end gap-2">
          {!custom ? (
            <>
              <select
                value={productId}
                onChange={(e) => handleProductChange(e.target.value)}
                disabled={!organizationId}
                className="border border-kawa-200 rounded-lg px-3 py-2 text-sm text-kawa-800 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400 min-w-[220px] disabled:opacity-50"
              >
                <option value="">— Choisir un produit —</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.price != null ? `— ${currency.format(p.price)}` : '(sans prix par défaut)'}
                    {p.basePrice != null && p.price != null
                      ? ` (remise -${currency.format(p.basePrice - p.price)})`
                      : ''}
                  </option>
                ))}
              </select>
              <div>
                <label className="block text-xs text-kawa-500 mb-1">Prix TTC</label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={catalogPrice}
                  onChange={(e) => setCatalogPrice(e.target.value)}
                  disabled={!productId}
                  placeholder="0,00"
                  className="w-24 border border-kawa-200 rounded-lg px-2 py-2 text-sm text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400 disabled:opacity-50"
                />
                {selectedProduct?.basePrice != null && (
                  <p className="text-xs text-emerald-700 mt-1 whitespace-nowrap">
                    Remise appliquée : prix catalogue {currency.format(selectedProduct.basePrice)}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs text-kawa-500 mb-1">Qté</label>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                  className="w-20 border border-kawa-200 rounded-lg px-2 py-2 text-sm text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>
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
            onClick={handleAddItem}
            disabled={!organizationId}
            className="bg-sky-500 text-kawa-950 px-4 py-2 rounded-lg text-sm font-medium hover:bg-sky-600 transition disabled:opacity-50"
          >
            Ajouter
          </button>
        </div>
        <button
          type="button"
          onClick={() => setCustom((v) => !v)}
          className="mt-2 text-xs text-sky-700 hover:underline"
        >
          {custom ? 'Choisir un produit du catalogue' : 'La référence n’est pas dans le catalogue →'}
        </button>
      </div>

      <div>
        <label className="text-sm font-medium text-kawa-700">Mode de paiement</label>
        <select
          name="payment_method"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value as ManualOrderPaymentMethod)}
          required
          className="mt-1 w-full border border-kawa-200 rounded-lg px-3 py-2 text-kawa-800 bg-white focus:outline-none focus:ring-2 focus:ring-sky-400"
        >
          {(Object.keys(PAYMENT_METHOD_LABELS) as ManualOrderPaymentMethod[]).map((method) => (
            <option key={method} value={method}>
              {PAYMENT_METHOD_LABELS[method]}
            </option>
          ))}
        </select>
      </div>

      {paymentMethod === 'lien_cb' && (
        <div>
          <label className="text-sm font-medium text-kawa-700">
            Lien de paiement <span className="text-kawa-400 font-normal">(facultatif, ajoutable après)</span>
          </label>
          <input
            type="url"
            name="payment_link"
            value={paymentLink}
            onChange={(e) => setPaymentLink(e.target.value)}
            placeholder="https://..."
            className="mt-1 w-full border border-kawa-200 rounded-lg px-3 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
        </div>
      )}

      <div>
        <label className="text-sm font-medium text-kawa-700">
          Commentaire <span className="text-kawa-400 font-normal">(usage interne, invisible du salarié)</span>
        </label>
        <textarea
          name="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          className="mt-1 w-full border border-kawa-200 rounded-lg px-3 py-2 text-kawa-800 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={pending || items.length === 0 || !profileId}
          className="bg-sky-500 text-kawa-950 px-4 py-2 rounded-lg font-medium hover:bg-sky-600 transition disabled:opacity-50"
        >
          {pending ? 'Création…' : 'Créer la commande'}
        </button>
      </div>

      {state?.error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{state.error}</p>
      )}
    </form>
  )
}
