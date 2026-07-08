import { useState } from 'react'
import { Check, Copy, Eye, EyeOff } from 'lucide-react'
import { useT } from '@/i18n/useT'
import { useUserPassword } from './usePassword'

/**
 * Поле «Пароль» в карточке: показывает выданный пароль открыто (по клику на глаз).
 * Виден только администратору (RLS на user_credentials).
 */
export function PasswordField({ userId }: { userId: string }) {
  const { t } = useT()
  const { data: password, isLoading } = useUserPassword(userId)
  const [show, setShow] = useState(false)
  const [copied, setCopied] = useState(false)

  function copy() {
    if (!password) return
    void navigator.clipboard?.writeText(password)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="rounded-[12px] bg-surface-2 px-3.5 py-3">
      <dt className="font-mono text-[11px] uppercase tracking-wide text-ink-3">
        {t('usercard.fieldPassword')}
      </dt>
      <dd className="mt-1 font-medium text-ink">
        {isLoading ? (
          '…'
        ) : password ? (
          <span className="inline-flex items-center gap-2">
            <span className="font-mono">
              {show ? password : '•'.repeat(Math.min(password.length, 10))}
            </span>
            <button
              type="button"
              aria-label={show ? t('usercard.hidePassword') : t('usercard.showPassword')}
              onClick={() => setShow((s) => !s)}
              className="flex h-7 w-7 items-center justify-center rounded-[9px] text-ink-3 transition-colors hover:bg-surface-3 hover:text-accent"
            >
              {show ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
            <button
              type="button"
              aria-label={t('usercard.copyPassword')}
              onClick={copy}
              className="flex h-7 w-7 items-center justify-center rounded-[9px] text-ink-3 transition-colors hover:bg-surface-3 hover:text-accent"
            >
              {copied ? <Check size={15} className="text-accent" /> : <Copy size={15} />}
            </button>
          </span>
        ) : (
          <span className="text-ink-3">{t('usercard.passwordEmpty')}</span>
        )}
      </dd>
    </div>
  )
}
