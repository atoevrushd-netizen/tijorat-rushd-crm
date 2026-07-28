import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { listAllLeads } from '@/features/users/api'

/** Все не удалённые резиденты (деактивированных отсеивает вызывающий) — для мультивыбора. */
export function useAllResidents() {
  return useQuery({
    queryKey: ['residents-all'],
    queryFn: () => listAllLeads('', false),
    staleTime: 30_000,
  })
}

/** id вкладки «Календарь»: помесячный вид фильтрует задачи по tab_id, поэтому
 *  назначаемая задача должна получить именно его (иначе не покажется). */
export function useCalendarTabId() {
  return useQuery({
    queryKey: ['calendar-tab-id'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tabs')
        .select('id')
        .eq('key', 'calendar')
        .maybeSingle()
      if (error) throw error
      return (data?.id as string | undefined) ?? null
    },
    staleTime: 5 * 60_000,
  })
}
