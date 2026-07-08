import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { Avatar } from '@/components/ui/Avatar'
import { useAuth } from '@/features/auth/useAuth'
import { useT } from '@/i18n/useT'
import { UserTabs } from '@/features/tabs/UserTabs'
import { TaskStats } from '@/features/tasks/TaskStats'
import { DeadlineBanner } from '@/features/tasks/DeadlineBanner'
import { AchievementsBlock } from '@/features/achievements/AchievementsBlock'
import { LeadCardPanel } from '@/features/leadcard/LeadCardPanel'
import { SelfEditProfileModal } from '@/features/users/SelfEditProfileModal'

/** Личный кабинет: градиентный баннер профиля, сводка по задачам, задачи и достижения. */
export function UserCabinet() {
  const { profile } = useAuth()
  const { t } = useT()
  const [editOpen, setEditOpen] = useState(false)
  if (!profile) return null
  const name = profile.full_name || 'студент'

  return (
    <AppShell title={t('page.cabinet')}>
      <div className="space-y-4 sm:space-y-5">
        {/* Градиентный баннер профиля */}
        <section className="relative overflow-hidden rounded-[22px] bg-hero-grad p-5 text-on-accent shadow-hero sm:p-6">
          <div className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full bg-white/15 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-16 left-16 h-40 w-40 rounded-full bg-white/10 blur-2xl" />

          <div className="relative flex items-center gap-4">
            <Avatar
              name={profile.full_name}
              src={profile.photo_url}
              size={66}
              className="ring-[3px] ring-white/40"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="truncate text-[21px] font-bold leading-tight">{name}</h2>
                <span className="shrink-0 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur-sm">
                  {t(`userStatus.${profile.status}`, profile.status)}
                </span>
              </div>
              {profile.business_direction && (
                <p className="mt-1 truncate text-[13.5px] text-white/85">
                  {profile.business_direction}
                </p>
              )}
              {profile.phone && (
                <p className="mt-0.5 font-mono text-[12px] text-white/70">{profile.phone}</p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setEditOpen(true)}
              aria-label={t('cabinet.editProfile')}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-white/20 text-on-accent backdrop-blur-sm transition-colors hover:bg-white/30 active:scale-95"
            >
              <Pencil size={17} />
            </button>
          </div>
        </section>

        <DeadlineBanner userId={profile.id} />
        <LeadCardPanel userId={profile.id} />
        <TaskStats userId={profile.id} />
        <UserTabs userId={profile.id} />
        <AchievementsBlock userId={profile.id} />
      </div>

      <SelfEditProfileModal open={editOpen} onClose={() => setEditOpen(false)} />
    </AppShell>
  )
}
