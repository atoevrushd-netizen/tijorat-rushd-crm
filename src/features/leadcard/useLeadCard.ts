import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getLeadCard, upsertLeadCard, type LeadCardPatch } from './api'

export function useLeadCard(userId: string) {
  return useQuery({
    queryKey: ['leadcard', userId],
    queryFn: () => getLeadCard(userId),
    // Не долбить, если таблицы ещё нет (до применения миграции 0030).
    retry: false,
    staleTime: 30_000,
  })
}

export function useUpsertLeadCard(userId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (patch: LeadCardPatch) => upsertLeadCard(userId, patch),
    onSuccess: () => void qc.invalidateQueries({ queryKey: ['leadcard', userId] }),
  })
}
