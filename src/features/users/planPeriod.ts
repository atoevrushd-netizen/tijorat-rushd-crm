/** Метки планов подписки лида (0051): 3 или 6 месяцев. */
export const PLAN_OPTIONS = [3, 6] as const
export type PlanMonths = (typeof PLAN_OPTIONS)[number]

/** Локальная дата YYYY-MM-DD (без сдвига TZ, в отличие от Date.toISOString). */
function isoLocal(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * Период подписки по метке плана: старт — 1-е число текущего месяца, конец —
 * последний день месяца (старт + N − 1). Триггер provision_on_subscription
 * создаст помесячные наборы задач на каждый календарный месяц периода.
 * `from` вынесен параметром ради тестируемости (по умолчанию — сегодня).
 */
export function planPeriod(
  months: number,
  from = new Date(),
): { start: string; end: string } {
  const start = new Date(from.getFullYear(), from.getMonth(), 1)
  // День 0 месяца (start + N) = последний день месяца (start + N − 1).
  const end = new Date(from.getFullYear(), from.getMonth() + months, 0)
  return { start: isoLocal(start), end: isoLocal(end) }
}
