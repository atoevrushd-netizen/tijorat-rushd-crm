import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from 'react'
import type { Profile, UserStatus } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { useUpdateUser } from './useUpdateUser'

const EMPTY = {
  full_name: '',
  phone: '',
  business_direction: '',
  status: 'active' as UserStatus,
  admin_comment: '',
  subscription_start: '',
  subscription_end: '',
}

export function EditUserModal({
  user,
  onClose,
}: {
  user: Profile | null
  onClose: () => void
}) {
  const update = useUpdateUser()
  const [form, setForm] = useState(EMPTY)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    setForm({
      full_name: user.full_name ?? '',
      phone: user.phone ?? '',
      business_direction: user.business_direction ?? '',
      status: user.status,
      admin_comment: user.admin_comment ?? '',
      subscription_start: user.subscription_start ?? '',
      subscription_end: user.subscription_end ?? '',
    })
    setFile(null)
    setPreview(null)
  }, [user])

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  const field =
    (key: keyof typeof EMPTY) =>
    (
      e: ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) =>
      setForm((f) => ({ ...f, [key]: e.target.value }))

  function onFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    setFile(f)
    setPreview(f ? URL.createObjectURL(f) : null)
  }

  function close() {
    update.reset()
    onClose()
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    update.mutate(
      {
        id: user.id,
        patch: {
          full_name: form.full_name.trim(),
          phone: form.phone.trim(),
          business_direction: form.business_direction.trim() || null,
          status: form.status,
          admin_comment: form.admin_comment.trim() || null,
          subscription_start: form.subscription_start || null,
          subscription_end: form.subscription_end || null,
        },
        file,
      },
      { onSuccess: onClose },
    )
  }

  return (
    <Modal open={!!user} onClose={close} title="Редактировать пользователя">
      <form className="space-y-3" onSubmit={handleSubmit}>
        <div className="flex items-center gap-3">
          <Avatar name={form.full_name} src={preview ?? user?.photo_url} size={56} />
          <label className="cursor-pointer text-sm">
            <span className="rounded-lg border border-line-strong px-3 py-1.5 text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink">
              Загрузить фото
            </span>
            <input type="file" accept="image/*" className="hidden" onChange={onFile} />
          </label>
        </div>

        <Labeled label="Имя и фамилия">
          <Input value={form.full_name} onChange={field('full_name')} />
        </Labeled>
        <Labeled label="Телефон">
          <Input value={form.phone} onChange={field('phone')} />
        </Labeled>
        <Labeled label="Направление бизнеса">
          <Input value={form.business_direction} onChange={field('business_direction')} />
        </Labeled>
        <Labeled label="Статус">
          <Select value={form.status} onChange={field('status')}>
            <option value="active">Активен</option>
            <option value="paused">На паузе</option>
            <option value="archived">В архиве</option>
          </Select>
        </Labeled>
        <div className="grid grid-cols-2 gap-3">
          <Labeled label="Подписка с">
            <Input type="date" value={form.subscription_start} onChange={field('subscription_start')} />
          </Labeled>
          <Labeled label="Подписка по">
            <Input type="date" value={form.subscription_end} onChange={field('subscription_end')} />
          </Labeled>
        </div>
        <Labeled label="Комментарий администратора">
          <Textarea value={form.admin_comment} onChange={field('admin_comment')} rows={2} />
        </Labeled>

        {update.isError && (
          <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
            {update.error instanceof Error ? update.error.message : 'Не удалось сохранить'}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={close}>Отмена</Button>
          <Button type="submit" loading={update.isPending}>Сохранить</Button>
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
