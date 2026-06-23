/**
 * Доменные типы строк БД (форма таблиц Supabase).
 * Источник истины по данным — docs/04-data-model.md.
 * Эти типы переиспользуются всеми фичами.
 */

/** Роль пользователя в системе. */
export type UserRole = 'admin' | 'user'

/** Статус пользователя. */
export type UserStatus = 'active' | 'paused' | 'archived'

/** Профиль пользователя (таблица public.profiles). */
export type Profile = {
  id: string
  full_name: string | null
  phone: string | null
  email: string | null
  photo_url: string | null
  role: UserRole
  status: UserStatus
  business_direction: string | null
  login: string | null
  admin_comment: string | null
  /** Период сотрудничества (подписки) лида — задаёт админ. */
  subscription_start: string | null
  subscription_end: string | null
  registration_date: string
  created_at: string
  updated_at: string
}

/** Лид (таблица public.leads). */
export type Lead = {
  id: string
  full_name: string
  phone: string
  source: string | null
  converted_user_id: string | null
  created_at: string
}

/** Вкладка карточки (таблица public.tabs) — гибкая система вкладок. */
export type Tab = {
  id: string
  key: string
  title: string
  icon: string | null
  sort_order: number
  is_active: boolean
  schema: Record<string, unknown> | null
  created_at: string
}

/** Статус задачи (6 состояний по ТЗ). */
export type TaskStatus =
  | 'not_started'
  | 'in_progress'
  | 'done'
  | 'sent_to_user'
  | 'accepted_by_user'
  | 'needs_revision'

/** Ссылка на материал задачи (таблица public.task_links). */
export type TaskLink = {
  id: string
  task_id: string
  url: string
  label: string | null
  created_at: string
}

/** Задача (таблица public.tasks). task_links подгружается join'ом. */
export type Task = {
  id: string
  user_id: string
  tab_id: string | null
  title: string
  task_type: string | null
  status: TaskStatus
  deadline: string | null
  /** Время дня выполнения (для календаря), 'HH:MM:SS' | null. */
  due_time: string | null
  admin_comment: string | null
  user_comment: string | null
  created_by: string | null
  updated_by: string | null
  created_at: string
  sent_at: string | null
  accepted_at: string | null
  updated_at: string
  task_links?: TaskLink[]
}

/** Событие истории действий (таблица public.activity_log). */
export type ActivityEvent = {
  id: string
  user_id: string | null
  actor_id: string | null
  entity_type: string
  entity_id: string | null
  action: string
  details: Record<string, unknown> | null
  created_at: string
  // подгружается join'ом: имя того, кто совершил действие
  actor?: { full_name: string | null } | null
}

/** Достижение пользователя (таблица public.achievements). */
export type Achievement = {
  id: string
  user_id: string
  title: string
  description: string | null
  achieved_at: string | null
  created_by: string | null
  created_at: string
}
