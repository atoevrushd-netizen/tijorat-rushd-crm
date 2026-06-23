import { useState } from 'react'
import { useAuth } from '@/features/auth/useAuth'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { useTasks } from './useTasks'
import { TaskItem } from './TaskItem'
import { CreateTaskModal } from './CreateTaskModal'

/** Содержимое вкладки «Медиа/Контент»: задачи пользователя. */
export function MediaTab({ userId, tabId }: { userId: string; tabId: string }) {
  const { role, profile } = useAuth()
  const isAdmin = role === 'admin'
  const isOwner = profile?.id === userId
  const { data: tasks, isLoading } = useTasks(userId, tabId)
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm text-ink-2">
          {tasks ? `Задач: ${tasks.length}` : ''}
        </span>
        {isAdmin && (
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            + Задача
          </Button>
        )}
      </div>

      {isLoading && (
        <div className="space-y-3">
          {[0, 1].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )}
      {tasks && tasks.length === 0 && (
        <p className="text-sm text-ink-3">Задач пока нет.</p>
      )}
      {tasks && tasks.length > 0 && (
        <div className="space-y-3">
          {tasks.map((t) => (
            <TaskItem key={t.id} task={t} isAdmin={isAdmin} isOwner={isOwner} />
          ))}
        </div>
      )}

      {isAdmin && (
        <CreateTaskModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          userId={userId}
          tabId={tabId}
        />
      )}
    </div>
  )
}
