import { useQuery } from '@tanstack/react-query'
import { listActiveTabs } from './api'

// Вкладки меняются редко — держим свежими 5 минут.
export function useActiveTabs() {
  return useQuery({
    queryKey: ['tabs', 'active'],
    queryFn: listActiveTabs,
    staleTime: 5 * 60_000,
  })
}
