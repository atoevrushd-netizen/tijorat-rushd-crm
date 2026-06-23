/**
 * Чистые помощники календаря (без React) — легко тестируются.
 * День в системе — строка 'YYYY-MM-DD' (как tasks.deadline в Postgres).
 */

export type DayCell = {
  /** 'YYYY-MM-DD' */
  date: string
  /** число месяца (1..31) */
  day: number
  /** принадлежит отображаемому месяцу (а не «хвостам» соседних) */
  inMonth: boolean
}

/** 'YYYY-MM-DD' в локальной зоне (без сдвига UTC, как toISOString). */
export function ymd(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** 'YYYY-MM-DD' → 'DD.MM.YYYY' для показа. */
export function formatDateShort(date: string): string {
  const [y, m, d] = date.split('-')
  return `${d}.${m}.${y}`
}

/**
 * Матрица месяца: 6 недель по 7 дней, неделя начинается с понедельника.
 * Фикс. 6 строк — стабильная высота сетки независимо от месяца.
 * @param month 0..11
 */
export function buildMonthMatrix(year: number, month: number): DayCell[][] {
  const first = new Date(year, month, 1)
  const offsetFromMonday = (first.getDay() + 6) % 7 // Пн=0 … Вс=6
  const cursor = new Date(year, month, 1 - offsetFromMonday)
  const weeks: DayCell[][] = []
  for (let w = 0; w < 6; w++) {
    const week: DayCell[] = []
    for (let i = 0; i < 7; i++) {
      week.push({
        date: ymd(cursor),
        day: cursor.getDate(),
        inMonth: cursor.getMonth() === month,
      })
      cursor.setDate(cursor.getDate() + 1)
    }
    weeks.push(week)
  }
  return weeks
}

/** Дата 'YYYY-MM-DD' попадает в диапазон [start, end] включительно. */
export function isWithinRange(
  date: string,
  start: string | null,
  end: string | null,
): boolean {
  if (!start || !end) return false
  return date >= start && date <= end
}

/** Сгруппировать задачи по дню (YYYY-MM-DD) их дедлайна. Без дедлайна — пропускаем. */
export function groupTasksByDate<T extends { deadline: string | null }>(
  tasks: T[],
): Record<string, T[]> {
  const map: Record<string, T[]> = {}
  for (const t of tasks) {
    if (!t.deadline) continue
    const key = t.deadline.slice(0, 10)
    ;(map[key] ??= []).push(t)
  }
  return map
}
