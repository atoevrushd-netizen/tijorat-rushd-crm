import type { TaskStatus } from '@/types'

export type DeadlineState = 'overdue' | 'soon' | 'ok'

/** Завершённые задачи не «горят». */
const DONE: TaskStatus[] = ['done', 'accepted_by_user']

/**
 * Состояние дедлайна незавершённой задачи:
 *  'overdue' — просрочен, 'soon' — горит (в ближайшие soonDays), 'ok' — есть время.
 * null — дедлайна нет или задача уже завершена.
 */
/** Сколько дней до дедлайна: 0 — сегодня, <0 — просрочен. null — дедлайна нет. */
export function daysUntil(deadline: string | null): number | null {
  if (!deadline) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(deadline + 'T00:00:00')
  return Math.round((d.getTime() - today.getTime()) / 86_400_000)
}

export function deadlineState(
  deadline: string | null,
  status: TaskStatus,
  soonDays = 3,
): DeadlineState | null {
  if (DONE.includes(status)) return null
  const diffDays = daysUntil(deadline)
  if (diffDays === null) return null
  if (diffDays < 0) return 'overdue'
  if (diffDays <= soonDays) return 'soon'
  return 'ok'
}
