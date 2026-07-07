import Link from 'next/link'
import { createProduct } from '../actions'
import { ProductForm } from '../product-form'

export default function NewProductPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/produits" className="text-sky-700 hover:underline text-sm">
          ← Retour au catalogue
        </Link>
        <h1 className="text-xl font-bold text-kawa-800 mt-2">Ajouter un produit</h1>
      </div>

      <section className="bg-white rounded-2xl border border-kawa-200 p-6">
        <ProductForm action={createProduct} submitLabel="Ajouter le produit" />
      </section>
    </div>
  )
}
