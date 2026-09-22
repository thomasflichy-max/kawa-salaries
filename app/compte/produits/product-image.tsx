'use client'

import { useState, type ReactNode } from 'react'
import Image from 'next/image'

// On a device with a mouse, hovering swaps to the second photo (plain CSS
// group-hover — :hover never fires on touch, so this is a no-op there).
// Clicking still toggles between the two and pins whichever is showing —
// that's the only way to see the second photo on touch, and on desktop it
// lets you "lock" it without holding the pointer in place. The click never
// navigates, on any device — only the title/description link to the
// product page (see product-grid.tsx and the product detail page).
export function ProductImage({
  imageUrl,
  hoverImageUrl,
  name,
  sizes = '(min-width:1024px) 22vw, 50vw',
  className = 'aspect-[4/3] bg-white',
  children,
}: {
  imageUrl: string | null
  hoverImageUrl: string | null
  name: string
  sizes?: string
  className?: string
  children?: ReactNode
}) {
  const [revealed, setRevealed] = useState(false)
  const canSwap = Boolean(hoverImageUrl)

  return (
    <div
      className={`relative group ${className} ${hoverImageUrl ? 'cursor-pointer' : ''}`}
      onClick={
        hoverImageUrl
          ? () => {
              setRevealed((r) => !r)
            }
          : undefined
      }
    >
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes={sizes}
          className={`object-contain transition-opacity duration-500 ${
            revealed ? 'opacity-0' : canSwap ? 'opacity-100 group-hover:opacity-0' : 'opacity-100'
          }`}
        />
      )}
      {hoverImageUrl && (
        <Image
          src={hoverImageUrl}
          alt={name}
          fill
          sizes={sizes}
          className={`object-contain transition-opacity duration-500 ${
            revealed ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        />
      )}
      {children}
    </div>
  )
}
