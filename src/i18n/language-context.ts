import { createContext } from 'react'
import type { Lang } from './types'

export type LanguageContextValue = {
  lang: Lang
  /** Явно выбрать язык. */
  setLang: (lang: Lang) => void
  /** Переключить на «другой» язык (для кнопки-тумблера). */
  toggle: () => void
  /** Перевод по ключу. Если ключа нет — fallback → русский → сам ключ. */
  t: (key: string, fallback?: string) => string
}

export const LanguageContext = createContext<LanguageContextValue | null>(null)

/** Ключ хранения выбранного языка в localStorage. */
export const LANG_STORAGE_KEY = 'tijorat.lang'
