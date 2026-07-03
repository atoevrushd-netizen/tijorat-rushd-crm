import type { ActivityEvent } from '@/types'

/** Функция перевода из useT (ключ, необязательный fallback). */
type Translate = (key: string, fallback?: string) => string

function statusLabel(t: Translate, value: unknown): string {
  const fallback = String(value ?? '—')
  if (typeof value === 'string') {
    return t(`taskStatus.${value}`, fallback)
  }
  return fallback
}

/** Человекочитаемый текст события истории. */
export function activityText(event: ActivityEvent, t: Translate): string {
  const details = event.details ?? {}
  const title = typeof details.title === 'string' ? details.title : ''

  if (event.entity_type === 'task') {
    if (event.action === 'created') {
      return t('activity.taskCreated').replace('{title}', title)
    }
    if (event.action === 'status_changed') {
      return t('activity.taskStatusChanged')
        .replace('{title}', title)
        .replace('{from}', statusLabel(t, details.from))
        .replace('{to}', statusLabel(t, details.to))
    }
  }
  return `${event.entity_type}: ${event.action}`
}
