import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import type { Task, TaskStatus } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { toast } from '@/lib/toast'
import { ADMIN_STATUS_OPTIONS } from '@/features/tasks/taskStatus'
import { useUpdateTask } from '@/features/tasks/useTasks'
import { useT } from '@/i18n/useT'

/** Редактирование задачи календаря (только админ): название, тип, день, время, статус, комментарий. */
export function EditCalendarTaskModal({
  task,
  onClose,
}: {
  task: Task | null
  onClose: () => void
}) {
  const update = useUpdateTask()
  const { t } = useT()
  const [title, setTitle] = useState('')
  const [type, setType] = useState('reels')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [status, setStatus] = useState<TaskStatus>('not_started')
  const [comment, setComment] = useState('')

  useEffect(() => {
    if (!task) return
    setTitle(task.title)
    setType(task.task_type ?? 'reels')
    setDate(task.deadline ? task.deadline.slice(0, 10) : '')
    setTime(task.due_time ? task.due_time.slice(0, 5) : '')
    setStatus(task.status)
    setComment(task.admin_comment ?? '')
  }, [task])

  function close() {
    update.reset()
    onClose()
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!task || !title.trim()) return
    update.mutate(
      {
        id: task.id,
        patch: {
          title: title.trim(),
          task_type: type,
          deadline: date || null,
          due_time: time || null,
          admin_comment: comment.trim() || null,
          status,
        },
      },
      {
        onSuccess: () => {
          toast.success(t('common.saved'))
          onClose()
        },
      },
    )
  }

  return (
    <Modal open={!!task} onClose={close} title={t('calmodal.editTitle')}>
      <form className="space-y-3" onSubmit={submit}>
        <Labeled label={t('calmodal.nameLabel')}>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </Labeled>
        <div className="grid grid-cols-2 gap-3">
          <Labeled label={t('calmodal.typeLabel')}>
            <Select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="reels">{t('taskType.reels')}</option>
              <option value="creative">{t('taskType.creative')}</option>
              <option value="other">{t('taskType.other')}</option>
            </Select>
          </Labeled>
          <Labeled label={t('calmodal.statusLabel')}>
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
            >
              {ADMIN_STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {t(`taskStatus.${s}`)}
                </option>
              ))}
            </Select>
          </Labeled>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Labeled label={t('calmodal.dayLabel')}>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Labeled>
          <Labeled label={t('calmodal.timeLabel')}>
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </Labeled>
        </div>
        <Labeled label={t('calmodal.commentLabel')}>
          <Textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} />
        </Labeled>

        {update.isError && (
          <p className="rounded-[12px] bg-danger-soft px-3 py-2 text-sm text-danger">
            {update.error instanceof Error ? update.error.message : t('calmodal.saveError')}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={close}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" loading={update.isPending}>
            {t('common.save')}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

function Labeled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-[12.5px] font-semibold text-ink-2">{label}</span>
      {children}
    </label>
  )
}
