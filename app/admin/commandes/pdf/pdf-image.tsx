import fs from 'node:fs'
import path from 'node:path'

const cache = new Map<string, string | null>()

// Reads an image from /public and returns it as a data URI so @react-pdf/
// renderer can embed it without a network fetch — same approach as the KAWA
// logo in pdf-header.tsx. Node-only; never imported by client components.
function readPublicImageAsDataUri(publicPath: string): string | null {
  if (cache.has(publicPath)) return cache.get(publicPath) ?? null

  try {
    const filePath = path.join(process.cwd(), 'public', publicPath)
    const ext = path.extname(filePath).slice(1).toLowerCase()
    const mime = ext === 'jpg' ? 'jpeg' : ext
    const base64 = fs.readFileSync(filePath).toString('base64')
    const dataUri = `data:image/${mime};base64,${base64}`
    cache.set(publicPath, dataUri)
    return dataUri
  } catch {
    cache.set(publicPath, null)
    return null
  }
}

// Resolves a product's image for @react-pdf/renderer's <Image src=... />.
// Products can have either a local /public path (older catalog entries,
// bundled at build time — e.g. "/products/cafes/x.jpg") or a full remote
// URL (Supabase Storage, see supabase/migrations/0016_product_images_storage.sql).
// readPublicImageAsDataUri only ever looked on the local filesystem, so any
// item with a Storage-hosted image silently rendered with no picture at all
// on the facture/BL PDFs (fs.readFileSync just threw and was swallowed).
// @react-pdf/renderer's Image component accepts a plain http(s) URL string
// directly and fetches it itself during rendering — no manual data-URI
// conversion needed for that case, only for local paths.
export function resolveProductImageSrc(imageUrl: string): string | null {
  if (/^https?:\/\//.test(imageUrl)) {
    return imageUrl
  }
  return readPublicImageAsDataUri(imageUrl)
}
