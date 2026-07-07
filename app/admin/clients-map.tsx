'use client'

import { useState } from 'react'
import type { DemoClientPin } from './demo-data'

// Lightweight custom scatter — not a real map provider. Positions pins by
// normalizing lat/lng within a fixed Nantes-area bounding box. Swap for a
// real tile-based map once client addresses are geocoded.
const BOUNDS = { latMin: 47.205, latMax: 47.23, lngMin: -1.57, lngMax: -1.54 }

function toPercent(pin: DemoClientPin) {
  const x = ((pin.lng - BOUNDS.lngMin) / (BOUNDS.lngMax - BOUNDS.lngMin)) * 100
  const y = (1 - (pin.lat - BOUNDS.latMin) / (BOUNDS.latMax - BOUNDS.latMin)) * 100
  return { x: Math.min(96, Math.max(4, x)), y: Math.min(92, Math.max(8, y)) }
}

export function ClientsMap({ pins }: { pins: DemoClientPin[] }) {
  const [active, setActive] = useState<number | null>(null)

  return (
    <div
      className="relative w-full h-72 rounded-xl overflow-hidden border border-kawa-200"
      style={{
        backgroundColor: '#eaf2ee',
        backgroundImage:
          'linear-gradient(#dbe8e1 1px, transparent 1px), linear-gradient(90deg, #dbe8e1 1px, transparent 1px)',
        backgroundSize: '28px 28px',
      }}
    >
      {pins.map((pin, i) => {
        const { x, y } = toPercent(pin)
        return (
          <button
            key={pin.organizationName}
            onClick={() => setActive(active === i ? null : i)}
            className="absolute -translate-x-1/2 -translate-y-full group"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <div className="w-4 h-4 rounded-full bg-sky-500 border-2 border-white shadow-sm group-hover:scale-110 transition" />
            {active === i && (
              <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-white border border-kawa-200 rounded-lg px-3 py-2 text-xs shadow-md whitespace-nowrap z-10">
                <p className="font-semibold text-kawa-800">{pin.organizationName}</p>
                <p className="text-kawa-500">{pin.address}</p>
              </div>
            )}
          </button>
        )
      })}
      {pins.length === 0 && (
        <p className="absolute inset-0 flex items-center justify-center text-sm text-kawa-400">
          Aucune adresse cliente à afficher.
        </p>
      )}
    </div>
  )
}
