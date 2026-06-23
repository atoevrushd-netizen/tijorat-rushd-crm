import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createUser, type CreateUserInput } from './api'

/** Мутация создания пользователя. После успеха обновляет список. */
export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateUserInput) => createUser(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['users'] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })
}
