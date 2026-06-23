import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { listUsers } from './api'
import type { UsersQuery } from './types'

/** Хук списка пользователей. keepPreviousData — плавная пагинация без «мигания». */
export function useUsers(query: UsersQuery) {
  return useQuery({
    queryKey: ['users', query],
    queryFn: () => listUsers(query),
    placeholderData: keepPreviousData,
  })
}
