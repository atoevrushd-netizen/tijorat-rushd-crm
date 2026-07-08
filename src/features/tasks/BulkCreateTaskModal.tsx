import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { ListChecks } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { toast } from '@/lib/toast'
import { useAuth } from '@/features/auth/useAuth'
import { useT } from '@/i18n/useT'
import type { CreateTaskInput } from './api'
import { useCreateTasks } from './useTasks'

const MAX_COUNT = 50

/** Прибавить `days` к дате YYYY-MM-DD и вернуть в том же формате. */
function addDaysISO(startISO: string, days: number): string {
  const d = new Date(`${startISO}T00:00:00`)
  d.setDate(d.getDate() + days)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/**
 * Массовое создание задач: одна кнопка — сразу N однотипных задач
 * (например «30 Reels» с нумерацией и дедлайнами по расписанию).
 */
export function BulkCreateTaskModal({
  open,
  onClose,
  userId,
  tabId,
}: {
  open: boolean
  onClose: () => void
  userId: string
  tabId: string
}) {
  const { profile } = useAuth()
  const { t } = useT()
  const create = useCreateTasks()

  const [base, setBase] = useState('Reels')
  const [type, setType] = useState('reels')
  const [count, setCount] = useState(10)
  const [numbering, setNumbering] = useState(true)
  const [startDate, setStartDate] = useState('')
  const [stepDays, setStepDays] = useState(1)
  const [comment, setComment] = useState('')

  // Нормализованное число задач в допустимых пределах.
  const n = Math.min(MAX_COUNT, Math.max(1, Number.isFinite(count) ? count : 1))
  const width = Math.max(2, String(n).length)

  // Собрать список входов для вставки (используется и для предпросмотра).
  const inputs = useMemo<CreateTaskInput[]>(() => {
    const label = base.trim() || 'Task'
    const step = Number.isFinite(stepDays) ? Math.max(0, stepDays) : 0
    return Array.from({ length: n }, (_, idx) => {
      const i = idx + 1
      const title = numbering ? `${label} #${String(i).padStart(width, '0')}` : label
      const deadline = startDate ? addDaysISO(startDate, idx * step) : undefined
      return {
        user_id: userId,
        tab_id: tabId,
        title,
        task_type: type,
        deadline,
        admin_comment: comment.trim() || undefined,
        created_by: profile?.id ?? null,
      }
    })
  }, [base, n, numbering, width, startDate, stepDays, type, comment, userId, tabId, profile?.id])

  function close() {
    create.reset()
    onClose()
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    if (inputs.length === 0) return
    create.mutate(inputs, {
      onSuccess: () => {
        toast.success(`${t('bulk.done')} · ${inputs.length}`)
        close()
      },
    })
  }

  return (
    <Modal open={open} onClose={close} title={t('bulk.title')}>
      <form className="space-y-3.5" onSubmit={submit}>
        <Labeled label={t('bulk.baseLabel')}>
          <Input value={base} onChange={(e) => setBase(e.target.value)} placeholder="Reels" required />
        </Labeled>

        <div className="grid grid-cols-2 gap-3">
          <Labeled label={t('tasksui.type')}>
            <Select value={type} onChange={(e) => setType(e.target.value)}>
              <option value="reels">{t('taskType.reels')}</option>
              <option value="creative">{t('taskType.creative')}</option>
            </Select>
          </Labeled>
          <Labeled label={t('bulk.countLabel')}>
            <Input
              type="number"
              min={1}
              max={MAX_COUNT}
              value={count}
              onChange={(e) => setCount(e.target.valueAsNumber)}
            />
          </Labeled>
        </div>

        <label className="flex cursor-pointer items-center gap-2.5 rounded-[12px] bg-surface-2 px-3.5 py-3 text-[13px] font-medium text-ink-2">
          <input
            type="checkbox"
            checked={numbering}
            onChange={(e) => setNumbering(e.target.checked)}
            className="h-4 w-4 accent-accent"
          />
          {t('bulk.numbering')}
        </label>

        <div className="grid grid-cols-2 gap-3">
          <Labeled label={t('bulk.startLabel')}>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </Labeled>
          <Labeled label={t('bulk.stepLabel')}>
            <Input
              type="number"
              min={0}
              value={stepDays}
              disabled={!startDate}
              onChange={(e) => setStepDays(e.target.valueAsNumber)}
            />
          </Labeled>
        </div>

        <Labeled label={t('tasksui.adminCommentLabel')}>
          <Textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} />
        </Labeled>

        {/* Предпросмотр: что именно создастся */}
        <div className="rounded-[12px] border border-line bg-surface-2 p-3.5 text-[12.5px]">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 font-semibold text-ink-2">
              <ListChecks className="h-4 w-4 text-accent" />
              {t('bulk.preview')}
            </span>
            <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent">
              {inputs.length}
            </span>
          </div>
          <div className="mt-2 space-y-0.5 font-mono text-ink-3">
            {inputs.slice(0, 3).map((it, i) => (
              <div key={i} className="truncate">
                • {it.title}
                {it.deadline ? ` — ${it.deadline}` : ''}
              </div>
            ))}
            {inputs.length > 3 && <div>• … +{inputs.length - 3}</div>}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          <Button type="button" variant="secondary" onClick={close}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" loading={create.isPending}>
            {t('bulk.createN')} · {inputs.length}
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
