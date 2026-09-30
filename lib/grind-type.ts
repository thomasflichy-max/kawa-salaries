import type { Locale } from './i18n/locale'

// Shared across every LIVE grind-type picker/display (cart, subscriptions,
// the add-to-cart form, the coffee wizard). checkout.ts keeps its own
// French-only copy deliberately — grind_type there is snapshotted into
// order_items at purchase time and must never change after the fact,
// same reasoning as invoices staying French regardless of site language.
export const GRIND_OPTIONS = [
  { value: 'grain', label: 'En grains', labelEn: 'Whole beans' },
  { value: 'filtre', label: 'Moulu filtre', labelEn: 'Ground - filter' },
  { value: 'espresso', label: 'Moulu espresso', labelEn: 'Ground - espresso' },
] as const

export function grindLabel(value: string | null | undefined, locale: Locale) {
  const option = GRIND_OPTIONS.find((o) => o.value === value)
  if (!option) return value ?? ''
  return locale === 'en' ? option.labelEn : option.label
}
