'use client'

import { useState, type ReactNode } from 'react'
import Image from 'next/image'

// Clicking the image toggles between the main and hover photo — it never
// navigates, on any device (no CSS :hover reliance, which never fires on
// touch anyway). Only the title/description link to the product page (see
// product-grid.tsx and the product detail page).
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

  return (
    <div
      className={`relative ${className} ${hoverImageUrl ? 'cursor-pointer' : ''}`}
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
            revealed ? 'opacity-0' : 'opacity-100'
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
            revealed ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
      {children}
    </div>
  )
}
