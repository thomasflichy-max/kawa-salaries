import fs from 'node:fs'
import path from 'node:path'

const cache = new Map<string, string | null>()

// Reads an image from /public and returns it as a data URI so @react-pdf/
// renderer can embed it without a network fetch — same approach as the KAWA
// logo in pdf-header.tsx. Node-only; never imported by client components.
export function readPublicImageAsDataUri(publicPath: string): string | null {
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
