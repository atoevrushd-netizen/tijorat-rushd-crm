import type { TaskStatus } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { useT } from '@/i18n/useT'

type Tone = 'accent' | 'success' | 'info' | 'warn' | 'danger' | 'muted'

const TONE: Record<TaskStatus, Tone> = {
  not_started: 'muted',
  in_progress: 'info',
  submitted: 'warn',
  done: 'success',
  sent_to_user: 'warn',
  accepted_by_user: 'accent',
  needs_revision: 'danger',
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  const { t } = useT()
  return <Badge tone={TONE[status]}>{t(`taskStatus.${status}`)}</Badge>
}
