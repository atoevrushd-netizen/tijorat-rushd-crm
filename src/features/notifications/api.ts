import { supabase } from '@/lib/supabase'
import type { ActivityEvent } from '@/types'

/** Событие для колокольчика = запись истории + имя «чьей карточки» (для админа). */
export type NotificationEvent = ActivityEvent & {
  subject?: { full_name: string | null } | null
}

/**
 * Лента уведомлений текущего пользователя: последние события истории,
 * которые совершил НЕ он сам (для лида — что сделал админ на его карточке;
 * для админа — что сделали лиды: приняли / вернули задачу).
 * RLS сам ограничивает видимость: лид видит только свою карточку, админ — все.
 */
export async function listNotifications(
  currentUserId: string,
): Promise<NotificationEvent[]> {
  const { data, error } = await supabase
    .from('activity_log')
    .select('*, actor:actor_id(full_name), subject:user_id(full_name)')
    .neq('actor_id', currentUserId)
    .order('created_at', { ascending: false })
    .limit(30)
  if (error) throw error
  return (data ?? []) as NotificationEvent[]
}
