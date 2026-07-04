/**
 * Доменные типы строк БД (форма таблиц Supabase).
 * Источник истины по данным — docs/04-data-model.md.
 * Эти типы переиспользуются всеми фичами.
 */

/** Роль пользователя в системе. developer — супер-доступ (наследует права админа). */
export type UserRole = 'admin' | 'user' | 'developer'

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
  /** Мягкое удаление: непусто = лид в «Корзине». */
  deleted_at: string | null
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
  /** Двуязычные заголовки (0029). Отсутствуют до применения миграции — тогда откат на title. */
  title_ru?: string | null
  title_tg?: string | null
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

/** Тип анкеты: A — на входе (до курса), B — после курса. */
export type SurveyType = 'A' | 'B'

/** Вопрос анкеты (таблица public.survey_questions). Тексты двуязычные. */
export type SurveyQuestion = {
  id: string
  section_order: number
  section_key: string
  section_title_ru: string
  section_title_tg: string | null
  question_order: number
  text_ru: string
  text_tg: string | null
  created_at: string
}

/** Ответ лида на вопрос анкеты (таблица public.survey_answers). */
export type SurveyAnswer = {
  id: string
  user_id: string
  survey_type: SurveyType
  question_id: string
  answer: string
  created_at: string
  updated_at: string
}

/** Безопасный список участников для страницы «ответы всех» (view survey_people). */
export type SurveyPerson = {
  id: string
  full_name: string | null
  photo_url: string | null
}

/** Раздел «Разбор» (таблица public.razbor_sections). Контент — двуязычный, read-only для лида. */
export type RazborSection = {
  id: string
  sort_order: number
  title_ru: string
  title_tg: string
  report_ru: string
  report_tg: string
  questions_ru: string
  questions_tg: string
  created_at: string
}

/** Поле ответа в разборе: «Ответы на вопросы» или «Получить задания». */
export type RazborField = 'answers' | 'tasks'

/** Ответ лида в разборе (таблица public.razbor_answers). */
export type RazborAnswer = {
  id: string
  user_id: string
  section_id: string
  field: RazborField
  answer: string
  created_at: string
  updated_at: string
}

/** Группа (версия) автозадач (таблица public.task_template_groups). */
export type TaskTemplateGroup = {
  id: string
  name: string
  created_at: string
}

/** Шаблон автозадачи (таблица public.task_templates). */
export type TaskTemplate = {
  id: string
  group_id: string
  tab_key: string // 'calendar' | 'media'
  title: string
  task_type: string | null // 'other' | 'reels' | 'creative'
  deadline: string | null
  sort_order: number
  created_at: string
}

/** Глобальные настройки приложения (таблица public.app_settings, одна строка id=1). */
export type AppSettings = {
  id: number
  auto_tasks_enabled: boolean
  active_group_id: string | null
  updated_at: string
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
