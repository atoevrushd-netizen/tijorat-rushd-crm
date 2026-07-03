import { supabase } from '@/lib/supabase'
import type { Task, TaskStatus } from '@/types'

/** Задачи пользователя (с подгруженными ссылками) для вкладки. */
export async function listTasks(userId: string, tabId?: string): Promise<Task[]> {
  let query = supabase
    .from('tasks')
    .select('*, task_links(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
  if (tabId) query = query.eq('tab_id', tabId)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as Task[]
}

export type CreateTaskInput = {
  user_id: string
  tab_id: string | null
  title: string
  task_type?: string
  deadline?: string
  due_time?: string
  admin_comment?: string
  created_by?: string | null
}

/** Собрать строку для вставки в tasks из входа (единый маппинг для одиночной и пакетной вставки). */
function toTaskRow(input: CreateTaskInput) {
  return {
    user_id: input.user_id,
    tab_id: input.tab_id,
    title: input.title,
    task_type: input.task_type || null,
    deadline: input.deadline || null,
    due_time: input.due_time || null,
    admin_comment: input.admin_comment || null,
    created_by: input.created_by ?? null,
  }
}

export async function createTask(input: CreateTaskInput): Promise<void> {
  const { error } = await supabase.from('tasks').insert(toTaskRow(input))
  if (error) throw error
}

/** Пакетное создание задач одним запросом (например, «30 Reels» сразу). */
export async function createTasks(inputs: CreateTaskInput[]): Promise<void> {
  if (inputs.length === 0) return
  const { error } = await supabase.from('tasks').insert(inputs.map(toTaskRow))
  if (error) throw error
}

/** Сменить статус задачи (админ). sent_at/accepted_at проставит триггер. */
export async function setTaskStatus(id: string, status: TaskStatus): Promise<void> {
  const { error } = await supabase.from('tasks').update({ status }).eq('id', id)
  if (error) throw error
}

export type UpdateTaskInput = {
  title?: string
  task_type?: string | null
  deadline?: string | null
  due_time?: string | null
  admin_comment?: string | null
  status?: TaskStatus
}

/** Редактировать задачу (по RLS — только админ). */
export async function updateTask(id: string, patch: UpdateTaskInput): Promise<void> {
  const { error } = await supabase.from('tasks').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw error
}

export async function addTaskLink(
  taskId: string,
  url: string,
  label?: string,
): Promise<void> {
  const { error } = await supabase
    .from('task_links')
    .insert({ task_id: taskId, url, label: label || null })
  if (error) throw error
}

export async function deleteTaskLink(id: string): Promise<void> {
  const { error } = await supabase.from('task_links').delete().eq('id', id)
  if (error) throw error
}

/** Пользователь принимает (accept=true) или возвращает на правку свою задачу. */
export async function respondToTask(
  taskId: string,
  accept: boolean,
  comment?: string,
): Promise<void> {
  const { error } = await supabase.rpc('respond_to_task', {
    p_task_id: taskId,
    p_accept: accept,
    p_comment: comment ?? null,
  })
  if (error) throw error
}
