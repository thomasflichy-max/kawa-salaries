import Image from 'next/image'
import Link from 'next/link'
import { AddToCartButton } from './add-to-cart-button'

const currency = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
})

type Product = {
  id: string
  name: string
  description: string | null
  price: number | null
  image_url: string | null
  hover_image_url: string | null
  tag: string | null
  purchasable: boolean
}

export function ProductGrid({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-kawa-200 p-6 text-kawa-400 text-sm">
        Aucun produit disponible pour le moment dans cette rubrique.
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
          <Link href={`/compte/produits/produit/${product.id}`}>
            <div className="relative aspect-[4/3] bg-white">
              {product.image_url && (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  sizes="(min-width:1024px) 22vw, 50vw"
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
                  sizes="(min-width:1024px) 22vw, 50vw"
                  className="object-contain opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                />
              )}
              {product.tag && (
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] uppercase tracking-wide text-sky-700 font-medium">
                  {product.tag}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2 p-5 pb-0">
              <p className="font-semibold text-kawa-800 hover:underline decoration-sky-500">
                {product.name}
              </p>
              {product.description && (
                <p className="text-sm text-kawa-500">{product.description}</p>
              )}
            </div>
          </Link>
          <div className="flex flex-col gap-2 p-5 pt-2">
            {product.price != null ? (
              <p className="text-sky-700 font-bold">{currency.format(product.price)}</p>
            ) : (
              <p className="text-kawa-600 font-bold">Sur demande</p>
            )}

            {product.purchasable ? (
              <AddToCartButton productId={product.id} />
            ) : (
              <Link
                href={`/compte/produits/produit/${product.id}`}
                className="text-center w-full bg-sky-500 text-kawa-950 py-2 rounded-lg font-medium hover:bg-sky-600 transition"
              >
                Je suis intéressé
              </Link>
            )}
          </div>
        </article>
      ))}
    </div>
  )
}
