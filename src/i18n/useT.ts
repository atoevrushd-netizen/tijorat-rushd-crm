import { useContext } from 'react'
import { LanguageContext } from './language-context'

/** Доступ к языку и функции перевода. Используется внутри <LanguageProvider>. */
export function useT() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useT должен использоваться внутри <LanguageProvider>')
  }
  return ctx
}
