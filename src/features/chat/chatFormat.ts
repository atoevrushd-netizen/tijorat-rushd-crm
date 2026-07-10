/** Время сообщения ЧЧ:ММ. */
export function timeHM(iso: string): string {
  const d = new Date(iso)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

/** Ключ дня YYYY-MM-DD (для разделителей по датам). */
export function dayKey(iso: string): string {
  return iso.slice(0, 10)
}

/** Короткое «время назад» для списка диалогов (иначе — дата). */
export function shortWhen(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const now = new Date()
  if (dayKey(iso) === dayKey(now.toISOString())) return timeHM(iso)
  const y = new Date(now)
  y.setDate(now.getDate() - 1)
  if (dayKey(iso) === dayKey(y.toISOString())) return '—'
  return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}`
}
