import type { TaskStatus } from '@/types'
import type { AgendaTask } from './api'

/** Три состояния чекбокса задачи в повестке. */
export type CheckState = 'empty' | 'submitted' | 'done'

/**
 * Статус задачи → состояние чекбокса:
 *   • done            → зелёная галочка (принято админом);
 *   • submitted       → жёлтая галочка (резидент сдал, ждёт проверки);
 *   • всё остальное   → пустой (не сделано / на доработке).
 */
export function checkState(status: TaskStatus): CheckState {
  if (status === 'done') return 'done'
  if (status === 'submitted') return 'submitted'
  return 'empty'
}

/** Фильтр списка повестки. */
export type AgendaFilter = 'all' | 'submitted' | 'done' | 'todo'

export function matchesFilter(status: TaskStatus, filter: AgendaFilter): boolean {
  if (filter === 'all') return true
  const s = checkState(status)
  if (filter === 'submitted') return s === 'submitted'
  if (filter === 'done') return s === 'done'
  return s === 'empty' // todo (не сдано / на доработке)
}

/** Сводка по дню: всего, на проверке (жёлтые), готово (зелёные), не сделано. */
export function agendaCounts(rows: AgendaTask[]): {
  total: number
  submitted: number
  done: number
  todo: number
} {
  let submitted = 0
  let done = 0
  for (const r of rows) {
    const s = checkState(r.status)
    if (s === 'submitted') submitted++
    else if (s === 'done') done++
  }
  return { total: rows.length, submitted, done, todo: rows.length - submitted - done }
}

/** Группа лида: имя/фото + его задачи за день. */
export type LeadGroup = {
  userId: string
  name: string | null
  photo: string | null
  tasks: AgendaTask[]
}

/** Группируем задачи дня по лиду; группы — по алфавиту имени. */
export function groupByLead(rows: AgendaTask[]): LeadGroup[] {
  const map = new Map<string, LeadGroup>()
  for (const r of rows) {
    let g = map.get(r.user_id)
    if (!g) {
      g = { userId: r.user_id, name: r.lead_name, photo: r.lead_photo, tasks: [] }
      map.set(r.user_id, g)
    }
    g.tasks.push(r)
  }
  return [...map.values()].sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
}

/** Сдвиг даты 'YYYY-MM-DD' на N дней (в локальной зоне). */
export function shiftDay(day: string, delta: number): string {
  const [y, m, d] = day.split('-').map(Number)
  const dt = new Date(y, m - 1, d + delta)
  const mm = String(dt.getMonth() + 1).padStart(2, '0')
  const dd = String(dt.getDate()).padStart(2, '0')
  return `${dt.getFullYear()}-${mm}-${dd}`
}
