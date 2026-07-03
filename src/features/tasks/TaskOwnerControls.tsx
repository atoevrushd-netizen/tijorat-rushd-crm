import { useState, type FormEvent } from 'react'
import type { Task } from '@/types'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { useT } from '@/i18n/useT'
import { useRespondToTask } from './useTasks'

/** Действия владельца над отправленной задачей: принять / вернуть на правку. */
export function TaskOwnerControls({ task }: { task: Task }) {
  const { t } = useT()
  const respond = useRespondToTask()
  const [revision, setRevision] = useState(false)
  const [comment, setComment] = useState('')

  function sendRevision(e: FormEvent) {
    e.preventDefault()
    respond.mutate(
      { taskId: task.id, accept: false, comment: comment.trim() || undefined },
      {
        onSuccess: () => {
          setRevision(false)
          setComment('')
        },
      },
    )
  }

  return (
    <div className="mt-3 border-t border-line pt-3">
      {!revision ? (
        <div className="flex gap-2">
          <Button
            onClick={() => respond.mutate({ taskId: task.id, accept: true })}
            loading={respond.isPending}
          >
            {t('tasksui.accept')}
          </Button>
          <Button variant="secondary" onClick={() => setRevision(true)}>
            {t('tasksui.returnForRevision')}
          </Button>
        </div>
      ) : (
        <form onSubmit={sendRevision} className="space-y-2">
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={2}
            placeholder={t('tasksui.whatToFix')}
          />
          <div className="flex gap-2">
            <Button type="submit" loading={respond.isPending}>
              {t('tasksui.sendForRevision')}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setRevision(false)}>
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      )}
      {respond.isError && (
        <p className="mt-1 text-sm text-danger">
          {respond.error instanceof Error ? respond.error.message : t('tasksui.error')}
        </p>
      )}
    </div>
  )
}
