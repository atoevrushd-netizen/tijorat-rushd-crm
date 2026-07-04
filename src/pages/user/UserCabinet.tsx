import { useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { useAuth } from '@/features/auth/useAuth'
import { useT } from '@/i18n/useT'
import { UserTabs } from '@/features/tabs/UserTabs'
import { TaskStats } from '@/features/tasks/TaskStats'
import { DeadlineBanner } from '@/features/tasks/DeadlineBanner'
import { AchievementsBlock } from '@/features/achievements/AchievementsBlock'
import { SelfEditProfileModal } from '@/features/users/SelfEditProfileModal'

/** Личный кабинет: профиль, сводка по задачам, задачи и достижения. */
export function UserCabinet() {
  const { profile } = useAuth()
  const { t } = useT()
  const [editOpen, setEditOpen] = useState(false)
  if (!profile) return null
  const name = profile.full_name || 'студент'

  return (
    <AppShell
      title={t('page.cabinet')}
      action={
        <Button variant="secondary" onClick={() => setEditOpen(true)}>
          {t('cabinet.editProfile')}
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Профиль */}
        <section className="flex items-center gap-4 rounded-xl border border-line bg-surface p-6">
          <Avatar name={profile.full_name} src={profile.photo_url} size={64} />
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-lg font-bold text-ink">{name}</h2>
              <StatusBadge status={profile.status} />
            </div>
            {profile.business_direction && (
              <p className="text-sm text-ink-2">{profile.business_direction}</p>
            )}
            {profile.phone && (
              <p className="font-mono text-xs text-ink-3">{profile.phone}</p>
            )}
          </div>
        </section>

        <DeadlineBanner userId={profile.id} />
        <TaskStats userId={profile.id} />
        <UserTabs userId={profile.id} />
        <AchievementsBlock userId={profile.id} />
      </div>

      <SelfEditProfileModal open={editOpen} onClose={() => setEditOpen(false)} />
    </AppShell>
  )
}
