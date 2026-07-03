import { useState, type FormEvent } from 'react'
import type { Task, TaskStatus } from '@/types'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { toast } from '@/lib/toast'
import { confirm } from '@/lib/confirm'
import { useT } from '@/i18n/useT'
import { ADMIN_STATUS_OPTIONS } from './taskStatus'
import { useAddTaskLink, useDeleteTask, useSetTaskStatus } from './useTasks'

/** Действия администратора над задачей: статус, ссылка, удаление. */
export function TaskAdminControls({ task }: { task: Task }) {
  const { t } = useT()
  const setStatus = useSetTaskStatus()
  const del = useDeleteTask()
  const addLink = useAddTaskLink()
  const [linkUrl, setLinkUrl] = useState('')

  function submitLink(e: FormEvent) {
    e.preventDefault()
    if (!linkUrl.trim()) return
    addLink.mutate(
      { taskId: task.id, url: linkUrl.trim() },
      { onSuccess: () => setLinkUrl('') },
    )
  }

  return (
    <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
      <select
        value={ADMIN_STATUS_OPTIONS.includes(task.status) ? task.status : ''}
        onChange={(e) =>
          e.target.value &&
          setStatus.mutate(
            { id: task.id, status: e.target.value as TaskStatus },
            { onSuccess: () => toast.success(t('common.saved')) },
          )
        }
        className="rounded-md border border-line-strong bg-bg px-2.5 py-1.5 text-sm text-ink outline-none transition-colors focus:border-accent"
      >
        <option value="" disabled>
          {t('tasksui.changeStatus')}
        </option>
        {ADMIN_STATUS_OPTIONS.map((s) => (
          <option key={s} value={s}>
            {t(`taskStatus.${s}`)}
          </option>
        ))}
      </select>

      <form onSubmit={submitLink} className="flex w-full items-center gap-1 sm:w-auto">
        <div className="flex-1 sm:w-44">
          <Input
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder={t('tasksui.linkPlaceholder')}
          />
        </div>
        <Button type="submit" variant="secondary" size="sm">
          {t('tasksui.addLink')}
        </Button>
      </form>

      <button
        type="button"
        onClick={async () => {
          if (
            await confirm({
              message: t('tasksui.confirmDeleteTask'),
              danger: true,
              confirmLabel: t('misc.delete'),
            })
          )
            del.mutate(task.id, {
              onSuccess: () => toast.success(t('common.deleted')),
            })
        }}
        className="text-sm text-danger transition-opacity hover:opacity-80"
      >
        {t('tasksui.delete')}
      </button>
    </div>
  )
}
