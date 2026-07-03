import { useQuery } from '@tanstack/react-query'
import { useAuth } from '@/features/auth/useAuth'
import { listNotifications } from './api'

const seenKey = (uid: string) => `notif_seen_${uid}`

/** Отметка «последний просмотр колокольчика» (ISO). Хранится локально. */
export function getLastSeen(uid: string): string {
  try {
    return localStorage.getItem(seenKey(uid)) ?? '1970-01-01T00:00:00.000Z'
  } catch {
    return '1970-01-01T00:00:00.000Z'
  }
}

/** Запомнить, что уведомления просмотрены сейчас. */
export function markSeen(uid: string): void {
  try {
    localStorage.setItem(seenKey(uid), new Date().toISOString())
  } catch {
    /* приватный режим / нет доступа к localStorage — не критично */
  }
}

/**
 * Уведомления текущего пользователя. Периодически обновляем (в т.ч. при
 * возврате на вкладку), чтобы админ видел действия лидов почти сразу.
 */
export function useNotifications() {
  const { profile } = useAuth()
  const uid = profile?.id
  return useQuery({
    queryKey: ['notifications', uid],
    queryFn: () => listNotifications(uid as string),
    enabled: !!uid,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
    staleTime: 30_000,
  })
}
