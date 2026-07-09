import { useState } from 'react'
import { useAuth } from '@/features/auth/useAuth'
import { useT } from '@/i18n/useT'
import { Button } from '@/components/ui/Button'
import { SelfEditProfileModal } from '@/features/users/SelfEditProfileModal'
import { formatDate } from '@/lib/utils'
import { Row, Section } from './SettingsUI'
import { ChangePasswordSection } from './ChangePasswordSection'
import { ThemeSection } from './ThemeSection'

/** Простые настройки личного кабинета лида: профиль + информация об аккаунте. */
export function UserSettings() {
  const { t } = useT()
  const { profile } = useAuth()
  const [editOpen, setEditOpen] = useState(false)
  if (!profile) return null

  const sub =
    profile.subscription_start && profile.subscription_end
      ? `${formatDate(profile.subscription_start)} — ${formatDate(profile.subscription_end)}`
      : null

  return (
    <div className="space-y-4 sm:space-y-5">
      <Section
        title={t('settings.profile')}
        action={
          <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
            {t('settings.edit')}
          </Button>
        }
      >
        <Row label={t('settings.fullName')} value={profile.full_name} />
        <Row label={t('settings.phone')} value={profile.phone} />
        <Row label={t('settings.businessDirection')} value={profile.business_direction} />
      </Section>

      <Section title={t('settings.account')}>
        <Row label={t('settings.login')} value={profile.login ?? profile.email} />
        <Row
          label={t('settings.status')}
          value={t(`userStatus.${profile.status}`, profile.status)}
        />
        {sub && <Row label={t('settings.subscriptionPeriod')} value={sub} />}
      </Section>

      <ThemeSection />

      <ChangePasswordSection />

      <SelfEditProfileModal open={editOpen} onClose={() => setEditOpen(false)} />
    </div>
  )
}
