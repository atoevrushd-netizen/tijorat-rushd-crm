import {
  BarChart3,
  Database,
  Film,
  Gift,
  GraduationCap,
  Package,
  Palette,
  ScrollText,
  Target,
  Trophy,
  UserCheck,
  Users,
  Utensils,
  type LucideIcon,
} from 'lucide-react'
import type { Task } from '@/types'

/**
 * Помесячная программа (0048, наборы v2 — 0053): фиксированные категории задач месяца.
 * Порядок и подписи — единый источник для вкладки «Календарь» (помесячный вид) и
 * выпадающего списка в инструменте «Назначить задачу». task_type в БД = поле type.
 */
export type TaskCategory = {
  type: string
  ru: string
  tg: string
  icon: LucideIcon
}

export const TASK_CATEGORIES: TaskCategory[] = [
  { type: 'packaging', ru: 'Упаковка и анализ Inst и FB', tg: 'Бастабандӣ ва таҳлили Inst ва FB', icon: Package },
  { type: 'reels', ru: 'Рилс', tg: 'Рилс', icon: Film },
  { type: 'creative', ru: 'Креатив', tg: 'Креатив', icon: Palette },
  { type: 'targeting', ru: 'Настройка таргета ADS', tg: 'Танзими таргети ADS', icon: Target },
  { type: 'lesson', ru: 'Обязательный урок', tg: 'Дарси ҳатмӣ', icon: GraduationCap },
  { type: 'bonus', ru: 'Бонусный урок', tg: 'Дарси иловагӣ', icon: Gift },
  { type: 'mastermind', ru: 'Мастермайнд', tg: 'Мастермайнд', icon: Users },
  { type: 'dinner', ru: 'Бизнес-ужин', tg: 'Хӯроки корӣ', icon: Utensils },
  { type: 'analysis', ru: 'Внутренний анализ бизнеса', tg: 'Таҳлили дохилии тиҷорат', icon: BarChart3 },
  { type: 'football', ru: 'Футбол', tg: 'Футбол', icon: Trophy },
  { type: 'crm', ru: 'Создание CRM', tg: 'Сохтани CRM', icon: Database },
  { type: 'sales_script', ru: 'Создание скриптов продаж', tg: 'Сохтани скриптҳои фурӯш', icon: ScrollText },
  { type: 'curator_training', ru: 'Обучение куратором — скриптов продаж', tg: 'Омӯзиши куратор — скриптҳои фурӯш', icon: UserCheck },
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

/** Ключ месяца задачи: только помесячные (period_month). Старые дневные (null) — вне вида. */
export function taskMonth(task: Task): string | null {
  return task.period_month ? task.period_month.slice(0, 7) + '-01' : null
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

/** Сводка по одному месяцу программы (для визуализации «путь по месяцам»). */
export type MonthSummary = {
  key: string // 'YYYY-MM-01'
  index: number // номер месяца в программе (1-based)
  tasks: Task[]
  done: number
  total: number
  state: 'past' | 'current' | 'future'
  /** Доля прошедших дней месяца (0..1): у прошедших = 1, у будущих = 0. */
  timeProgress: number
  /** Осталось дней в текущем месяце (для остальных — 0). */
  daysLeft: number
}

/** Кол-во дней в месяце по ключу 'YYYY-MM-01'. */
function daysInMonth(key: string): number {
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m, 0).getDate()
}

/**
 * Построить сводки месяцев из задач резидента (по порядку). «Месяц» = календарный
 * месяц с задачами; прогресс времени заполняется по дням, длина месяца — в днях.
 */
export function buildMonthSummaries(tasks: Task[], today: Date): MonthSummary[] {
  const groups = groupByMonth(tasks)
  const curKey = monthStart(today)
  return Object.keys(groups)
    .sort()
    .map((key, i) => {
      const items = groups[key]
      const state: MonthSummary['state'] = key === curKey ? 'current' : key < curKey ? 'past' : 'future'
      const dim = daysInMonth(key)
      const day = today.getDate()
      return {
        key,
        index: i + 1,
        tasks: items,
        done: items.filter(isTaskDone).length,
        total: items.length,
        state,
        timeProgress: state === 'past' ? 1 : state === 'future' ? 0 : Math.min(1, day / dim),
        daysLeft: state === 'current' ? Math.max(0, dim - day) : 0,
      }
    })
}
