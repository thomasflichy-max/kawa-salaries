import { fr } from './dictionaries/fr'
import { en } from './dictionaries/en'
import type { Locale } from './locale'

export type Dictionary = typeof fr

export function getDictionary(locale: Locale): Dictionary {
  return locale === 'en' ? en : fr
}
