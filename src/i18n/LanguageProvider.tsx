import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { DEFAULT_LANG, type Lang } from './types'
import { dictionary } from './dictionary'
import { LanguageContext, LANG_STORAGE_KEY } from './language-context'

/** Прочитать сохранённый язык (или язык по умолчанию — таджикский). */
function readInitial(): Lang {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY)
    if (saved === 'tg' || saved === 'ru') return saved
  } catch {
    // localStorage может быть недоступен (приватный режим) — берём язык по умолчанию
  }
  return DEFAULT_LANG
}

/**
 * Провайдер языка интерфейса. Хранит выбор в localStorage,
 * проставляет <html lang> и раздаёт функцию перевода t().
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readInitial)

  useEffect(() => {
    document.documentElement.lang = lang
    try {
      localStorage.setItem(LANG_STORAGE_KEY, lang)
    } catch {
      // сохранять некуда — просто держим язык в памяти на время сессии
    }
  }, [lang])

  const setLang = useCallback((next: Lang) => setLangState(next), [])
  const toggle = useCallback(
    () => setLangState((prev) => (prev === 'tg' ? 'ru' : 'tg')),
    [],
  )
  const t = useCallback(
    (key: string, fallback?: string) =>
      dictionary[lang][key] ?? dictionary.ru[key] ?? fallback ?? key,
    [lang],
  )

  const value = useMemo(
    () => ({ lang, setLang, toggle, t }),
    [lang, setLang, toggle, t],
  )

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  )
}
