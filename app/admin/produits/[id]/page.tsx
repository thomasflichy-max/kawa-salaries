import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { updateProduct } from '../actions'
import { ProductForm } from '../product-form'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: product } = await supabase
    .from('products')
    .select(
      'id, category, subcategory, tag, name, description, price, image_url, hover_image_url, sort_order, purchasable, active'
    )
    .eq('id', id)
    .maybeSingle()

  if (!product) {
    notFound()
  }

  const boundUpdate = updateProduct.bind(null, product.id)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/produits" className="text-sky-700 hover:underline text-sm">
          ← Retour au catalogue
        </Link>
        <h1 className="text-xl font-bold text-kawa-800 mt-2">Modifier « {product.name} »</h1>
      </div>

      <section className="bg-white rounded-2xl border border-kawa-200 p-6">
        <ProductForm action={boundUpdate} defaults={product} submitLabel="Enregistrer" />
      </section>
    </div>
  )
}
