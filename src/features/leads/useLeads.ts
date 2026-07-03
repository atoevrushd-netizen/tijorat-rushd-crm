import { useQuery } from '@tanstack/react-query'
import { listLeads } from './api'

/** Все лиды для раздела «Лиды» (воронка + список). */
export function useLeads() {
  return useQuery({
    queryKey: ['leads'],
    queryFn: listLeads,
    staleTime: 30_000,
  })
}
