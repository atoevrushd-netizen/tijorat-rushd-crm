import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { Logo } from '@/components/brand/Logo'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/features/auth/useAuth'
import { authErrorMessage } from '@/features/auth/authError'
import { useT } from '@/i18n/useT'
import { identifierToEmail } from '@/lib/loginEmail'

/**
 * Страница входа: логин (превращается в синтетический email) + пароль.
 * Премиальная светлая подача: градиентный герой-блок слева (десктоп) + форма.
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
      setError(authErrorMessage(err, t))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="relative flex min-h-full items-center justify-center overflow-hidden px-4 py-8">
      {/* Фоновые градиентные пятна — премиальная глубина */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[46rem] -translate-x-1/2 rounded-full bg-hero-grad opacity-[0.16] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-24 h-72 w-72 rounded-full bg-accent-grad opacity-[0.12] blur-3xl" />
      <div className="pointer-events-none absolute -left-24 top-1/3 h-64 w-64 rounded-full bg-accent-grad opacity-[0.08] blur-3xl" />

      <div className="relative z-10 grid w-full max-w-4xl overflow-hidden rounded-[26px] border border-line bg-surface shadow-sh2 lg:grid-cols-[1.05fr_1fr]">
        {/* Левый герой-блок с океановым градиентом — только на десктопе */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-hero-grad p-10 text-on-accent lg:flex">
          <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/15 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-10 h-52 w-52 rounded-full bg-white/10 blur-2xl" />
          <div className="relative flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-white/20 backdrop-blur-sm">
              <Logo size={26} />
            </span>
            <span className="text-[15px] font-extrabold tracking-tight">Tijorat &amp; Rushd</span>
          </div>
          <div className="relative">
            <div className="text-[30px] font-extrabold leading-tight tracking-tight">
              {t('auth.welcome')} 👋
            </div>
            <p className="mt-3 max-w-xs text-[14px] leading-relaxed text-white/80">
              {t('auth.tagline')}
            </p>
          </div>
          <div className="relative font-mono text-[11px] uppercase tracking-[.2em] text-white/50">
            Tijorat &amp; Rushd · CRM
          </div>
        </div>

        {/* Форма входа */}
        <div className="p-7 sm:p-10">
          <div className="flex flex-col items-center text-center lg:hidden">
            <span className="flex h-14 w-14 items-center justify-center rounded-[16px] bg-accent-grad shadow-glow">
              <Logo size={30} />
            </span>
            <h1 className="mt-4 text-[22px] font-bold tracking-tight text-ink">
              Tijorat &amp; Rushd CRM
            </h1>
          </div>

          <div className="mb-7 mt-6 hidden lg:mb-8 lg:mt-0 lg:block">
            <h1 className="text-[24px] font-bold tracking-tight text-ink">{t('auth.subtitle')}</h1>
            <p className="mt-1.5 text-[13.5px] text-ink-2">{t('auth.tagline')}</p>
          </div>
          <p className="mb-6 text-center text-[13.5px] text-ink-2 lg:hidden">{t('auth.subtitle')}</p>

          <form className="space-y-4" onSubmit={handleSubmit} noValidate>
            <div className="space-y-1.5">
              <label htmlFor="login" className="text-[12.5px] font-semibold text-ink-2">
                {t('auth.login')}
              </label>
              <Input
                id="login"
                variant="box"
                type="text"
                autoComplete="username"
                autoFocus
                required
                aria-invalid={!!error}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder={t('auth.loginPlaceholder')}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-[12.5px] font-semibold text-ink-2">
                {t('auth.password')}
              </label>
              <PasswordInput
                id="password"
                autoComplete="current-password"
                required
                aria-invalid={!!error}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p
                role="alert"
                aria-live="assertive"
                className="rounded-[12px] bg-danger-soft px-3.5 py-2.5 text-[13px] font-medium text-danger"
              >
                {error}
              </p>
            )}

            <Button
              type="submit"
              loading={submitting}
              size="lg"
              leftIcon={<LogIn size={18} />}
              className="mt-1 w-full"
            >
              {submitting ? t('auth.signingIn') : t('auth.submit')}
            </Button>

            <p className="pt-1 text-center text-[12.5px] text-ink-3">{t('auth.forgot')}</p>
          </form>
        </div>
      </div>
    </main>
  )
}
