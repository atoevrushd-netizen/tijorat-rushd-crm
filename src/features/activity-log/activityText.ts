import type { ActivityEvent, TaskStatus } from '@/types'
import { TASK_STATUS_LABEL } from '@/features/tasks/taskStatus'

function statusLabel(value: unknown): string {
  if (typeof value === 'string' && value in TASK_STATUS_LABEL) {
    return TASK_STATUS_LABEL[value as TaskStatus]
  }
  return String(value ?? '—')
}

/** Человекочитаемый текст события истории. */
export function activityText(event: ActivityEvent): string {
  const details = event.details ?? {}
  const title = typeof details.title === 'string' ? details.title : ''

  if (event.entity_type === 'task') {
    if (event.action === 'created') {
      return `Создана задача «${title}»`
    }
    if (event.action === 'status_changed') {
      return `Статус задачи «${title}»: ${statusLabel(details.from)} → ${statusLabel(details.to)}`
    }
  }
  return `${event.entity_type}: ${event.action}`
}
