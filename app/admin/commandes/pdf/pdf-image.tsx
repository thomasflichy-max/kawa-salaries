import fs from 'node:fs'
import path from 'node:path'

const cache = new Map<string, string | null>()

// Product images render as ~40px thumbnails on the invoice/BL — downscale to
// this width so an emailed facture doesn't carry a multi-MB source photo.
const THUMB_WIDTH = 200

// Shrink + normalise to PNG via sharp when it's available, otherwise fall
// back to the raw bytes (only works for formats @react-pdf/renderer can
// decode itself, i.e. PNG/JPEG). sharp is imported dynamically inside the
// try: its native binary has failed to load in some Vercel serverless
// bundles for this project, and a static import throws at module-load time
// (before any try/catch), which would take down the whole PDF. Here a sharp
// failure just means a slightly larger image, or — for an exotic format
// with no usable fallback — that one image is dropped.
async function toThumbnailDataUri(
  buffer: Buffer,
  opts: { isPng: boolean; isJpeg: boolean }
): Promise<string | null> {
  try {
    const sharp = (await import('sharp')).default
    const png = await sharp(buffer)
      .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
      .png()
      .toBuffer()
    return `data:image/png;base64,${png.toString('base64')}`
  } catch (sharpError) {
    if (opts.isPng || opts.isJpeg) {
      return `data:image/${opts.isPng ? 'png' : 'jpeg'};base64,${buffer.toString('base64')}`
    }
    console.error('[pdf-image] sharp unavailable and format not embeddable:', sharpError)
    return null
  }
}

// Reads an image from /public (older catalog entries bundled at build time,
// e.g. "/products/cafes/x.jpg"). Node-only; never imported by client code.
async function readPublicImageAsDataUri(publicPath: string): Promise<string | null> {
  try {
    const filePath = path.join(process.cwd(), 'public', publicPath)
    const ext = path.extname(filePath).slice(1).toLowerCase()
    const buffer = await fs.promises.readFile(filePath)
    return toThumbnailDataUri(buffer, { isPng: ext === 'png', isJpeg: ext === 'jpg' || ext === 'jpeg' })
  } catch {
    return null
  }
}

// Fetches a remote product image (Supabase Storage URL — see migration
// 0016_product_images_storage.sql).
async function fetchRemoteImageAsDataUri(url: string): Promise<string | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const buffer = Buffer.from(await res.arrayBuffer())

    const contentType = (res.headers.get('content-type') ?? '').toLowerCase()
    const pathname = new URL(url).pathname.toLowerCase()
    const isPng = contentType.includes('png') || pathname.endsWith('.png')
    const isJpeg =
      contentType.includes('jpeg') || pathname.endsWith('.jpg') || pathname.endsWith('.jpeg')

    return toThumbnailDataUri(buffer, { isPng, isJpeg })
  } catch (error) {
    console.error('[pdf-image] failed to fetch remote image:', url, error)
    return null
  }
}

// Resolves a product's image for @react-pdf/renderer's <Image src=... />.
// Callers must resolve every item's image before rendering (PDF documents
// render synchronously), see resolveOrderImages below.
export async function resolveProductImageSrc(imageUrl: string): Promise<string | null> {
  if (cache.has(imageUrl)) return cache.get(imageUrl) ?? null

  const result = /^https?:\/\//.test(imageUrl)
    ? await fetchRemoteImageAsDataUri(imageUrl)
    : await readPublicImageAsDataUri(imageUrl)

  cache.set(imageUrl, result)
  return result
}

// Resolves every distinct image URL across a set of order items in
// parallel, once, into a lookup the PDF components read synchronously
// during render — must be called (and awaited) before renderToBuffer.
export async function resolveOrderImages(
  items: { imageUrl: string }[]
): Promise<Record<string, string | null>> {
  const uniqueUrls = [...new Set(items.map((item) => item.imageUrl))]
  const entries = await Promise.all(
    uniqueUrls.map(async (url) => [url, await resolveProductImageSrc(url)] as const)
  )
  return Object.fromEntries(entries)
}
