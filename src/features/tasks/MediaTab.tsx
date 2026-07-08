import { useState } from 'react'
import { Inbox } from 'lucide-react'
import { useAuth } from '@/features/auth/useAuth'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { useT } from '@/i18n/useT'
import { useTasks } from './useTasks'
import { TaskItem } from './TaskItem'
import { CreateTaskModal } from './CreateTaskModal'
import { BulkCreateTaskModal } from './BulkCreateTaskModal'

/** Содержимое вкладки «Медиа/Контент»: задачи пользователя. */
export function MediaTab({ userId, tabId }: { userId: string; tabId: string }) {
  const { role, profile } = useAuth()
  const { t } = useT()
  const isAdmin = role === 'admin'
  const isOwner = profile?.id === userId
  const { data: tasks, isLoading } = useTasks(userId, tabId)
  const [createOpen, setCreateOpen] = useState(false)
  const [bulkOpen, setBulkOpen] = useState(false)

  // Сортируем по дедлайну (ближайший — первым), задачи без дедлайна — в конец.
  const sortedTasks = tasks
    ? [...tasks].sort((a, b) => {
        if (!a.deadline) return b.deadline ? 1 : 0
        if (!b.deadline) return -1
        return a.deadline.localeCompare(b.deadline)
      })
    : tasks

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-2">
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
      {sortedTasks && sortedTasks.length > 0 && (
        <div className="space-y-3">
          {sortedTasks.map((task) => (
            <TaskItem key={task.id} task={task} isAdmin={isAdmin} isOwner={isOwner} />
          ))}
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
