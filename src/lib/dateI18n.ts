import type { Lang } from '@/i18n/types'

// Названия на таджикском (браузерная локаль 'tg' ненадёжна — задаём вручную).
const TG_MONTHS = [
  'Январ', 'Феврал', 'Март', 'Апрел', 'Май', 'Июн',
  'Июл', 'Август', 'Сентябр', 'Октябр', 'Ноябр', 'Декабр',
]
const TG_WEEKDAYS_FULL = [
  'душанбе', 'сешанбе', 'чоршанбе', 'панҷшанбе', 'ҷумъа', 'шанбе', 'якшанбе',
]

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
