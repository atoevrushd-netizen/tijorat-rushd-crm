import { useQuery } from '@tanstack/react-query'
import { getUserPassword } from './api'

/**
 * Открытый пароль пользователя (таблица user_credentials, читает только админ).
 * Возвращает null, если пароль ещё не сохранён (старые аккаунты до этой фичи).
 */
export function useUserPassword(userId: string | undefined) {
  return useQuery({
    queryKey: ['credentials', userId],
    queryFn: () => getUserPassword(userId as string),
    enabled: Boolean(userId),
  })
}
