import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { listUsers, restoreUser, softDeleteUser } from './api'
import type { UsersQuery } from './types'

/** Хук списка пользователей. keepPreviousData — плавная пагинация без «мигания». */
export function useUsers(query: UsersQuery) {
  return useQuery({
    queryKey: ['users', query],
    queryFn: () => listUsers(query),
    placeholderData: keepPreviousData,
  })
}

function useUsersInvalidator() {
  const queryClient = useQueryClient()
  return () => {
    void queryClient.invalidateQueries({ queryKey: ['users'] })
    void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
  }
}

/** Мягкое удаление лида (в «Корзину»). */
export function useSoftDeleteUser() {
  const invalidate = useUsersInvalidator()
  return useMutation({
    mutationFn: softDeleteUser,
    onSuccess: () => invalidate(),
  })
}

/** Восстановление лида из «Корзины». */
export function useRestoreUser() {
  const invalidate = useUsersInvalidator()
  return useMutation({
    mutationFn: restoreUser,
    onSuccess: () => invalidate(),
  })
}
