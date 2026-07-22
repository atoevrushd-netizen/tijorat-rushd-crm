import { supabase } from '@/lib/supabase'
import type { TaskStatus } from '@/types'

/** Задача из «повестки дня» вместе с данными лида-владельца. */
export type AgendaTask = {
  id: string
  title: string
  status: TaskStatus
  deadline: string
  due_time: string | null
  user_id: string
  lead_name: string | null
  lead_photo: string | null
}

/**
 * Все задачи выбранного дня по ВСЕМ резидентам (для админа). Дата = tasks.deadline.
 * Джоин на profiles (только резиденты, не удалённые). RLS: админ видит всё.
 */
export async function listDayAgenda(day: string): Promise<AgendaTask[]> {
  // tasks ссылается на profiles тремя FK (user_id/created_by/updated_by), поэтому
  // embed по имени таблицы неоднозначен (PGRST201). Указываем FK-колонку user_id
  // (как actor:actor_id в других запросах). inner-join даёт фильтр по роли/удалению.
  const { data, error } = await supabase
    .from('tasks')
    .select('id, title, status, deadline, due_time, user_id, resident:user_id!inner(full_name, photo_url, role, deleted_at)')
    .eq('deadline', day)
    .eq('resident.role', 'user')
    .is('resident.deleted_at', null)
    .order('due_time', { ascending: true, nullsFirst: false })
  if (error) throw error

  type Prof = { full_name: string | null; photo_url: string | null }
  type Row = {
    id: string
    title: string
    status: TaskStatus
    deadline: string
    due_time: string | null
    user_id: string
    resident: Prof | Prof[] | null
  }
  return ((data as unknown as Row[]) ?? []).map((r) => {
    const p = Array.isArray(r.resident) ? r.resident[0] : r.resident
    return {
      id: r.id,
      title: r.title,
      status: r.status,
      deadline: r.deadline,
      due_time: r.due_time,
      user_id: r.user_id,
      lead_name: p?.full_name ?? null,
      lead_photo: p?.photo_url ?? null,
    }
  })
}
