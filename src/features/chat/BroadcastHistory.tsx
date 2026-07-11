import { CheckCheck, RotateCw, TriangleAlert, Users } from 'lucide-react'
import { cn, formatDateTime } from '@/lib/utils'
import { toast } from '@/lib/toast'
import { useT } from '@/i18n/useT'
import { Spinner } from '@/components/ui/Spinner'
import { useBroadcasts, useResendBroadcast } from './useChat'
import type { BroadcastRow } from './types'

/** История рассылок со статистикой доставки/прочтения и повтором. */
export function BroadcastHistory({ active }: { active: boolean }) {
  const { t } = useT()
  const { data, isLoading } = useBroadcasts(active)

  if (isLoading) {
    return (
      <div className="flex h-32 items-center justify-center">
        <Spinner />
      </div>
    )
  }
  if (!data || data.length === 0) {
    return <p className="py-10 text-center text-[13px] text-ink-3">{t('bc.empty')}</p>
  }

  return (
    <div className="space-y-2.5">
      {data.map((b) => (
        <Card key={b.id} b={b} />
      ))}
    </div>
  )
}

function Card({ b }: { b: BroadcastRow }) {
  const { t } = useT()
  const resend = useResendBroadcast()

  const statusTone =
    b.status === 'done' ? 'bg-success-soft text-success' : b.status === 'partial' ? 'bg-warn-soft text-warn' : 'bg-info-soft text-info'

  return (
    <div className="rounded-[14px] border border-line bg-surface p-3.5">
      <div className="mb-1.5 flex items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2 py-0.5 text-[11.5px] font-semibold text-ink-2">
          <Users size={12} /> {t(`bc.${b.audience}`)} · {b.recipient_count}
        </span>
        <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold', statusTone)}>
          {t(`bc.status.${b.status}`)}
        </span>
        <span className="ml-auto text-[11px] text-ink-3">{formatDateTime(b.created_at)}</span>
      </div>

      <p className="whitespace-pre-wrap break-words text-[13.5px] text-ink line-clamp-3">{b.body}</p>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px]">
        <span className="inline-flex items-center gap-1 text-success">
          <CheckCheck size={13} /> {t('bc.delivered')}: {b.delivered}
        </span>
        <span className="inline-flex items-center gap-1 text-accent">
          {t('bc.read')}: {b.read_count}
        </span>
        {b.errors > 0 && (
          <span className="inline-flex items-center gap-1 text-danger">
            <TriangleAlert size={13} /> {t('bc.errors')}: {b.errors}
          </span>
        )}
        {b.author_name && <span className="text-ink-3">· {b.author_name}</span>}
      </div>

      {b.errors > 0 && (
        <button
          type="button"
          onClick={() =>
            resend.mutate(b.id, {
              onSuccess: (r) => toast.success(t('bc.resentToast').replace('{n}', String(r.resent))),
            })
          }
          disabled={resend.isPending}
          className="mt-2.5 inline-flex items-center gap-1.5 rounded-[11px] bg-surface-2 px-3 py-1.5 text-[12.5px] font-semibold text-ink-2 transition-colors hover:text-ink disabled:opacity-50"
        >
          <RotateCw size={13} /> {t('bc.resend')}
        </button>
      )}
    </div>
  )
}
