import { useState } from 'react'
import { CalendarClock } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { Spinner } from '@/components/ui/Spinner'
import { toast } from '@/lib/toast'
import { cn } from '@/lib/utils'
import { useT } from '@/i18n/useT'
import { ymd } from '@/features/calendar/calendarUtils'
import { useReviewTask, useSetTaskStatus } from '@/features/tasks/useTasks'
import { useDayAgenda } from '@/features/agenda/useAgenda'
import { AgendaHeader } from '@/features/agenda/AgendaHeader'
import { DatePickerModal } from '@/features/agenda/DatePickerModal'
import { DayAgendaList } from '@/features/agenda/DayAgendaList'
import {
  agendaCounts,
  groupByLead,
  matchesFilter,
  shiftDay,
  type AgendaFilter,
} from '@/features/agenda/agendaUtils'
import type { AgendaTask } from '@/features/agenda/api'

/**
 * Админская «Повестка дня»: сверху шапка-календарь (листание дней + быстрый выбор
 * даты), снизу список всех резидентов и их задач за день с 3-статусным чекбоксом
 * (пусто → жёлтый «сдано, ждёт проверки» → зелёный «принято»).
 */
export function AgendaPage() {
  const { t } = useT()
  const today = ymd(new Date())
  const [day, setDay] = useState(today)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [filter, setFilter] = useState<AgendaFilter>('all')
  const [rejectTask, setRejectTask] = useState<AgendaTask | null>(null)
  const [rejectComment, setRejectComment] = useState('')
  const [pending, setPending] = useState<Set<string>>(new Set())

  const { data: rows = [], isLoading, isError, refetch } = useDayAgenda(day)
  const review = useReviewTask()
  const setStatus = useSetTaskStatus()

  const counts = agendaCounts(rows)
  const groups = groupByLead(rows.filter((r) => matchesFilter(r.status, filter)))

  function mark(id: string, on: boolean) {
    setPending((p) => {
      const n = new Set(p)
      if (on) n.add(id)
      else n.delete(id)
      return n
    })
  }
  function approve(task: AgendaTask) {
    mark(task.id, true)
    review.mutate(
      { taskId: task.id, accept: true },
      { onSuccess: () => toast.success(t('agenda.accepted')), onSettled: () => mark(task.id, false) },
    )
  }
  function undo(task: AgendaTask) {
    mark(task.id, true)
    setStatus.mutate(
      { id: task.id, status: 'submitted' },
      { onSuccess: () => toast.info(t('agenda.undone')), onSettled: () => mark(task.id, false) },
    )
  }
  function closeReject() {
    setRejectTask(null)
    setRejectComment('')
  }
  function submitReject() {
    if (!rejectTask) return
    const id = rejectTask.id
    mark(id, true)
    review.mutate(
      { taskId: id, accept: false, comment: rejectComment.trim() || undefined },
      { onSuccess: () => toast.success(t('agenda.returnedToast')), onSettled: () => mark(id, false) },
    )
    closeReject()
  }

  const FILTERS: { key: AgendaFilter; label: string; n: number }[] = [
    { key: 'all', label: t('agenda.filterAll'), n: counts.total },
    { key: 'submitted', label: t('agenda.filterSubmitted'), n: counts.submitted },
    { key: 'todo', label: t('agenda.filterTodo'), n: counts.todo },
    { key: 'done', label: t('agenda.filterDone'), n: counts.done },
  ]

  return (
    <AppShell title={t('agenda.title')}>
      <div className="mx-auto max-w-3xl space-y-4">
        <AgendaHeader
          day={day}
          onPrev={() => setDay((d) => shiftDay(d, -1))}
          onNext={() => setDay((d) => shiftDay(d, 1))}
          onOpenPicker={() => setPickerOpen(true)}
        />

        <div className="flex flex-wrap items-center gap-1.5">
          {day !== today && (
            <button
              type="button"
              onClick={() => setDay(today)}
              className="rounded-full bg-accent-soft px-3 py-1 text-[12px] font-semibold text-accent transition-colors hover:bg-accent-soft-2"
            >
              {t('agenda.today')}
            </button>
          )}
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold transition-colors',
                filter === f.key ? 'bg-accent-grad text-on-accent shadow-glow' : 'bg-surface-2 text-ink-2 hover:text-ink',
              )}
            >
              {f.label}
              <span className={cn('rounded-full px-1.5 text-[10.5px]', filter === f.key ? 'bg-white/25' : 'bg-surface-3 text-ink-2')}>
                {f.n}
              </span>
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex h-40 items-center justify-center">
            <Spinner />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center gap-3 rounded-[18px] border border-line bg-surface py-12 text-center">
            <p className="text-[14px] font-semibold text-danger">{t('agenda.loadError')}</p>
            <Button variant="secondary" onClick={() => refetch()}>
              {t('agenda.retry')}
            </Button>
          </div>
        ) : groups.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-[18px] border border-line bg-surface py-14 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-[16px] bg-accent-soft text-accent">
              <CalendarClock size={24} />
            </span>
            <p className="text-[14px] font-semibold text-ink">
              {rows.length === 0 ? t('agenda.empty') : t('agenda.emptyFilter')}
            </p>
            <p className="text-[12.5px] text-ink-3">{t('agenda.emptyHint')}</p>
          </div>
        ) : (
          <DayAgendaList groups={groups} pending={pending} onApprove={approve} onUndo={undo} onReject={setRejectTask} />
        )}
      </div>

      <DatePickerModal open={pickerOpen} value={day} onClose={() => setPickerOpen(false)} onSelect={setDay} />

      <Modal open={!!rejectTask} onClose={closeReject} title={t('agenda.rejectTitle')}>
        <p className="mb-2 text-[13px] font-medium text-ink-2">{rejectTask?.title}</p>
        <Textarea
          value={rejectComment}
          onChange={(e) => setRejectComment(e.target.value)}
          rows={3}
          placeholder={t('agenda.rejectPlaceholder')}
        />
        <div className="mt-3 flex gap-2">
          <Button variant="danger" onClick={submitReject}>
            {t('agenda.rejectConfirm')}
          </Button>
          <Button variant="secondary" onClick={closeReject}>
            {t('common.cancel')}
          </Button>
        </div>
      </Modal>
    </AppShell>
  )
}
