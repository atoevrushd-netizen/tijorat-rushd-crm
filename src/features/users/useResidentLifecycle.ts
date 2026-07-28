import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

/** Включить/деактивировать резидента (RPC set_resident_active, только админ/разработчик). */
async function setResidentActive(leadId: string, active: boolean): Promise<void> {
  const { error } = await supabase.rpc('set_resident_active', { p_lead: leadId, p_active: active })
  if (error) throw error
}

/** (Пере)создать помесячные задачи по периоду подписки (RPC regenerate_monthly_tasks). */
async function regenerateMonthly(leadId: string): Promise<number> {
  const { data, error } = await supabase.rpc('regenerate_monthly_tasks', { p_lead: leadId })
  if (error) throw error
  return (data as number) ?? 0
}

/** Пересоздать набор по ТЕКУЩЕМУ плану: удаляет авто-задачи и создаёт заново (RPC). */
async function rebuildMonthly(leadId: string): Promise<number> {
  const { data, error } = await supabase.rpc('rebuild_monthly_tasks', { p_lead: leadId })
  if (error) throw error
  return (data as number) ?? 0
}

export function useSetResidentActive() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ leadId, active }: { leadId: string; active: boolean }) => setResidentActive(leadId, active),
    onSuccess: (_d, { leadId }) => {
      void qc.invalidateQueries({ queryKey: ['user', leadId] })
      void qc.invalidateQueries({ queryKey: ['users'] })
    },
  })
}

export function useRegenerateMonthly() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (leadId: string) => regenerateMonthly(leadId),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['tasks'] }),
  })
}

export function useRebuildMonthly() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (leadId: string) => rebuildMonthly(leadId),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['tasks'] }),
  })
}
