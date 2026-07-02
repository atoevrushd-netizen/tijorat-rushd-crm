import type { UserStatus } from '@/types'
import { Badge } from './Badge'

const MAP: Record<
  UserStatus,
  { label: string; tone: 'success' | 'warn' | 'muted' }
> = {
  active: { label: 'Активен', tone: 'success' },
  paused: { label: 'На паузе', tone: 'warn' },
  archived: { label: 'В архиве', tone: 'muted' },
}

export function StatusBadge({ status }: { status: UserStatus }) {
  const item = MAP[status]
  return <Badge tone={item.tone}>{item.label}</Badge>
}
