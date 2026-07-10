import { useState, type FormEvent } from 'react'
import { Check, X } from 'lucide-react'
import type { Task } from '@/types'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { toast } from '@/lib/toast'
import { useT } from '@/i18n/useT'
import { useReviewTask } from './useTasks'

/**
 * Проверка администратором отправленной задачи: принять (→ done, зелёная галочка
 * у резидента) или вернуть на доработку (→ needs_revision, резидент получит
 * уведомление и переделает). Показывается только когда задача «на проверке».
 */
export function TaskReviewControls({ task }: { task: Task }) {
  const { t } = useT()
  const review = useReviewTask()
  const [rejecting, setRejecting] = useState(false)
  const [comment, setComment] = useState('')

  function reject(e: FormEvent) {
    e.preventDefault()
    review.mutate(
      { taskId: task.id, accept: false, comment: comment.trim() || undefined },
      {
        onSuccess: () => {
          setRejecting(false)
          setComment('')
          toast.success(t('tasksui.rejected'))
        },
      },
    )
  }

  return (
    <div className="mt-3 rounded-[12px] border border-warn/40 bg-warn-soft/50 p-3">
      <p className="mb-2.5 text-[13px] font-semibold text-ink">{t('tasksui.reviewHint')}</p>
      {!rejecting ? (
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            leftIcon={<Check size={15} />}
            loading={review.isPending}
            onClick={() =>
              review.mutate(
                { taskId: task.id, accept: true },
                { onSuccess: () => toast.success(t('tasksui.accepted')) },
              )
            }
          >
            {t('tasksui.approve')}
          </Button>
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<X size={15} />}
            onClick={() => setRejecting(true)}
          >
            {t('tasksui.reject')}
          </Button>
        </div>
      ) : (
        <form onSubmit={reject} className="space-y-2">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            placeholder={t('tasksui.whatToFix')}
          />
          <div className="flex gap-2">
            <Button type="submit" size="sm" variant="danger" loading={review.isPending}>
              {t('tasksui.sendForRevision')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => setRejecting(false)}
            >
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      )}
      {review.isError && (
        <p className="mt-1 text-sm text-danger">
          {review.error instanceof Error ? review.error.message : t('tasksui.error')}
        </p>
      )}
    </div>
  )
}
