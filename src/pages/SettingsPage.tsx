import { LogOut } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { adminNav, userNav } from '@/components/layout/nav'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/features/auth/useAuth'
import { AdminSettings } from '@/features/settings/AdminSettings'
import { UserSettings } from '@/features/settings/UserSettings'

/** Страница «Настройки» — содержимое зависит от роли. Внизу — выход (важно на телефоне). */
export function SettingsPage() {
  const { role, signOut } = useAuth()
  const isAdmin = role === 'admin'
  return (
    <AppShell
      title="Настройки"
      subtitle={isAdmin ? 'Параметры системы и данные' : 'Параметры аккаунта'}
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
          Выйти из аккаунта
        </Button>
      </div>
    </AppShell>
  )
}
