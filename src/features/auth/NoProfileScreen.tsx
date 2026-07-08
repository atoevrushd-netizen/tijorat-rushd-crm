import { ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useT } from '@/i18n/useT'
import { useAuth } from './useAuth'

/** Пользователь авторизован, но профиль/роль не загрузились или не настроены. */
export function NoProfileScreen() {
  const { t } = useT()
  const { signOut } = useAuth()
  return (
    <div className="flex min-h-full items-center justify-center p-6">
      <div className="w-full max-w-md rounded-[22px] border border-line bg-surface p-8 text-center shadow-sh1">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-[16px] bg-warn-soft text-warn">
          <ShieldAlert className="h-7 w-7" />
        </span>
        <p className="mt-5 text-[19px] font-bold text-ink">{t('noProfile.title')}</p>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-2">{t('noProfile.desc')}</p>
        <div className="mt-6 flex justify-center gap-2">
          <Button onClick={() => window.location.reload()}>{t('noProfile.refresh')}</Button>
          <Button variant="secondary" onClick={() => void signOut()}>
            {t('common.signOut')}
          </Button>
        </div>
      </div>
    </div>
  )
}
