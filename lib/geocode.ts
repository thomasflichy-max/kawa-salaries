// Geocodes a postal address via Nominatim (OpenStreetMap) — free, no API key.
// Usage policy requires a descriptive User-Agent and caps at 1 req/sec, so
// callers must geocode addresses one at a time (never in parallel) and cache
// the result (see organization_addresses.lat/lng) instead of re-geocoding on
// every read.
export async function geocodeAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('q', address)
  url.searchParams.set('format', 'json')
  url.searchParams.set('limit', '1')

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'kawa-salaries-admin (contact: thomas.flichy@kawa.coffee)' },
    })
    if (!response.ok) {
      console.error('[geocodeAddress] Nominatim returned', response.status, 'for:', address)
      return null
    }

    const results = (await response.json()) as { lat: string; lon: string }[]
    const first = results[0]
    if (!first) return null

    return { lat: Number(first.lat), lng: Number(first.lon) }
  } catch (error) {
    console.error('[geocodeAddress] failed:', error)
    return null
  }
}
