import { useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import type { UserStatus } from '@/types'
import { normalizeLogin } from '@/lib/loginEmail'
import { useT } from '@/i18n/useT'
import { useCreateUser } from './useCreateUser'

const EMPTY = {
  full_name: '',
  phone: '',
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

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setClientError(null)
    if (!form.full_name.trim()) return
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
          setForm(EMPTY)
          onClose()
        },
      },
    )
  }

  return (
    <Modal open={open} onClose={close} title={t('usercard.createTitle')}>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <Labeled label={t('usercard.fieldFullNameReq')}>
          <Input value={form.full_name} onChange={field('full_name')} required placeholder={t('usercard.fullNamePlaceholder')} />
        </Labeled>
        <Labeled label={t('usercard.fieldPhoneReq')}>
          <Input value={form.phone} onChange={field('phone')} required placeholder={t('usercard.phonePlaceholder')} />
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
          <p className="text-[11px] text-ink-3">
            {t('usercard.loginHint')}
          </p>
        </Labeled>
        <Labeled label={t('usercard.fieldPasswordReq')}>
          <Input type="text" value={form.password} onChange={field('password')} required placeholder={t('usercard.passwordPlaceholder')} />
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
          <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
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
