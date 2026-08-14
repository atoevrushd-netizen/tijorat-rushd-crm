import { supabase } from '@/lib/supabase'
import type { AppSettings } from '@/types'

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
  patch: Partial<Pick<AppSettings, 'auto_tasks_enabled'>>,
): Promise<void> {
  const { error } = await supabase
    .from('app_settings')
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq('id', 1)
  if (error) throw error
}
