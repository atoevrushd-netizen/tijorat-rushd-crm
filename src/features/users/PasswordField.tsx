import { useState } from 'react'
import { Check, Copy, Eye, EyeOff } from 'lucide-react'
import { useUserPassword } from './usePassword'

/**
 * Поле «Пароль» в карточке: показывает выданный пароль открыто (по клику на глаз).
 * Виден только администратору (RLS на user_credentials).
 */
export function PasswordField({ userId }: { userId: string }) {
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
    <div>
      <dt className="font-mono text-[11px] uppercase tracking-wide text-ink-3">
        Пароль
      </dt>
      <dd className="mt-0.5 text-ink">
        {isLoading ? (
          '…'
        ) : password ? (
          <span className="inline-flex items-center gap-2">
            <span className="font-mono">
              {show ? password : '•'.repeat(Math.min(password.length, 10))}
            </span>
            <button
              type="button"
              aria-label={show ? 'Скрыть пароль' : 'Показать пароль'}
              onClick={() => setShow((s) => !s)}
              className="text-ink-3 transition-colors hover:text-accent"
            >
              {show ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
            <button
              type="button"
              aria-label="Скопировать пароль"
              onClick={copy}
              className="text-ink-3 transition-colors hover:text-accent"
            >
              {copied ? <Check size={15} className="text-accent" /> : <Copy size={15} />}
            </button>
          </span>
        ) : (
          <span className="text-ink-3">— (задайте через «Сменить пароль»)</span>
        )}
      </dd>
    </div>
  )
}
