import { Button } from '@/components/ui/Button'
import { useT } from '@/i18n/useT'
import { useAuth } from './useAuth'

/** Пользователь авторизован, но профиль/роль не загрузились или не настроены. */
export function NoProfileScreen() {
  const { t } = useT()
  const { signOut } = useAuth()
  return (
    <div className="flex min-h-full flex-col items-center justify-center p-6 text-center">
      <p className="text-lg font-bold text-ink">{t('noProfile.title')}</p>
      <p className="mt-2 max-w-md text-sm text-ink-2">{t('noProfile.desc')}</p>
      <div className="mt-4 flex gap-2">
        <Button onClick={() => window.location.reload()}>{t('noProfile.refresh')}</Button>
        <Button variant="secondary" onClick={() => void signOut()}>
          {t('common.signOut')}
        </Button>
      </div>
    </div>
  )
}
