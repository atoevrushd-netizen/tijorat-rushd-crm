import { Link } from 'react-router-dom'
import { useT } from '@/i18n/useT'

export function NotFoundPage() {
  const { t } = useT()
  return (
    <main className="flex min-h-full flex-col items-center justify-center px-4 text-center">
      <p className="font-mono text-5xl font-bold text-ink">404</p>
      <p className="mt-2 text-ink-2">{t('notFound.text')}</p>
      <div className="mt-6 flex items-center gap-5">
        <Link
          to="/"
          className="text-sm font-medium text-accent underline underline-offset-4"
        >
          {t('notFound.home')}
        </Link>
        <Link
          to="/login"
          className="text-sm text-ink-3 underline underline-offset-4 hover:text-ink-2"
        >
          {t('notFound.login')}
        </Link>
      </div>
    </main>
  )
}
