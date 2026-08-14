import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AppSettings } from '@/types'
import { getSettings, updateSettings } from './api'

export function useSettings() {
  return useQuery({
    queryKey: ['autotasks', 'settings'],
    queryFn: getSettings,
    staleTime: 5 * 60_000,
  })
}

export function useUpdateSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (patch: Partial<Pick<AppSettings, 'auto_tasks_enabled'>>) =>
      updateSettings(patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['autotasks', 'settings'] }),
  })
}
