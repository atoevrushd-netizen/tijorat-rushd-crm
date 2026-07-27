import type { Task } from '@/types'

export type TaskCounts = {
  total: number
  accepted: number
  inProgress: number
  needsRevision: number
  notStarted: number
}

/**
 * Сводка по статусам задач. «Выполнено» = done (терминальный статус помесячной
 * модели, чекбокс админа) ИЛИ accepted_by_user (старый флоу принятия резидентом).
 * «В процессе» = в работе / на проверке / отправлено.
 */
export function taskCounts(tasks: Task[]): TaskCounts {
  const counts: TaskCounts = {
    total: tasks.length,
    accepted: 0,
    inProgress: 0,
    needsRevision: 0,
    notStarted: 0,
  }
  for (const task of tasks) {
    if (task.status === 'done' || task.status === 'accepted_by_user') counts.accepted++
    else if (task.status === 'needs_revision') counts.needsRevision++
    else if (task.status === 'not_started') counts.notStarted++
    else counts.inProgress++ // in_progress | submitted | sent_to_user
  }
  return counts
}
