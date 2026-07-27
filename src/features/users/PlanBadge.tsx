import { cn } from '@/lib/utils'
import { useT } from '@/i18n/useT'

/** Метка плана подписки лида (3 / 6 месяцев). Ничего не рисует, если план не задан. */
export function PlanBadge({
  months,
  className,
}: {
  months?: number | null
  className?: string
}) {
  const { t } = useT()
  if (months !== 3 && months !== 6) return null
  const label = months === 6 ? t('usercard.plan6Short') : t('usercard.plan3Short')
  // 6 мес — акцентная метка (длиннее план), 3 мес — нейтральная.
  const tone = months === 6 ? 'bg-accent-soft text-accent' : 'bg-surface-3 text-ink-2'
  return (
    <span
      className={cn(
        'inline-flex flex-none items-center rounded-full px-2 py-px text-[11px] font-semibold',
        tone,
        className,
      )}
    >
      {label}
    </span>
  )
}
