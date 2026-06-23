import type { TaskStatus } from '@/types'

/** Подписи статусов задач (для интерфейса). */
export const TASK_STATUS_LABEL: Record<TaskStatus, string> = {
  not_started: 'Не начато',
  in_progress: 'В работе',
  done: 'Готово',
  sent_to_user: 'Отправлено пользователю',
  accepted_by_user: 'Принято пользователем',
  needs_revision: 'Требуется правка',
}

/** Статусы, которые администратор выставляет вручную.
 *  accepted_by_user / needs_revision выставляет пользователь (через respond_to_task). */
export const ADMIN_STATUS_OPTIONS: TaskStatus[] = [
  'not_started',
  'in_progress',
  'done',
  'sent_to_user',
]
