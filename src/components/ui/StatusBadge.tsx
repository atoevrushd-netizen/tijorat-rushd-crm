import type { UserStatus } from '@/types'
import { useT } from '@/i18n/useT'
import { Badge } from './Badge'

const TONE: Record<UserStatus, 'success' | 'warn' | 'muted'> = {
  active: 'success',
  paused: 'warn',
  archived: 'muted',
}

export function StatusBadge({ status }: { status: UserStatus }) {
  const { t } = useT()
  return <Badge tone={TONE[status]}>{t(`userStatus.${status}`)}</Badge>
}
