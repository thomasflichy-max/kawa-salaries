import type { Locale } from './i18n/locale'

export const PRODUCT_CATEGORIES = [
  { key: 'cafe', slug: 'cafes', label: 'Cafés', labelEn: 'Coffee' },
  { key: 'the', slug: 'thes', label: 'Thés', labelEn: 'Tea' },
  { key: 'entretien', slug: 'entretien', label: "Produits d'entretien", labelEn: 'Maintenance products' },
  { key: 'machine', slug: 'machines', label: 'Machines reconditionnées', labelEn: 'Refurbished machines' },
] as const

// Admin (French-only) keeps using `.label` directly — this helper is only
// for the employee-facing pages, which need the English label too.
export function categoryLabel(
  category: { label: string; labelEn: string },
  locale: Locale
) {
  return locale === 'en' ? category.labelEn : category.label
}
