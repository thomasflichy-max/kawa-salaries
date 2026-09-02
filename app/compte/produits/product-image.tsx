'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'

// Desktop already gets the swap via CSS group-hover (see product-grid.tsx's
// `group` class on the card) — nothing to do there. Touch devices have no
// hover state at all, so :hover never fires; the fix is to intercept the
// first tap on touch devices only (matchMedia('(hover: none)'), the correct
// way to detect "this input can't hover", rather than guessing from touch
// support alone) and reveal the alternate photo instead of navigating. A
// second tap (or tapping the name/button below the image) continues on to
// the product page as normal.
export function ProductImage({
  imageUrl,
  hoverImageUrl,
  name,
}: {
  imageUrl: string | null
  hoverImageUrl: string | null
  name: string
}) {
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    setIsTouchDevice(window.matchMedia('(hover: none)').matches)
  }, [])

  return (
    <div
      className="relative aspect-[4/3] bg-white"
      onClick={(e) => {
        if (isTouchDevice && hoverImageUrl && !revealed) {
          e.preventDefault()
          e.stopPropagation()
          setRevealed(true)
        }
      }}
    >
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="(min-width:1024px) 22vw, 50vw"
          className={`object-contain transition-opacity duration-500 ${
            hoverImageUrl ? `group-hover:opacity-0 ${revealed ? 'opacity-0' : ''}` : ''
          }`}
        />
      )}
      {hoverImageUrl && (
        <Image
          src={hoverImageUrl}
          alt={name}
          fill
          sizes="(min-width:1024px) 22vw, 50vw"
          className={`object-contain transition-opacity duration-500 group-hover:opacity-100 ${
            revealed ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  )
}
