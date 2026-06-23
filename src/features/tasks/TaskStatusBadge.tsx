import type { TaskStatus } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { TASK_STATUS_LABEL } from './taskStatus'

type Tone = 'accent' | 'info' | 'warn' | 'danger' | 'muted'

const TONE: Record<TaskStatus, Tone> = {
  not_started: 'muted',
  in_progress: 'info',
  done: 'accent',
  sent_to_user: 'warn',
  accepted_by_user: 'accent',
  needs_revision: 'danger',
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return <Badge tone={TONE[status]}>{TASK_STATUS_LABEL[status]}</Badge>
}
