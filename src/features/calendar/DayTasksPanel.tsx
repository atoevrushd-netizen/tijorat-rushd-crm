import { useState } from 'react'
import { Check, Clock, Pencil, Plus, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from '@/lib/toast'
import { confirm } from '@/lib/confirm'
import { deadlineState } from '@/lib/deadline'
import { Button } from '@/components/ui/Button'
import { useT } from '@/i18n/useT'
import { dayTitle } from '@/lib/dateI18n'
import { TaskStatusBadge } from '@/features/tasks/TaskStatusBadge'
import { useDeleteTask, useSetTaskStatus } from '@/features/tasks/useTasks'
import type { Task } from '@/types'
import { EditCalendarTaskModal } from './EditCalendarTaskModal'

/** Панель задач выбранного дня. Админ: создаёт, отмечает «выполнено», редактирует, удаляет. Лид — только смотрит. */
export function DayTasksPanel({
  date,
  tasks,
  isAdmin,
  onAdd,
}: {
  date: string
  tasks: Task[]
  isAdmin: boolean
  onAdd: () => void
}) {
  const { t, lang } = useT()
  const del = useDeleteTask()
  const setStatus = useSetTaskStatus()
  const [editTask, setEditTask] = useState<Task | null>(null)

  async function remove(id: string) {
    if (
      !(await confirm({
        message: t('cal.deleteTaskConfirm'),
        danger: true,
        confirmLabel: t('cal.deleteTask'),
      }))
    )
      return
    del.mutate(id, { onSuccess: () => toast.success(t('common.deleted')) })
  }

  function toggleDone(task: Task) {
    setStatus.mutate(
      {
        id: task.id,
        status: task.status === 'done' ? 'not_started' : 'done',
      },
      { onSuccess: () => toast.success(t('common.saved')) },
    )
  }

  return (
    <div className="min-w-0 rounded-xl border border-line bg-surface p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-[15px] font-bold capitalize text-ink">
            {dayTitle(date, lang)}
          </div>
          <div className="text-[12.5px] text-ink-3">
            {tasks.length ? `${t('cal.tasksN')}: ${tasks.length}` : t('cal.noTasks')}
          </div>
        </div>
        {isAdmin && (
          <Button size="sm" leftIcon={<Plus size={14} />} onClick={onAdd}>
            {t('cal.addBtn')}
          </Button>
        )}
      </div>

      {tasks.length === 0 ? (
        <p className="py-6 text-center text-sm text-ink-3">
          {t('cal.emptyDay')}
          {isAdmin ? t('cal.emptyDayAdmin') : ''}
        </p>
      ) : (
        <ul className="space-y-2">
          {tasks.map((task) => {
            const isDone = task.status === 'done'
            // Дедлайн задачи = этот день; подсвечиваем время сгорающих/просроченных.
            const dl = deadlineState(task.deadline, task.status)
            return (
              <li
                key={task.id}
                className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-[14px] border border-line bg-surface-2 px-3 py-2.5"
              >
                {isAdmin && (
                  <button
                    type="button"
                    aria-label={isDone ? t('cal.unmarkDone') : t('cal.markDone')}
                    onClick={() => toggleDone(task)}
                    disabled={setStatus.isPending}
                    className={cn(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors',
                      isDone
                        ? 'border-accent bg-accent text-on-accent'
                        : 'border-line-strong text-transparent hover:border-accent',
                    )}
                  >
                    <Check size={14} strokeWidth={3} />
                  </button>
                )}

                <span
                  className={cn(
                    'flex w-12 shrink-0 items-center gap-1 font-mono text-[12px]',
                    dl === 'overdue'
                      ? 'text-danger'
                      : dl === 'soon'
                        ? 'text-warn'
                        : 'text-accent',
                  )}
                >
                  {task.due_time ? (
                    <>
                      <Clock size={12} />
                      {task.due_time.slice(0, 5)}
                    </>
                  ) : (
                    <span className="text-ink-3">—:—</span>
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <div
                    className={cn(
                      'truncate text-[13.5px] font-semibold',
                      isDone ? 'text-ink-3 line-through' : 'text-ink',
                    )}
                  >
                    {task.title}
                  </div>
                  {task.task_type && (
                    <div className="text-[11.5px] text-ink-3">
                      {t(`taskType.${task.task_type}`, task.task_type)}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1 sm:ml-auto">
                  <TaskStatusBadge status={task.status} />
                  {isAdmin && (
                    <>
                      <button
                        type="button"
                        aria-label={t('cal.editTask')}
                        onClick={() => setEditTask(task)}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-ink-3 transition-colors hover:bg-surface-2 hover:text-accent"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        aria-label={t('cal.deleteTask')}
                        onClick={() => remove(task.id)}
                        disabled={del.isPending}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-ink-3 transition-colors hover:bg-surface-2 hover:text-danger disabled:opacity-50"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {isAdmin && (
        <EditCalendarTaskModal task={editTask} onClose={() => setEditTask(null)} />
      )}
    </div>
  )
}
