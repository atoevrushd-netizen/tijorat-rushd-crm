import { useState, type FormEvent, type ReactNode } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/features/auth/useAuth'
import { useCreateTask } from '@/features/tasks/useTasks'
import { formatDateShort } from './calendarUtils'

/** Создание задачи на конкретный день (только админ). День приходит из календаря. */
export function CreateCalendarTaskModal({
  open,
  onClose,
  userId,
  tabId,
  date,
}: {
  open: boolean
  onClose: () => void
  userId: string
  tabId: string
  date: string
}) {
  const { profile } = useAuth()
  const create = useCreateTask()
  const [title, setTitle] = useState('')
  const [type, setType] = useState('reels')
  const [time, setTime] = useState('')
  const [comment, setComment] = useState('')

  function close() {
    create.reset()
    setTitle('')
    setType('reels')
    setTime('')
    setComment('')
    onClose()
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    create.mutate(
      {
        user_id: userId,
        tab_id: tabId,
        title: title.trim(),
        task_type: type,
        deadline: date,
        due_time: time || undefined,
        admin_comment: comment.trim() || undefined,
        created_by: profile?.id ?? null,
      },
      { onSuccess: close },
    )
  }

  return (
    <Modal open={open} onClose={close} title={`Задача на ${formatDateShort(date)}`}>
      <form className="space-y-3" onSubmit={submit}>
        <Labeled label="Название *">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Снять Reels"
            required
          />
        </Labeled>
        <div className="grid grid-cols-2 gap-3">
          <Labeled label="Тип">
            <Select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="reels">Reels</option>
              <option value="creative">Креатив</option>
              <option value="other">Другое</option>
            </Select>
          </Labeled>
          <Labeled label="Время">
            <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
          </Labeled>
        </div>
        <Labeled label="Комментарий">
          <Textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} />
        </Labeled>

        {create.isError && (
          <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
            {create.error instanceof Error ? create.error.message : 'Не удалось создать'}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={close}>
            Отмена
          </Button>
          <Button type="submit" loading={create.isPending}>
            Создать
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
