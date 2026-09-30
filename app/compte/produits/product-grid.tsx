import Link from 'next/link'
import { AddToCartButton } from './add-to-cart-button'
import { ProductImage } from './product-image'
import type { Dictionary } from '@/lib/i18n/dictionary'

const currency = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
})

type Product = {
  id: string
  category: string
  name: string
  description: string | null
  short_description: string | null
  price: number | null
  basePrice: number | null
  image_url: string | null
  hover_image_url: string | null
  tag: string | null
  purchasable: boolean
  in_stock: boolean
}

export function ProductGrid({ products, t }: { products: Product[]; t: Dictionary['produits'] }) {
  if (products.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-kawa-200 p-6 text-kawa-400 text-sm">
        {t.emptyCategory}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
      {products.map((product) => (
        <article
          key={product.id}
          className="group flex flex-col overflow-hidden rounded-2xl border border-kawa-200 bg-kawa-50"
        >
          {product.tag && (
            <p className="px-5 pt-4 text-[10px] uppercase tracking-wide text-sky-700 font-medium">
              {product.tag}
            </p>
          )}
          <ProductImage
            imageUrl={product.image_url}
            hoverImageUrl={product.hover_image_url}
            name={product.name}
          />
          <Link
            href={`/compte/produits/produit/${product.id}`}
            className="flex flex-col gap-2 p-5 pb-0"
          >
            <p className="font-semibold text-kawa-800 hover:underline decoration-sky-500">
              {product.name}
            </p>
            {product.category === 'cafe' && product.short_description && (
              <p className="text-sm text-kawa-500">{product.short_description}</p>
            )}
          </Link>
          <div className="flex flex-col gap-2 p-5 pt-2 mt-auto">
            {product.price != null ? (
              <p className="flex items-baseline gap-2">
                {product.basePrice != null && product.basePrice !== product.price && (
                  <span className="text-kawa-400 line-through text-sm">
                    {currency.format(product.basePrice)}
                  </span>
                )}
                <span className="text-sky-700 font-bold">{currency.format(product.price)}</span>
              </p>
            ) : (
              <p className="text-kawa-600 font-bold">{t.onRequest}</p>
            )}

            {!product.in_stock ? (
              <p className="text-center w-full bg-kawa-100 text-kawa-600 py-2 rounded-lg font-medium">
                {t.outOfStock}
              </p>
            ) : product.purchasable ? (
              <AddToCartButton productId={product.id} t={t} />
            ) : (
              <Link
                href={`/compte/produits/produit/${product.id}`}
                className="text-center w-full bg-sky-500 text-kawa-950 py-2 rounded-lg font-medium hover:bg-sky-600 transition"
              >
                {t.interested}
              </Link>
            )}
          </div>
        </article>
      ))}
    </div>
  )
}
