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
    <main className="flex min-h-full items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-8 shadow-sh2">
        <div className="flex flex-col items-center text-center">
          <Logo size={72} />
          <h1 className="mt-5 text-xl font-bold text-ink">Tijorat &amp; Rushd CRM</h1>
          <p className="mt-1 text-sm text-ink-2">{t('auth.subtitle')}</p>
        </div>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-1.5">
            <label htmlFor="login" className="text-[12.5px] font-semibold text-ink-2">
              {t('auth.login')}
            </label>
            <Input
              id="login"
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
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}

          <Button type="submit" loading={submitting} className="w-full">
            {t('auth.submit')}
          </Button>
        </form>
      </div>
    </main>
  )
}
