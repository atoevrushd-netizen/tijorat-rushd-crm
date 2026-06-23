import { useQuery } from '@tanstack/react-query'
import { listActivity } from './api'

export function useActivity(userId: string) {
  return useQuery({
    queryKey: ['activity', userId],
    queryFn: () => listActivity(userId),
  })
}
