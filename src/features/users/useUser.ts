import { useQuery } from '@tanstack/react-query'
import { getUser } from './api'

/** Загрузка одного пользователя по id (для карточки). */
export function useUser(id: string | undefined) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => getUser(id as string),
    enabled: Boolean(id),
  })
}
