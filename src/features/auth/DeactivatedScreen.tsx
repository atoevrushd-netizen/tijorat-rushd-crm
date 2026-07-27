import { LockKeyhole } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useT } from '@/i18n/useT'
import { useAuth } from './useAuth'

/**
 * Экран для деактивированного резидента (0048): он входит, но доступ к кабинету
 * закрыт — программа завершена. Показывается вместо всех защищённых маршрутов.
 */
export function DeactivatedScreen() {
  const { t } = useT()
  const { signOut } = useAuth()
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg-grad px-4 py-10 text-center">
      <div className="w-full max-w-[420px] rounded-[24px] border border-line bg-surface p-8 shadow-sh2 sm:p-10">
        <span className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[20px] bg-accent-soft text-accent">
          <LockKeyhole size={30} />
        </span>
        <h1 className="text-[18px] font-extrabold text-ink">{t('deactivated.title')}</h1>
        <p className="mt-2 text-[14px] leading-relaxed text-ink-2">{t('deactivated.text')}</p>
        <Button variant="secondary" className="mt-6" onClick={() => void signOut()}>
          {t('deactivated.signOut')}
        </Button>
      </div>
    </main>
  )
}
