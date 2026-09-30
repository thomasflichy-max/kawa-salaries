import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProductById, localizeProduct } from '@/lib/products'
import { getEmployee } from '@/lib/get-employee'
import { createClient } from '@/lib/supabase/server'
import { PRODUCT_CATEGORIES, categoryLabel } from '@/lib/product-categories'
import { getLocale } from '@/lib/i18n/locale'
import { getDictionary } from '@/lib/i18n/dictionary'
import { QuantityAddForm } from '../../quantity-add-form'
import { InterestForm } from '../../interest-form'
import { ProductImage } from '../../product-image'
import { ProductInterestSurvey } from './product-interest-survey'
import { SubscribeForm } from './subscribe-form'

const currency = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
})

const VALID_GRINDS = ['grain', 'filtre', 'espresso'] as const

// Render the free-text detailed description: lines starting with -, *, • or –
// become a proper bullet list, everything else stays a paragraph. Blank lines
// separate blocks.
function ProductDescription({ text }: { text: string }) {
  const blocks: { type: 'p' | 'ul'; lines: string[] }[] = []
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim()
    if (!line) continue
    const bulletMatch = line.match(/^[-*•–]\s+(.*)$/)
    const last = blocks[blocks.length - 1]
    if (bulletMatch) {
      if (last?.type === 'ul') last.lines.push(bulletMatch[1])
      else blocks.push({ type: 'ul', lines: [bulletMatch[1]] })
    } else {
      if (last?.type === 'p') last.lines.push(line)
      else blocks.push({ type: 'p', lines: [line] })
    }
  }

  return (
    <div className="flex flex-col gap-2 text-kawa-600 leading-relaxed">
      {blocks.map((block, i) =>
        block.type === 'ul' ? (
          <ul key={i} className="list-disc pl-5 flex flex-col gap-1">
            {block.lines.map((item, j) => (
              <li key={j}>{item}</li>
            ))}
          </ul>
        ) : (
          <p key={i} className="whitespace-pre-line">
            {block.lines.join('\n')}
          </p>
        )
      )}
    </div>
  )
}

export default async function ProductDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ mouture?: string }>
}) {
  const { id } = await params
  const { mouture } = await searchParams
  const { coffeeDiscounts, user } = await getEmployee()
  const locale = await getLocale()
  const t = getDictionary(locale)
  const rawProduct = await getProductById(id, coffeeDiscounts)

  if (!rawProduct) {
    notFound()
  }
  const product = localizeProduct(rawProduct, locale)

  // Comes from the "Choisir son café" guide, which already worked out the
  // right mouture from the employee's machine type — pre-select it rather
  // than making them pick it again. Ignore anything that isn't one of the
  // 3 real values (untrusted query param).
  const initialGrind = VALID_GRINDS.find((g) => g === mouture)

  const category = PRODUCT_CATEGORIES.find((c) => c.key === product.category)
  const isCoffee = product.category === 'cafe'

  // 200g interest poll on every coffee except the déca, which is already
  // sold in 200g — no format question to ask there.
  const askAbout200g = isCoffee && product.net_weight_grams !== 200
  let interestedIn200g = false
  if (askAbout200g) {
    const supabase = await createClient()
    const { data: vote } = await supabase
      .from('product_interest_votes')
      .select('id')
      .eq('product_id', product.id)
      .eq('profile_id', user.id)
      .maybeSingle()
    interestedIn200g = !!vote
  }

  return (
    <div className="flex flex-col gap-8">
      <nav className="text-sm text-kawa-500 flex items-center gap-2">
        <Link href="/compte/produits" className="hover:text-kawa-800 hover:underline">
          {t.produits.pageTitle}
        </Link>
        {category && (
          <>
            <span>/</span>
            <Link
              href={`/compte/produits/${category.slug}`}
              className="hover:text-kawa-800 hover:underline"
            >
              {categoryLabel(category, locale)}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-kawa-800">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-10">
        <ProductImage
          imageUrl={product.image_url}
          hoverImageUrl={product.hover_image_url}
          name={product.name}
          sizes="(min-width:768px) 40vw, 90vw"
          className="aspect-square bg-white rounded-2xl border border-kawa-200 overflow-hidden"
        >
          {product.tag && (
            <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs uppercase tracking-wide text-sky-700 font-medium">
              {product.tag}
            </span>
          )}
        </ProductImage>

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
                {t.produits.onRequest}
              </span>
            )}
          </div>

          {product.description && <ProductDescription text={product.description} />}

          {isCoffee && (
            <p className="text-sm text-kawa-500">
              {t.produitDetail.packagingPrefix}{' '}
              {product.net_weight_grams < 1000
                ? `${product.net_weight_grams} g`
                : `${product.net_weight_grams / 1000} kg`}
              .
            </p>
          )}

          {!product.in_stock ? (
            <p className="inline-block self-start bg-kawa-100 text-kawa-700 font-medium px-4 py-2 rounded-lg">
              {t.produitDetail.outOfStockDetail}
            </p>
          ) : product.purchasable ? (
            <>
              <QuantityAddForm
                productId={product.id}
                showGrind={isCoffee}
                initialGrind={isCoffee ? initialGrind : undefined}
                t={t.produits}
                locale={locale}
              />
              <p className="text-xs text-kawa-400">{t.produitDetail.deliveryNote}</p>
              <SubscribeForm productId={product.id} showGrind={isCoffee} t={t.subscribe} locale={locale} />
            </>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm text-kawa-600">{t.produitDetail.notPurchasableIntro}</p>
              <InterestForm productId={product.id} t={t.interestForm} />
            </div>
          )}

          {askAbout200g && (
            <ProductInterestSurvey
              productId={product.id}
              initialInterested={interestedIn200g}
              t={t.interestSurvey}
            />
          )}
        </div>
      </div>
    </div>
  )
}
