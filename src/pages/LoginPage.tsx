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

// Фон логина лежит в public/bg.jpg. BASE_URL учитывает базовый путь GitHub Pages.
const BG_URL = `${import.meta.env.BASE_URL}bg.jpg`

// Стеклянные поля ввода: полупрозрачный белый, тёмный текст, мягкое кольцо фокуса.
// Фиксированные цвета (не токены темы) — карточка одинаково хороша в любой теме.
const GLASS_FIELD =
  '!rounded-2xl !border-white/70 !bg-white/65 !text-slate-900 placeholder:!text-slate-400 ' +
  'backdrop-blur-sm focus:!border-white focus:!shadow-[0_0_0_4px_rgba(255,255,255,0.5)]'

/**
 * Страница входа: логин (превращается в синтетический email) + пароль.
 * Подача — обои bg.jpg + «стеклянная» карточка (backdrop-blur, эффект линзы).
 * Стиль намеренно фиксирован (светлое стекло на фото) и не зависит от темы.
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
    <main
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-sky-100 bg-cover bg-center px-4 py-10"
      style={{ backgroundImage: `url(${BG_URL})` }}
    >
      {/* Лёгкий скрим: сверху светлее, снизу чуть темнее — для контраста карточки и подписи */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-slate-900/25" />

      <div className="relative w-full max-w-[420px]">
        {/* ── Стеклянная карточка ── */}
        <div className="relative overflow-hidden rounded-[28px] border border-white/50 bg-white/25 p-7 shadow-[0_24px_70px_-20px_rgba(12,38,86,0.55)] ring-1 ring-inset ring-white/25 backdrop-blur-xl backdrop-saturate-150 sm:p-9">
          {/* Эффект линзы: блик по верхнему краю */}
          <div className="pointer-events-none absolute inset-x-6 -top-px h-px bg-gradient-to-r from-transparent via-white/90 to-transparent" />
          {/* Мягкие преломляющие сияния */}
          <div className="pointer-events-none absolute -right-16 -top-24 h-56 w-56 rounded-full bg-white/45 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-20 h-48 w-48 rounded-full bg-sky-200/50 blur-3xl" />
          {/* Диагональный глянцевый отблеск стекла */}
          <div className="pointer-events-none absolute -inset-x-8 -top-10 h-40 rotate-[-8deg] bg-gradient-to-r from-transparent via-white/25 to-transparent blur-md" />

          <div className="relative">
            {/* Бренд */}
            <div className="flex flex-col items-center text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-accent-grad shadow-glow ring-1 ring-white/50">
                <Logo size={34} />
              </span>
              <h1 className="mt-4 text-[22px] font-extrabold tracking-tight text-slate-900">
                Tijorat &amp; Rushd CRM
              </h1>
              <p className="mt-1.5 text-[13.5px] font-medium text-slate-600">
                {t('auth.subtitle')}
              </p>
            </div>

            <form className="mt-7 space-y-4" onSubmit={handleSubmit} noValidate>
              <div className="space-y-1.5">
                <label htmlFor="login" className="text-[12.5px] font-semibold text-slate-700">
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
                  className={GLASS_FIELD}
                />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="text-[12.5px] font-semibold text-slate-700">
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
                  className={GLASS_FIELD}
                  toggleClassName="!text-slate-500 hover:!bg-white/60 hover:!text-slate-800"
                />
              </div>

              {error && (
                <p
                  role="alert"
                  aria-live="assertive"
                  className="rounded-[12px] border border-red-500/30 bg-red-500/15 px-3.5 py-2.5 text-[13px] font-semibold text-red-700 backdrop-blur-sm"
                >
                  {error}
                </p>
              )}

              <Button
                type="submit"
                loading={submitting}
                size="lg"
                leftIcon={<LogIn size={18} />}
                className="mt-1 w-full shadow-glow"
              >
                {submitting ? t('auth.signingIn') : t('auth.submit')}
              </Button>

              <p className="pt-1 text-center text-[12.5px] font-medium text-slate-600">
                {t('auth.forgot')}
              </p>
            </form>
          </div>
        </div>

        {/* Подпись под карточкой поверх фото */}
        <p className="mt-5 text-center font-mono text-[11px] uppercase tracking-[0.25em] text-white/85 [text-shadow:_0_1px_10px_rgba(0,0,0,0.4)]">
          Tijorat &amp; Rushd · CRM
        </p>
      </div>
    </main>
  )
}
