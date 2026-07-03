import { supabase } from '@/lib/supabase'
import type { Tab } from '@/types'

/** Активные вкладки карточки/кабинета (Медиа/Календарь). */
export async function listActiveTabs(): Promise<Tab[]> {
  const { data, error } = await supabase
    .from('tabs')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
  if (error) throw error
  return (data ?? []) as Tab[]
}
