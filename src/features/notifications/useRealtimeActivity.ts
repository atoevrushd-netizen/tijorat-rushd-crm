import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

/**
 * Подписка на вставки в activity_log через Supabase Realtime.
 * При новом событии инвалидируем ленты уведомлений и истории — они обновляются
 * мгновенно, без ожидания опроса. RLS фильтрует события на стороне сервера:
 * лид получает только свою карточку, админ — все.
 *
 * Опрос в useNotifications остаётся страховкой на случай обрыва сокета.
 */
export function useRealtimeActivity(enabled: boolean): void {
  const qc = useQueryClient()

  useEffect(() => {
    if (!enabled) return
    const channel = supabase
      .channel('activity_log_stream')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'activity_log' },
        () => {
          qc.invalidateQueries({ queryKey: ['notifications'] })
          qc.invalidateQueries({ queryKey: ['activity'] })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [enabled, qc])
}
