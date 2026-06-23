import { useState } from 'react'
import { useAuth } from '@/features/auth/useAuth'
import { Button } from '@/components/ui/Button'
import { SelfEditProfileModal } from '@/features/users/SelfEditProfileModal'
import { formatDate } from '@/lib/utils'
import { Row, Section } from './SettingsUI'

const STATUS: Record<string, string> = {
  active: 'Активен',
  paused: 'На паузе',
  archived: 'В архиве',
}

/** Простые настройки личного кабинета лида: профиль + информация об аккаунте. */
export function UserSettings() {
  const { profile } = useAuth()
  const [editOpen, setEditOpen] = useState(false)
  if (!profile) return null

  const sub =
    profile.subscription_start && profile.subscription_end
      ? `${formatDate(profile.subscription_start)} — ${formatDate(profile.subscription_end)}`
      : null

  return (
    <div className="space-y-6">
      <Section
        title="Профиль"
        action={
          <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
            Изменить
          </Button>
        }
      >
        <Row label="Имя и фамилия" value={profile.full_name} />
        <Row label="Телефон" value={profile.phone} />
        <Row label="Направление бизнеса" value={profile.business_direction} />
      </Section>

      <Section title="Аккаунт">
        <Row label="Логин" value={profile.login ?? profile.email} />
        <Row label="Статус" value={STATUS[profile.status] ?? profile.status} />
        {sub && <Row label="Период подписки" value={sub} />}
      </Section>

      <SelfEditProfileModal open={editOpen} onClose={() => setEditOpen(false)} />
    </div>
  )
}
