import { useMutation, useQueryClient } from '@tanstack/react-query'
import { setUserPassword } from './api'

/** Смена пароля админом. После успеха обновляем открытый пароль в карточке. */
export function useSetPassword() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ userId, password }: { userId: string; password: string }) =>
      setUserPassword(userId, password),
    onSuccess: (_data, vars) => {
      void queryClient.invalidateQueries({
        queryKey: ['credentials', vars.userId],
      })
    },
  })
}
