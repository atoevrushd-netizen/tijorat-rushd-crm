import { useQuery } from '@tanstack/react-query'
import { listDayAgenda } from './api'

/**
 * Повестка выбранного дня (все резиденты + их задачи за дату).
 * Ключ под ['tasks', ...] — существующие инвалидаторы задач его обновят,
 * а оптимистичные мутации (useReviewTask/useSetTaskStatus) сразу поправят кэш.
 */
export function useDayAgenda(day: string) {
  return useQuery({
    queryKey: ['tasks', 'agenda', day],
    queryFn: () => listDayAgenda(day),
    // Повестку держим «живой»: резиденты отмечают задачи в своих сессиях, поэтому
    // подтягиваем изменения при возврате фокуса и раз в минуту (глобально focus-refetch выключен).
    refetchOnWindowFocus: true,
    refetchInterval: 60_000,
  })
}
