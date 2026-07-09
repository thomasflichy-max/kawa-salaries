import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProductById } from '@/lib/products'
import { getEmployee } from '@/lib/get-employee'
import { PRODUCT_CATEGORIES } from '@/lib/product-categories'
import { QuantityAddForm } from '../../quantity-add-form'
import { InterestForm } from '../../interest-form'

const currency = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
})

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { coffeeDiscounts } = await getEmployee()
  const product = await getProductById(id, coffeeDiscounts)

  if (!product) {
    notFound()
  }

  const category = PRODUCT_CATEGORIES.find((c) => c.key === product.category)
  const isCoffee = product.category === 'cafe'

  return (
    <div className="flex flex-col gap-8">
      <nav className="text-sm text-kawa-500 flex items-center gap-2">
        <Link href="/compte/produits" className="hover:text-kawa-800 hover:underline">
          Produits
        </Link>
        {category && (
          <>
            <span>/</span>
            <Link
              href={`/compte/produits/${category.slug}`}
              className="hover:text-kawa-800 hover:underline"
            >
              {category.label}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-kawa-800">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10">
        <div className="group relative aspect-square bg-white rounded-2xl border border-kawa-200 overflow-hidden">
          {product.image_url && (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              sizes="(min-width:768px) 40vw, 90vw"
              className={`object-contain transition-opacity duration-500 ${
                product.hover_image_url ? 'group-hover:opacity-0' : ''
              }`}
            />
          )}
          {product.hover_image_url && (
            <Image
              src={product.hover_image_url}
              alt={product.name}
              fill
              sizes="(min-width:768px) 40vw, 90vw"
              className="object-contain opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
          )}
          {product.tag && (
            <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs uppercase tracking-wide text-sky-700 font-medium">
              {product.tag}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold text-kawa-800">{product.name}</h1>
            {product.price != null ? (
              <span className="inline-flex items-baseline gap-2 mt-3">
                {product.basePrice != null && product.basePrice !== product.price && (
                  <span className="text-kawa-400 line-through">
                    {currency.format(product.basePrice)}
                  </span>
                )}
                <span className="inline-block bg-sky-500 text-kawa-950 font-bold text-xl px-4 py-1 rounded-full">
                  {currency.format(product.price)}
                </span>
              </span>
            ) : (
              <span className="inline-block bg-kawa-100 text-kawa-700 font-bold text-xl px-4 py-1 rounded-full mt-3">
                Sur demande
              </span>
            )}
          </div>

          {product.description && (
            <p className="text-kawa-600 leading-relaxed">{product.description}</p>
          )}

          {isCoffee && (
            <p className="text-sm text-kawa-500">Conditionnement : sachet de 1 kg.</p>
          )}

          {product.purchasable ? (
            <>
              <QuantityAddForm productId={product.id} showGrind={isCoffee} />
              <p className="text-xs text-kawa-400">
                Les options de livraison seront à choisir au moment du passage de commande.
              </p>
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-kawa-600">
                Ce produit n&apos;est pas disponible à l&apos;achat direct. Laissez-nous vos
                coordonnées, nous vous recontactons.
              </p>
              <InterestForm productId={product.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
