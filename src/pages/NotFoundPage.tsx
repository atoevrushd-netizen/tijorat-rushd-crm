import { Link } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { useT } from '@/i18n/useT'

export function NotFoundPage() {
  const { t } = useT()
  return (
    <main className="relative flex min-h-full items-center justify-center overflow-hidden px-4 py-10">
      {/* Мягкое градиентное пятно фона */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[34rem] -translate-x-1/2 rounded-full bg-hero-grad opacity-[0.12] blur-3xl" />

      <div className="relative z-10 w-full max-w-sm rounded-[22px] border border-line bg-surface p-8 text-center shadow-sh1">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-[16px] bg-accent-soft text-accent">
          <Compass className="h-7 w-7" />
        </span>
        <p className="mt-5 font-mono text-[52px] font-bold leading-none tracking-tight text-ink">
          404
        </p>
        <p className="mt-3 text-[14px] text-ink-2">{t('notFound.text')}</p>

        <Link
          to="/"
          className="mt-6 inline-flex w-full items-center justify-center rounded-[13px] bg-accent-grad px-6 py-3 text-[15px] font-semibold text-on-accent shadow-glow transition-all duration-150 ease-ios hover:-translate-y-px hover:brightness-[1.06] active:translate-y-0 active:brightness-95"
        >
          {t('notFound.home')}
        </Link>
        <Link
          to="/login"
          className="mt-4 inline-block text-[13px] font-medium text-ink-3 underline underline-offset-4 transition-colors hover:text-ink-2"
        >
          {t('notFound.login')}
        </Link>
      </div>
    </main>
  )
}
