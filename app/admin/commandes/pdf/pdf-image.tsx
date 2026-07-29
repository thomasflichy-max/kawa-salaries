import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'

const cache = new Map<string, string | null>()

// Reads an image from /public and returns it as a data URI so @react-pdf/
// renderer can embed it without a network fetch — same approach as the KAWA
// logo in pdf-header.tsx. Node-only; never imported by client components.
function readPublicImageAsDataUri(publicPath: string): string | null {
  try {
    const filePath = path.join(process.cwd(), 'public', publicPath)
    const ext = path.extname(filePath).slice(1).toLowerCase()
    const mime = ext === 'jpg' ? 'jpeg' : ext
    const base64 = fs.readFileSync(filePath).toString('base64')
    return `data:image/${mime};base64,${base64}`
  } catch {
    return null
  }
}

// Fetches a remote product image and normalizes it to PNG via sharp before
// embedding — @react-pdf/renderer's internal image decoder only understands
// JPEG/PNG. Supabase Storage happily serves whatever format was uploaded
// (confirmed: a real product's image is .avif), which silently failed to
// render on the facture/BL PDFs even after pointing <Image> straight at the
// URL, since fetching isn't the part that was broken — decoding was.
async function fetchRemoteImageAsDataUri(url: string): Promise<string | null> {
  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const buffer = Buffer.from(await res.arrayBuffer())
    const png = await sharp(buffer).png().toBuffer()
    return `data:image/png;base64,${png.toString('base64')}`
  } catch (error) {
    console.error('[pdf-image] failed to fetch/convert remote image:', url, error)
    return null
  }
}

// Resolves a product's image for @react-pdf/renderer's <Image src=... />.
// Products can have either a local /public path (older catalog entries,
// bundled at build time — e.g. "/products/cafes/x.jpg") or a full remote
// Supabase Storage URL (see supabase/migrations/0016_product_images_storage.sql).
// Async because the remote path needs a network fetch + format conversion —
// callers must resolve every item's image before rendering (PDF documents
// render synchronously), see resolveOrderImages below.
export async function resolveProductImageSrc(imageUrl: string): Promise<string | null> {
  if (cache.has(imageUrl)) return cache.get(imageUrl) ?? null

  const result = /^https?:\/\//.test(imageUrl)
    ? await fetchRemoteImageAsDataUri(imageUrl)
    : readPublicImageAsDataUri(imageUrl)

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
