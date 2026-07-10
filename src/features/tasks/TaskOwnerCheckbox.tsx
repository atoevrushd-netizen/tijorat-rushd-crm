import { Check, Clock3, Undo2 } from 'lucide-react'
import type { Task } from '@/types'
import { toast } from '@/lib/toast'
import { useT } from '@/i18n/useT'
import { useSetTaskSubmitted } from './useTasks'

/**
 * Галочка резидента: отметить задачу выполненной → «на проверке» у админа.
 * Принято админом → зелёная галочка (менять нельзя). Возвращено → можно
 * отправить снова. Всё, кроме кнопки, — управляется статусом задачи.
 */
export function TaskOwnerCheckbox({ task }: { task: Task }) {
  const { t } = useT()
  const submit = useSetTaskSubmitted()
  const status = task.status

  // Принято администратором — приятная зелёная галочка, резидент не меняет.
  if (status === 'done' || status === 'accepted_by_user') {
    return (
      <div className="mt-3 flex items-center gap-2 border-t border-line pt-3 text-[13.5px] font-semibold text-success">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success text-white">
          <Check size={15} strokeWidth={3} />
        </span>
        {t('tasksui.approved')}
      </div>
    )
  }

  // Отправлено на проверку — ждём администратора, можно отменить.
  if (status === 'submitted') {
    return (
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3">
        <span className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-warn">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-warn-soft text-warn">
            <Clock3 size={15} />
          </span>
          {t('tasksui.underReview')}
        </span>
        <button
          type="button"
          onClick={() =>
            submit.mutate(
              { taskId: task.id, submitted: false },
              { onSuccess: () => toast.info(t('tasksui.submitCancelled')) },
            )
          }
          disabled={submit.isPending}
          className="inline-flex items-center gap-1 text-[12.5px] text-ink-3 transition-colors hover:text-ink disabled:opacity-60"
        >
          <Undo2 size={13} />
          {t('tasksui.cancelSubmit')}
        </button>
      </div>
    )
  }

  // not_started | in_progress | needs_revision — можно отметить выполненной.
  return (
    <div className="mt-3 border-t border-line pt-3">
      {status === 'needs_revision' && (
        <p className="mb-2 text-[12.5px] font-medium text-danger">
          {t('tasksui.needsRevisionHint')}
        </p>
      )}
      <button
        type="button"
        onClick={() =>
          submit.mutate(
            { taskId: task.id, submitted: true },
            { onSuccess: () => toast.success(t('tasksui.submittedForReview')) },
          )
        }
        disabled={submit.isPending}
        className="inline-flex items-center gap-2.5 rounded-[12px] border border-line bg-surface px-3.5 py-2.5 text-[14px] font-semibold text-ink transition-colors hover:border-accent hover:text-accent disabled:opacity-60"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-[8px] border-2 border-current" />
        {t('tasksui.markDone')}
      </button>
    </div>
  )
}
