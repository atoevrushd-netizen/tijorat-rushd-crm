import { LogOut } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { adminNav, userNav } from '@/components/layout/nav'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/features/auth/useAuth'
import { useT } from '@/i18n/useT'
import { AdminSettings } from '@/features/settings/AdminSettings'
import { UserSettings } from '@/features/settings/UserSettings'

/** Страница «Настройки» — содержимое зависит от роли. Внизу — выход (важно на телефоне). */
export function SettingsPage() {
  const { role, signOut } = useAuth()
  const { t } = useT()
  // Разработчик — супер-админ: на «Настройках» показываем ему админский раздел.
  const isAdmin = role === 'admin' || role === 'developer'
  return (
    <AppShell
      title={t('page.settings')}
      subtitle={isAdmin ? t('settings.subtitleAdmin') : t('settings.subtitleUser')}
      nav={isAdmin ? adminNav : userNav}
    >
      <div className="space-y-6">
        {isAdmin ? <AdminSettings /> : <UserSettings />}
        <Button
          variant="outline"
          leftIcon={<LogOut size={15} />}
          onClick={() => void signOut()}
          className="w-full sm:w-auto"
        >
          {t('settings.signOutAccount')}
        </Button>
      </div>
    </AppShell>
  )
}
