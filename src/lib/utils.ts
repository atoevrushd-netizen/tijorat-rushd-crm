/** Объединяет CSS-классы, отбрасывая пустые/ложные значения. */
export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(' ')
}

/** Формат даты для интерфейса: ДД.ММ.ГГГГ (или «—», если даты нет). */
export function formatDate(value: string | null | undefined): string {
  if (!value) return '—'
  // Чистые даты 'YYYY-MM-DD' парсим в локальной зоне, иначе сдвиг на день западнее UTC.
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? new Date(`${value}T00:00:00`)
    : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

/** Дата и время: ДД.ММ.ГГГГ ЧЧ:ММ (для ленты истории). */
export function formatDateTime(value: string | null | undefined): string {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
