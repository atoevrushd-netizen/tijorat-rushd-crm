import { useEffect, useState } from 'react'
import { Inbox } from 'lucide-react'
import { useAuth } from '@/features/auth/useAuth'
import { canManage } from '@/features/auth/roles'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { useT } from '@/i18n/useT'
import type { TaskStatus } from '@/types'
import { useTasks } from './useTasks'
import { TaskItem } from './TaskItem'
import { CreateTaskModal } from './CreateTaskModal'
import { BulkCreateTaskModal } from './BulkCreateTaskModal'

const PAGE_SIZE = 12
const STATUSES: TaskStatus[] = [
  'not_started',
  'in_progress',
  'sent_to_user',
  'needs_revision',
  'accepted_by_user',
  'done',
]
const TYPES = ['reels', 'creative', 'other']

/** Содержимое вкладки «Медиа/Контент»: задачи пользователя (фильтр + пагинация). */
export function MediaTab({ userId, tabId }: { userId: string; tabId: string }) {
  const { role, profile } = useAuth()
  const { t } = useT()
  const isAdmin = canManage(role)
  const isOwner = profile?.id === userId
  const { data: tasks, isLoading } = useTasks(userId, tabId)
  const [createOpen, setCreateOpen] = useState(false)
  const [bulkOpen, setBulkOpen] = useState(false)

  const [statusFilter, setStatusFilter] = useState<'all' | TaskStatus>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | string>('all')
  const [visible, setVisible] = useState(PAGE_SIZE)

  // При смене фильтра — снова показываем с начала.
  useEffect(() => setVisible(PAGE_SIZE), [statusFilter, typeFilter])

  // Сортировка по дедлайну (ближайший — первым), без дедлайна — в конец.
  const sorted = tasks
    ? [...tasks].sort((a, b) => {
        if (!a.deadline) return b.deadline ? 1 : 0
        if (!b.deadline) return -1
        return a.deadline.localeCompare(b.deadline)
      })
    : []

  const filtered = sorted.filter(
    (task) =>
      (statusFilter === 'all' || task.status === statusFilter) &&
      (typeFilter === 'all' || (task.task_type ?? 'other') === typeFilter),
  )
  const shown = filtered.slice(0, visible)

  const selectCls =
    'rounded-[10px] border border-line bg-surface px-2.5 py-1.5 text-[12.5px] text-ink outline-none focus:border-accent'

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-2">
        <span className="text-[13px] font-medium text-ink-2">
          {tasks ? `${t('tasksui.tasksCount')}: ${tasks.length}` : ''}
        </span>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="secondary" onClick={() => setBulkOpen(true)}>
              {t('bulk.btn')}
            </Button>
            <Button size="sm" onClick={() => setCreateOpen(true)}>
              {t('tasksui.addTask')}
            </Button>
          </div>
        )}
      </div>

      {/* Фильтры (когда есть задачи) */}
      {tasks && tasks.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | TaskStatus)}
            className={selectCls}
          >
            <option value="all">{t('tasksui.allStatuses')}</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(`taskStatus.${s}`)}
              </option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className={selectCls}
          >
            <option value="all">{t('tasksui.allTypes')}</option>
            {TYPES.map((ty) => (
              <option key={ty} value={ty}>
                {t(`taskType.${ty}`, ty)}
              </option>
            ))}
          </select>
          {(statusFilter !== 'all' || typeFilter !== 'all') && (
            <span className="font-mono text-[12px] text-ink-3">
              {filtered.length} {t('at.count')}
            </span>
          )}
        </div>
      )}

      {isLoading && (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-[14px]" />
          ))}
        </div>
      )}

      {tasks && tasks.length === 0 && (
        <div className="flex flex-col items-center gap-2 rounded-[14px] border border-dashed border-line-strong bg-surface-2 px-4 py-10 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-[13px] bg-surface-3 text-ink-3">
            <Inbox size={20} />
          </span>
          <p className="text-sm text-ink-3">{t('tasksui.noTasks')}</p>
        </div>
      )}

      {tasks && tasks.length > 0 && filtered.length === 0 && (
        <p className="rounded-[14px] bg-surface-2 py-8 text-center text-sm text-ink-3">
          {t('tasksui.noMatch')}
        </p>
      )}

      {shown.length > 0 && (
        <div className="space-y-3">
          {shown.map((task) => (
            <TaskItem key={task.id} task={task} isAdmin={isAdmin} isOwner={isOwner} />
          ))}
        </div>
      )}

      {filtered.length > visible && (
        <div className="mt-4 flex justify-center">
          <Button variant="secondary" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
            {t('tasksui.showMore')} ({filtered.length - visible})
          </Button>
        </div>
      )}

      {isAdmin && (
        <>
          <CreateTaskModal
            open={createOpen}
            onClose={() => setCreateOpen(false)}
            userId={userId}
            tabId={tabId}
          />
          <BulkCreateTaskModal
            open={bulkOpen}
            onClose={() => setBulkOpen(false)}
            userId={userId}
            tabId={tabId}
          />
        </>
      )}
    </div>
  )
}
