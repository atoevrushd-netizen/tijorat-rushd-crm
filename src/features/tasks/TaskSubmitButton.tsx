import { Check, Clock3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from '@/lib/toast'
import { useT } from '@/i18n/useT'
import type { Task } from '@/types'
import { useSetTaskSubmitted } from './useTasks'

/**
 * Компактная галочка резидента (строка календаря): отметить выполненной → «на
 * проверке» → зелёная галочка «принято». Та же логика, что и TaskOwnerCheckbox,
 * но иконкой-кнопкой под тесную строку.
 */
export function TaskSubmitButton({ task }: { task: Task }) {
  const { t } = useT()
  const submit = useSetTaskSubmitted()
  const status = task.status
  const approved = status === 'done' || status === 'accepted_by_user'
  const pending = status === 'submitted'

  if (approved) {
    return (
      <span
        aria-label={t('tasksui.approved')}
        title={t('tasksui.approved')}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[8px] bg-success text-white"
      >
        <Check size={14} strokeWidth={3} />
      </span>
    )
  }

  function onClick() {
    submit.mutate(
      { taskId: task.id, submitted: !pending },
      {
        onSuccess: () => {
          if (pending) toast.info(t('tasksui.submitCancelled'))
          else toast.success(t('tasksui.submittedForReview'))
        },
      },
    )
  }

  return (
    <button
      type="button"
      aria-label={pending ? t('tasksui.underReview') : t('tasksui.markDone')}
      title={pending ? t('tasksui.underReview') : t('tasksui.markDone')}
      onClick={onClick}
      disabled={submit.isPending}
      className={cn(
        'flex h-6 w-6 shrink-0 items-center justify-center rounded-[8px] border-2 transition-colors disabled:opacity-60',
        pending
          ? 'border-warn bg-warn-soft text-warn'
          : 'border-line-strong text-transparent hover:border-accent hover:text-accent',
      )}
    >
      {pending ? <Clock3 size={13} /> : <Check size={14} strokeWidth={3} />}
    </button>
  )
}
