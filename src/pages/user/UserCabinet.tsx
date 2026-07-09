import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, IdCard, Pencil } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { Avatar } from '@/components/ui/Avatar'
import { useAuth } from '@/features/auth/useAuth'
import { useT } from '@/i18n/useT'
import { UserTabs } from '@/features/tabs/UserTabs'
import { TaskStats } from '@/features/tasks/TaskStats'
import { DeadlineBanner } from '@/features/tasks/DeadlineBanner'
import { AchievementsBlock } from '@/features/achievements/AchievementsBlock'
import { SelfEditProfileModal } from '@/features/users/SelfEditProfileModal'
import { WelcomeModal } from '@/features/onboarding/WelcomeModal'
import { useLeadCard } from '@/features/leadcard/useLeadCard'
import { LEAD_CARD_GROUPS } from '@/features/leadcard/fields'

/** Личный кабинет: градиентный баннер профиля, сводка по задачам, задачи и достижения. */
export function UserCabinet() {
  const { profile } = useAuth()
  const { t } = useT()
  const [editOpen, setEditOpen] = useState(false)
  const { data: leadCard } = useLeadCard(profile?.id ?? '')
  if (!profile) return null
  const name = profile.full_name || 'студент'

  // Заполненность бизнес-карты (17 полей) — для индикатора на кнопке «Мои данные».
  const cardFields = LEAD_CARD_GROUPS.flatMap((g) => g.fields)
  const filled = leadCard
    ? cardFields.filter((f) => (leadCard[f] ?? '').toString().trim()).length
    : 0

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

        {/* Кнопка-переход в «Мои данные» (бизнес-карта лида) */}
        <Link
          to="/my-data"
          className="group flex items-center gap-4 rounded-[18px] border border-line bg-surface p-5 shadow-sh1 transition-all duration-200 ease-ios hover:border-line-strong hover:shadow-sh2 active:scale-[.99]"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-accent-grad text-on-accent shadow-glow">
            <IdCard size={22} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[15px] font-bold text-ink">{t('leadcard.title')}</div>
            <div className="truncate text-[12.5px] text-ink-3">
              {filled > 0
                ? t('leadcard.progress')
                    .replace('{n}', String(filled))
                    .replace('{total}', String(cardFields.length))
                : t('leadcard.entryHint')}
            </div>
            {/* Полоса заполненности */}
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full bg-accent-grad transition-all duration-500 ease-kit"
                style={{ width: `${Math.round((filled / cardFields.length) * 100)}%` }}
              />
            </div>
          </div>
          <ChevronRight
            size={20}
            className="shrink-0 self-start text-ink-3 transition-colors group-hover:text-accent"
          />
        </Link>

        <TaskStats userId={profile.id} />
        <UserTabs userId={profile.id} />
        <AchievementsBlock userId={profile.id} />
      </div>

      <SelfEditProfileModal open={editOpen} onClose={() => setEditOpen(false)} />
      <WelcomeModal />
    </AppShell>
  )
}
