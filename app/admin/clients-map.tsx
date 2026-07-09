'use client'

import { useEffect, useRef } from 'react'
import type { Map as LeafletMap } from 'leaflet'
import type { ClientMapPin, MapPinColor } from './demo-data'
import 'leaflet/dist/leaflet.css'

const PIN_COLORS: Record<MapPinColor, string> = {
  blue: '#41b6e6',
  red: '#dc2626',
  orange: '#f59e0b',
}

// OpenStreetMap tiles via Leaflet — free, no API key/account needed, and
// lets us drop a real pin at each client's exact coordinates (unlike a
// Google Maps embed, which can't show custom markers without a paid key).
export function ClientsMap({ pins }: { pins: ClientMapPin[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    let cancelled = false

    import('leaflet').then((L) => {
      if (cancelled || !containerRef.current || mapRef.current) return

      const map = L.map(containerRef.current).setView([47.2184, -1.5536], 13)
      mapRef.current = map

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map)

      for (const pin of pins) {
        const icon =
          pin.kind === 'office'
            ? L.divIcon({
                className: '',
                html: `<div style="width:28px;height:28px;border-radius:9999px;background:${PIN_COLORS[pin.color]};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.45);display:flex;align-items:center;justify-content:center;font-size:15px;line-height:1">⚓️</div>`,
                iconSize: [28, 28],
                iconAnchor: [14, 14],
                popupAnchor: [0, -14],
              })
            : L.divIcon({
                className: '',
                html: `<div style="width:14px;height:14px;border-radius:9999px;background:${PIN_COLORS[pin.color]};border:2px solid white;box-shadow:0 1px 3px rgba(0,0,0,0.4)"></div>`,
                iconSize: [14, 14],
                iconAnchor: [7, 7],
                popupAnchor: [0, -7],
              })

        L.marker([pin.lat, pin.lng], { icon })
          .addTo(map)
          .bindPopup(`<strong>${pin.label}</strong><br/>${pin.address}<br/>${pin.detail}`)
      }
    })

    return () => {
      cancelled = true
      mapRef.current?.remove()
      mapRef.current = null
    }
  }, [pins])

  return (
    <div className="flex flex-col gap-3">
      <div
        ref={containerRef}
        className="w-full h-72 rounded-xl overflow-hidden border border-kawa-200"
      />
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-kawa-500">
        <span className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full inline-block"
            style={{ backgroundColor: PIN_COLORS.blue }}
          />
          Rien en cours
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full inline-block"
            style={{ backgroundColor: PIN_COLORS.red }}
          />
          Livraison en attente chez le client
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-full inline-block"
            style={{ backgroundColor: PIN_COLORS.orange }}
          />
          Retrait en attente au bureau KAWA
        </span>
      </div>
    </div>
  )
}
