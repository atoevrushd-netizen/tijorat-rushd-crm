import type { Lang } from '@/i18n/types'

/** Объект с двуязычным заголовком (задача или шаблон). */
type Titled = { title: string; title_ru?: string | null; title_tg?: string | null }

/**
 * Заголовок задачи на языке интерфейса. Откат на исходный `title`,
 * если перевод отсутствует (в т.ч. до применения миграции 0029).
 */
export function taskTitle(t: Titled, lang: Lang): string {
  return (lang === 'tg' ? t.title_tg : t.title_ru) || t.title
}
