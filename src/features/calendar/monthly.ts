import { BarChart3, Film, Gift, GraduationCap, Palette, Trophy, Users, Utensils, type LucideIcon } from 'lucide-react'
import type { Task } from '@/types'

/**
 * Помесячная программа (0048): фиксированные категории задач месяца.
 * Порядок и подписи — единый источник для вкладки «Календарь» (помесячный вид).
 */
export type TaskCategory = {
  type: string
  ru: string
  tg: string
  icon: LucideIcon
}

export const TASK_CATEGORIES: TaskCategory[] = [
  { type: 'reels', ru: 'Рилс', tg: 'Рилс', icon: Film },
  { type: 'creative', ru: 'Креатив', tg: 'Креатив', icon: Palette },
  { type: 'bonus', ru: 'Бонусные уроки', tg: 'Дарсҳои иловагӣ', icon: Gift },
  { type: 'lesson', ru: 'Основной урок', tg: 'Дарси асосӣ', icon: GraduationCap },
  { type: 'mastermind', ru: 'Мастермайнд', tg: 'Мастермайнд', icon: Users },
  { type: 'dinner', ru: 'Бизнес-ужины', tg: 'Хӯроки корӣ', icon: Utensils },
  { type: 'analysis', ru: 'Внутренний анализ бизнеса', tg: 'Таҳлили дохилии тиҷорат', icon: BarChart3 },
  { type: 'football', ru: 'Футбол', tg: 'Футбол', icon: Trophy },
]

const CAT_INDEX: Record<string, number> = Object.fromEntries(
  TASK_CATEGORIES.map((c, i) => [c.type, i]),
)

/** Категория задачи по task_type (неизвестные — в конец, отдельной группой «Прочее»). */
export function categoryIndex(task: Task): number {
  const i = CAT_INDEX[task.task_type ?? '']
  return i === undefined ? TASK_CATEGORIES.length : i
}

/** 'YYYY-MM-01' для даты (или строки-даты). Локальная зона. */
export function monthStart(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
}

/** Сдвиг месяца 'YYYY-MM-01' на delta месяцев. */
export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return monthStart(d)
}

/** Ключ месяца задачи: period_month → 'YYYY-MM-01'; иначе из deadline; иначе null. */
export function taskMonth(task: Task): string | null {
  const src = task.period_month ?? task.deadline
  return src ? src.slice(0, 7) + '-01' : null
}

/** Сгруппировать задачи пользователя по месяцу. */
export function groupByMonth(tasks: Task[]): Record<string, Task[]> {
  const map: Record<string, Task[]> = {}
  for (const t of tasks) {
    const key = taskMonth(t)
    if (!key) continue
    ;(map[key] ??= []).push(t)
  }
  return map
}

/** Считается ли задача выполненной (принята админом). */
export function isTaskDone(task: Task): boolean {
  return task.status === 'done' || task.status === 'accepted_by_user'
}
