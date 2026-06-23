import { supabase } from '@/lib/supabase'
import type { Tab } from '@/types'

/** Активные вкладки (для отображения в карточке/кабинете). */
export async function listActiveTabs(): Promise<Tab[]> {
  const { data, error } = await supabase
    .from('tabs')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return (data ?? []) as Tab[]
}

/** Все вкладки (для управления админом). */
export async function listAllTabs(): Promise<Tab[]> {
  const { data, error } = await supabase
    .from('tabs')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) throw error
  return (data ?? []) as Tab[]
}

export async function createTab(input: {
  key: string
  title: string
  sort_order?: number
}): Promise<void> {
  const { error } = await supabase.from('tabs').insert({
    key: input.key,
    title: input.title,
    sort_order: input.sort_order ?? 0,
  })
  if (error) throw error
}

export type TabPatch = Partial<
  Pick<Tab, 'title' | 'is_active' | 'sort_order' | 'icon'>
>

export async function updateTab(id: string, patch: TabPatch): Promise<void> {
  const { error } = await supabase.from('tabs').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteTab(id: string): Promise<void> {
  const { error } = await supabase.from('tabs').delete().eq('id', id)
  if (error) throw error
}
