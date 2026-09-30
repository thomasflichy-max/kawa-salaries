import { cookies } from 'next/headers'

export type Locale = 'fr' | 'en'

export const LOCALE_COOKIE = 'locale'

// Cookie-based, not URL-based (no /en/ prefix) — a small site with a
// visible switcher, not a multi-market storefront. Defaults to French for
// anyone who hasn't chosen (new visitors, and every existing cookie-less
// browser out there today).
export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  return cookieStore.get(LOCALE_COOKIE)?.value === 'en' ? 'en' : 'fr'
}
