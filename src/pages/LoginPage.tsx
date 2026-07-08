import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { Logo } from '@/components/brand/Logo'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/features/auth/useAuth'
import { useT } from '@/i18n/useT'
import { identifierToEmail } from '@/lib/loginEmail'

/**
 * Страница входа: логин (или email для старых аккаунтов) + пароль, и вход через Google.
 * Логин превращается в синтетический email для Supabase Auth (см. lib/loginEmail).
 */
export function LoginPage() {
  const { status, signInWithPassword } = useAuth()
  const { t } = useT()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (status === 'authenticated') return <Navigate to="/" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await signInWithPassword(identifierToEmail(identifier.trim()), password)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.error'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="relative flex min-h-full items-center justify-center overflow-hidden px-4 py-10">
      {/* Мягкие градиентные пятна за карточкой — премиальная глубина фона */}
      <div className="pointer-events-none absolute -top-28 left-1/2 h-72 w-[38rem] -translate-x-1/2 rounded-full bg-hero-grad opacity-[0.18] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -right-16 h-64 w-64 rounded-full bg-accent-grad opacity-[0.12] blur-3xl" />

      <div className="relative z-10 w-full max-w-sm rounded-[22px] border border-line bg-surface p-8 shadow-sh2 sm:p-9">
        <div className="flex flex-col items-center text-center">
          {/* Логотип белый — на светлой теме показываем его на чипе с океановым градиентом */}
          <span className="flex h-14 w-14 items-center justify-center rounded-[16px] bg-accent-grad shadow-glow">
            <Logo size={30} />
          </span>
          <h1 className="mt-5 text-[24px] font-bold tracking-tight text-ink">Tijorat &amp; Rushd CRM</h1>
          <p className="mt-1.5 text-[13.5px] text-ink-2">{t('auth.subtitle')}</p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label htmlFor="login" className="text-[12.5px] font-semibold text-ink-2">
              {t('auth.login')}
            </label>
            <Input
              id="login"
              variant="box"
              type="text"
              autoComplete="username"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder={t('auth.loginPlaceholder')}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-[12.5px] font-semibold text-ink-2">
              {t('auth.password')}
            </label>
            <Input
              id="password"
              variant="box"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="rounded-[12px] bg-danger-soft px-3.5 py-2.5 text-[13px] font-medium text-danger">
              {error}
            </p>
          )}

          <Button type="submit" loading={submitting} size="lg" className="mt-1 w-full">
            {t('auth.submit')}
          </Button>
        </form>
      </div>
    </main>
  )
}
