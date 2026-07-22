import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useT } from '@/i18n/useT'
import type { TaskStatus } from '@/types'
import { checkState } from './agendaUtils'

/**
 * Чекбокс задачи в повестке (для админа), 3 состояния:
 *   • пусто (серый)  — резидент ещё не сдал (не кликается);
 *   • жёлтый ✓       — сдано, ждёт проверки → клик = принять (станет зелёным);
 *   • зелёный ✓      — принято → клик = отменить приёмку (вернётся в жёлтый).
 */
export function AgendaCheckbox({
  status,
  busy,
  onApprove,
  onUndo,
}: {
  status: TaskStatus
  busy?: boolean
  onApprove: () => void
  onUndo: () => void
}) {
  const { t } = useT()
  const state = checkState(status)
  const base =
    'flex h-8 w-8 flex-none items-center justify-center rounded-[9px] border-2 transition-all duration-150 ease-ios disabled:opacity-60'

  if (state === 'done') {
    return (
      <button
        type="button"
        onClick={onUndo}
        disabled={busy}
        aria-label={t('agenda.acceptedUndo')}
        title={t('agenda.acceptedUndo')}
        className={cn(base, 'animate-pop border-success bg-success text-white shadow-sh1 hover:brightness-105 active:scale-90')}
      >
        <Check size={17} strokeWidth={3} />
      </button>
    )
  }

  if (state === 'submitted') {
    return (
      <button
        type="button"
        onClick={onApprove}
        disabled={busy}
        aria-label={t('agenda.approve')}
        title={t('agenda.approve')}
        className={cn(base, 'animate-pop border-warn bg-warn-soft text-warn hover:bg-warn hover:text-white active:scale-90')}
      >
        <Check size={16} strokeWidth={3} />
      </button>
    )
  }

  // Пусто: резидент ещё не сдал — принимать нечего.
  return (
    <span
      aria-label={t('agenda.notSubmitted')}
      title={t('agenda.notSubmitted')}
      className={cn(base, 'cursor-default border-line-strong text-transparent')}
    />
  )
}
