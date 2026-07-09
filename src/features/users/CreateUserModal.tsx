import { useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { Copy, RefreshCw } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import type { UserStatus } from '@/types'
import { normalizeLogin } from '@/lib/loginEmail'
import { generatePassword } from '@/lib/generatePassword'
import { toast } from '@/lib/toast'
import { useT } from '@/i18n/useT'
import { useCreateUser } from './useCreateUser'

const PHONE_PREFIX = '+992 '

const EMPTY = {
  full_name: '',
  phone: PHONE_PREFIX,
  login: '',
  password: '',
  business_direction: '',
  status: 'active' as UserStatus,
}

export function CreateUserModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { t } = useT()
  const createUser = useCreateUser()
  const [form, setForm] = useState(EMPTY)
  const [clientError, setClientError] = useState<string | null>(null)

  const field =
    (key: keyof typeof EMPTY) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))

  function close() {
    createUser.reset()
    setForm(EMPTY)
    setClientError(null)
    onClose()
  }

  function genPassword() {
    setForm((f) => ({ ...f, password: generatePassword(12) }))
    setClientError(null)
  }

  async function copyPassword() {
    if (!form.password) return
    try {
      await navigator.clipboard.writeText(form.password)
      toast.success(t('usercard.passwordCopied'))
    } catch {
      /* буфер обмена недоступен — молча */
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setClientError(null)
    if (!form.full_name.trim()) return
    if (!/^\+992\s?\d{6,}/.test(form.phone.trim())) {
      setClientError(t('usercard.phoneError'))
      return
    }
    if (form.login.length < 3) {
      setClientError(t('usercard.loginError'))
      return
    }
    if (form.password.length < 6) {
      setClientError(t('usercard.passwordMinError'))
      return
    }
    createUser.mutate(
      {
        full_name: form.full_name.trim(),
        phone: form.phone.trim(),
        login: form.login.trim(),
        password: form.password,
        business_direction: form.business_direction.trim() || undefined,
        status: form.status,
      },
      {
        onSuccess: () => {
          toast.success(t('common.created'))
          setForm(EMPTY)
          onClose()
        },
      },
    )
  }

  return (
    <Modal open={open} onClose={close} title={t('usercard.createTitle')}>
      <form className="space-y-3.5" onSubmit={handleSubmit}>
        <Labeled label={t('usercard.fieldFullNameReq')}>
          <Input value={form.full_name} onChange={field('full_name')} required placeholder={t('usercard.fullNamePlaceholder')} />
        </Labeled>
        <Labeled label={t('usercard.fieldPhoneReq')}>
          <Input
            value={form.phone}
            onChange={field('phone')}
            required
            inputMode="tel"
            placeholder="+992 90 123 45 67"
          />
        </Labeled>
        <Labeled label={t('usercard.fieldLoginReq')}>
          <Input
            value={form.login}
            onChange={(e) => {
              setClientError(null)
              setForm((f) => ({ ...f, login: normalizeLogin(e.target.value) }))
            }}
            required
            placeholder={t('usercard.loginPlaceholder')}
            autoComplete="off"
          />
          <p className="mt-1 text-[11px] leading-snug text-ink-3">
            {t('usercard.loginHint')}
          </p>
        </Labeled>
        <Labeled label={t('usercard.fieldPasswordReq')}>
          <div className="flex items-stretch gap-2">
            <Input
              type="text"
              value={form.password}
              onChange={field('password')}
              required
              placeholder={t('usercard.passwordPlaceholder')}
              className="flex-1"
            />
            <button
              type="button"
              onClick={genPassword}
              title={t('usercard.genPassword')}
              aria-label={t('usercard.genPassword')}
              className="flex w-11 shrink-0 items-center justify-center rounded-[13px] border border-line-strong bg-surface text-ink-2 shadow-card transition-colors hover:bg-accent-soft hover:text-accent"
            >
              <RefreshCw size={16} />
            </button>
            <button
              type="button"
              onClick={copyPassword}
              disabled={!form.password}
              title={t('usercard.copyPassword')}
              aria-label={t('usercard.copyPassword')}
              className="flex w-11 shrink-0 items-center justify-center rounded-[13px] border border-line-strong bg-surface text-ink-2 shadow-card transition-colors hover:bg-surface-2 hover:text-ink disabled:opacity-50"
            >
              <Copy size={16} />
            </button>
          </div>
          <p className="mt-1 text-[11px] leading-snug text-ink-3">{t('usercard.passwordGenHint')}</p>
        </Labeled>
        <Labeled label={t('usercard.fieldBusinessDir')}>
          <Input value={form.business_direction} onChange={field('business_direction')} placeholder={t('usercard.businessDirPlaceholder')} />
        </Labeled>
        <Labeled label={t('usercard.fieldStatus')}>
          <Select value={form.status} onChange={field('status')}>
            <option value="active">{t('userStatus.active')}</option>
            <option value="paused">{t('userStatus.paused')}</option>
            <option value="archived">{t('userStatus.archived')}</option>
          </Select>
        </Labeled>

        {(clientError || createUser.isError) && (
          <p className="rounded-[12px] bg-danger-soft px-3.5 py-2.5 text-[13px] font-medium text-danger">
            {clientError ??
              (createUser.error instanceof Error
                ? createUser.error.message
                : t('usercard.createError'))}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={close}>{t('common.cancel')}</Button>
          <Button type="submit" loading={createUser.isPending}>{t('usercard.create')}</Button>
        </div>
      </form>
    </Modal>
  )
}

function Labeled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-[12.5px] font-semibold text-ink-2">{label}</span>
      {children}
    </label>
  )
}
