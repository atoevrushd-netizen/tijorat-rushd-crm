import type { Lang } from '@/i18n/types'

// Названия на таджикском (браузерная локаль 'tg' ненадёжна — задаём вручную).
const TG_MONTHS = [
  'Январ', 'Феврал', 'Март', 'Апрел', 'Май', 'Июн',
  'Июл', 'Август', 'Сентябр', 'Октябр', 'Ноябр', 'Декабр',
]
// Пн..Вс
const TG_WEEKDAYS_SHORT = ['Дш', 'Сш', 'Чш', 'Пш', 'Ҷм', 'Шн', 'Яш']
const TG_WEEKDAYS_FULL = [
  'душанбе', 'сешанбе', 'чоршанбе', 'панҷшанбе', 'ҷумъа', 'шанбе', 'якшанбе',
]
const RU_WEEKDAYS_SHORT = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

/** getDay(): 0=Вс..6=Сб → индекс с понедельника (0=Пн). */
function mondayIndex(d: Date): number {
  return (d.getDay() + 6) % 7
}

/** «Июль 2026 г.» / «Июл 2026». */
export function monthYear(date: Date, lang: Lang): string {
  if (lang === 'tg') return `${TG_MONTHS[date.getMonth()]} ${date.getFullYear()}`
  return new Intl.DateTimeFormat('ru-RU', {
    month: 'long',
    year: 'numeric',
  }).format(date)
}

/** Короткие подписи дней недели (Пн..Вс). */
export function weekdaysShort(lang: Lang): string[] {
  return lang === 'tg' ? TG_WEEKDAYS_SHORT : RU_WEEKDAYS_SHORT
}

/** 'YYYY-MM-DD' → «среда, 29 июля» / «29 Июл, чоршанбе» (порядок задаёт локаль). */
export function dayTitle(dateStr: string, lang: Lang): string {
  const d = new Date(dateStr + 'T00:00:00')
  if (lang === 'tg') {
    return `${d.getDate()} ${TG_MONTHS[d.getMonth()]}, ${TG_WEEKDAYS_FULL[mondayIndex(d)]}`
  }
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    weekday: 'long',
  }).format(d)
}

/**
 * 'YYYY-MM-DD' → раздельно дата и день недели (без опоры на порядок слов в строке:
 * ru-RU выдаёт «среда, 29 июля», tg — «29 Июл, чоршанбе»). Для крупной даты + подписи.
 */
export function dayParts(dateStr: string, lang: Lang): { date: string; weekday: string } {
  const d = new Date(dateStr + 'T00:00:00')
  if (lang === 'tg') {
    return { date: `${d.getDate()} ${TG_MONTHS[d.getMonth()]}`, weekday: TG_WEEKDAYS_FULL[mondayIndex(d)] }
  }
  return {
    date: new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' }).format(d),
    weekday: new Intl.DateTimeFormat('ru-RU', { weekday: 'long' }).format(d),
  }
}

/** «вторник, 3 июля» (для приветствия на дашборде). */
export function weekdayDayMonth(date: Date, lang: Lang): string {
  if (lang === 'tg') {
    return `${TG_WEEKDAYS_FULL[mondayIndex(date)]}, ${date.getDate()} ${TG_MONTHS[date.getMonth()]}`
  }
  return new Intl.DateTimeFormat('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(date)
}
