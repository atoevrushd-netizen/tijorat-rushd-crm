import { Check, CheckCheck, Clock3, Copy, RotateCw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from '@/lib/toast'
import { useT } from '@/i18n/useT'
import { timeHM } from './chatFormat'
import type { UiMessage } from './types'

/** Один пузырь сообщения: текст (с переносами), время и статус (у своих). */
export function MessageBubble({
  message,
  mine,
  read,
  onRetry,
}: {
  message: UiMessage
  mine: boolean
  read: boolean
  onRetry?: () => void
}) {
  const { t } = useT()
  const status = message._status

  function copy() {
    if (message.body) {
      void navigator.clipboard?.writeText(message.body)
      toast.success(t('chat.copied'))
    }
  }

  return (
    <div className={cn('group flex w-full', mine ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'relative max-w-[78%] animate-rise rounded-[18px] px-3.5 py-2 shadow-sh1 sm:max-w-[68%]',
          mine
            ? 'rounded-br-[6px] bg-accent-grad text-on-accent'
            : 'rounded-bl-[6px] bg-surface text-ink',
        )}
      >
        <div className="whitespace-pre-wrap break-words text-[14.5px] leading-relaxed">
          {message.body}
        </div>
        <div
          className={cn(
            'mt-0.5 flex items-center justify-end gap-1 text-[10.5px]',
            mine ? 'text-white/75' : 'text-ink-3',
          )}
        >
          {message.edited_at && <span>{t('chat.edited')}</span>}
          <span>{timeHM(message.created_at)}</span>
          {mine && status === 'sending' && <Clock3 size={13} />}
          {mine && status === 'error' && (
            <button
              type="button"
              onClick={onRetry}
              className="flex items-center gap-0.5 font-semibold text-white"
              aria-label={t('chat.retry')}
            >
              <RotateCw size={12} /> {t('chat.retry')}
            </button>
          )}
          {mine && !status && (read ? <CheckCheck size={14} /> : <Check size={13} />)}
        </div>

        {/* Копировать — по наведению */}
        {message.body && !status && (
          <button
            type="button"
            onClick={copy}
            aria-label={t('chat.copy')}
            className={cn(
              'absolute -top-2 opacity-0 transition-opacity group-hover:opacity-100',
              mine ? '-left-8' : '-right-8',
              'flex h-6 w-6 items-center justify-center rounded-full border border-line bg-surface text-ink-3 shadow-card hover:text-accent',
            )}
          >
            <Copy size={12} />
          </button>
        )}
      </div>
    </div>
  )
}
