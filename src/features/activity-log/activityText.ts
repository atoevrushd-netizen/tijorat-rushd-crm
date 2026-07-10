import type { ActivityEvent } from '@/types'
import type { Lang } from '@/i18n/types'

/** Функция перевода из useT (ключ, необязательный fallback). */
type Translate = (key: string, fallback?: string) => string

function statusLabel(t: Translate, value: unknown): string {
  const fallback = String(value ?? '—')
  if (typeof value === 'string') {
    return t(`taskStatus.${value}`, fallback)
  }
  return fallback
}

/** Человекочитаемый текст события истории (заголовок задачи — по языку). */
export function activityText(
  event: ActivityEvent,
  t: Translate,
  lang: Lang = 'ru',
): string {
  const details = event.details ?? {}
  const localized = lang === 'tg' ? details.title_tg : details.title_ru
  const title =
    typeof localized === 'string' && localized
      ? localized
      : typeof details.title === 'string'
        ? details.title
        : ''

  if (event.entity_type === 'task') {
    if (event.action === 'created') {
      return t('activity.taskCreated').replace('{title}', title)
    }
    if (event.action === 'status_changed') {
      // Понятные формулировки для ключевых переходов рабочего процесса задач.
      if (details.to === 'submitted') {
        return t('activity.taskSubmitted').replace('{title}', title)
      }
      if (details.to === 'done') {
        return t('activity.taskApproved').replace('{title}', title)
      }
      if (details.to === 'needs_revision') {
        return t('activity.taskRejected').replace('{title}', title)
      }
      return t('activity.taskStatusChanged')
        .replace('{title}', title)
        .replace('{from}', statusLabel(t, details.from))
        .replace('{to}', statusLabel(t, details.to))
    }
  }
  return `${event.entity_type}: ${event.action}`
}
