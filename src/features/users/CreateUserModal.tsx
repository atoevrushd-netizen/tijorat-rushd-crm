import { useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import type { UserStatus } from '@/types'
import { normalizeLogin } from '@/lib/loginEmail'
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
      setClientError(
        'Логин — латиницей (буквы a-z, цифры), минимум 3 символа. Например: malik99',
      )
      return
    }
    if (form.password.length < 6) {
      setClientError('Пароль — не короче 6 символов')
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
    <Modal open={open} onClose={close} title="Новый пользователь">
      <form className="space-y-3" onSubmit={handleSubmit}>
        <Labeled label="Имя и фамилия *">
          <Input value={form.full_name} onChange={field('full_name')} required placeholder="Иван Иванов" />
        </Labeled>
        <Labeled label="Телефон *">
          <Input value={form.phone} onChange={field('phone')} required placeholder="+992 ..." />
        </Labeled>
        <Labeled label="Логин (для входа) *">
          <Input
            value={form.login}
            onChange={(e) => {
              setClientError(null)
              setForm((f) => ({ ...f, login: normalizeLogin(e.target.value) }))
            }}
            required
            placeholder="например, malik99"
            autoComplete="off"
          />
          <p className="text-[11px] text-ink-3">
            Латиницей: a-z, цифры, точка, дефис (кириллица не подойдёт)
          </p>
        </Labeled>
        <Labeled label="Пароль *">
          <Input type="text" value={form.password} onChange={field('password')} required placeholder="не короче 6 символов" />
        </Labeled>
        <Labeled label="Направление бизнеса">
          <Input value={form.business_direction} onChange={field('business_direction')} placeholder="Маркетинг" />
        </Labeled>
        <Labeled label="Статус">
          <Select value={form.status} onChange={field('status')}>
            <option value="active">Активен</option>
            <option value="paused">На паузе</option>
            <option value="archived">В архиве</option>
          </Select>
        </Labeled>

        {(clientError || createUser.isError) && (
          <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
            {clientError ??
              (createUser.error instanceof Error
                ? createUser.error.message
                : 'Не удалось создать пользователя')}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={close}>Отмена</Button>
          <Button type="submit" loading={createUser.isPending}>Создать</Button>
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
