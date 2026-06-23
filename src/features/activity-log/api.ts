import { supabase } from '@/lib/supabase'
import type { ActivityEvent } from '@/types'

/** История действий по пользователю (последние 50), с именем «кто». */
export async function listActivity(userId: string): Promise<ActivityEvent[]> {
  const { data, error } = await supabase
    .from('activity_log')
    .select('*, actor:actor_id(full_name)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)
  if (error) throw error
  return (data ?? []) as ActivityEvent[]
}
