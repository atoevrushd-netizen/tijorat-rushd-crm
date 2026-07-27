import { useMutation, useQueryClient } from '@tanstack/react-query'
import { saveUser } from './api'

/** Мутация сохранения профиля (поля + фото). После успеха обновляет список. */
export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: saveUser,
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['users'] })
      // важно: обновить и карточку пользователя (иначе шапка показывает старые данные)
      void queryClient.invalidateQueries({ queryKey: ['user', variables.id] })
      void queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      // изменение периода подписки серверным триггером создаёт помесячные задачи —
      // обновляем список задач, чтобы календарь на карточке сразу их показал.
      void queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
