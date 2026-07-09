import { supabase } from '@/lib/supabase'
import type { AppSettings, TaskTemplate, TaskTemplateGroup } from '@/types'

/** Глобальные настройки (одна строка id=1). */
export async function getSettings(): Promise<AppSettings> {
  const { data, error } = await supabase
    .from('app_settings')
    .select('*')
    .eq('id', 1)
    .single()
  if (error) throw error
  return data as AppSettings
}

export async function updateSettings(
  patch: Partial<Pick<AppSettings, 'auto_tasks_enabled' | 'active_group_id'>>,
): Promise<void> {
  const { error } = await supabase
    .from('app_settings')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', 1)
  if (error) throw error
}

/** Группы (версии) автозадач. */
export async function listGroups(): Promise<TaskTemplateGroup[]> {
  const { data, error } = await supabase
    .from('task_template_groups')
    .select('*')
    .order('created_at', { ascending: true })
  if (error) throw error
  return (data ?? []) as TaskTemplateGroup[]
}

export async function createGroup(name: string): Promise<TaskTemplateGroup> {
  const { data, error } = await supabase
    .from('task_template_groups')
    .insert({ name })
    .select()
    .single()
  if (error) throw error
  return data as TaskTemplateGroup
}

export async function deleteGroup(id: string): Promise<void> {
  const { error } = await supabase.from('task_template_groups').delete().eq('id', id)
  if (error) throw error
}

/** Дублировать группу: создать новую и скопировать в неё все задачи исходной. */
export async function duplicateGroup(
  sourceId: string,
  name: string,
): Promise<TaskTemplateGroup> {
  const group = await createGroup(name)
  const items = await listTemplates(sourceId)
  if (items.length) {
    const copies = items.map((t) => ({
      group_id: group.id,
      tab_key: t.tab_key,
      title: t.title,
      task_type: t.task_type,
      offset_days: t.offset_days,
      sort_order: t.sort_order,
    }))
    const { error } = await supabase.from('task_templates').insert(copies)
    if (error) throw error
  }
  return group
}

/** Задачи-шаблоны группы. */
export async function listTemplates(groupId: string): Promise<TaskTemplate[]> {
  const { data, error } = await supabase
    .from('task_templates')
    .select('*')
    .eq('group_id', groupId)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return (data ?? []) as TaskTemplate[]
}

export async function createTemplate(input: {
  group_id: string
  tab_key: string
  title: string
  task_type: string | null
  offset_days: number | null
  sort_order: number
}): Promise<void> {
  const { error } = await supabase.from('task_templates').insert(input)
  if (error) throw error
}

export async function updateTemplate(
  id: string,
  patch: Partial<Pick<TaskTemplate, 'title' | 'tab_key' | 'task_type' | 'offset_days'>>,
): Promise<void> {
  const { error } = await supabase.from('task_templates').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteTemplate(id: string): Promise<void> {
  const { error } = await supabase.from('task_templates').delete().eq('id', id)
  if (error) throw error
}
