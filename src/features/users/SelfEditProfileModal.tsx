import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import { useAuth } from '@/features/auth/useAuth'
import { toast } from '@/lib/toast'
import { useT } from '@/i18n/useT'
import { saveUser } from './api'

/** Самостоятельное редактирование своего профиля: фото, имя, телефон. */
export function SelfEditProfileModal({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const { t } = useT()
  const { profile, refreshProfile } = useAuth()
  const queryClient = useQueryClient()
  const save = useMutation({ mutationFn: saveUser })
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !profile) return
    setFullName(profile.full_name ?? '')
    setPhone(profile.phone ?? '')
    setFile(null)
    setPreview(null)
  }, [open, profile])

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview)
    }
  }, [preview])

  function onFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    setFile(f)
    setPreview(f ? URL.createObjectURL(f) : null)
  }

  function close() {
    save.reset()
    onClose()
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!profile) return
    save.mutate(
      {
        id: profile.id,
        patch: { full_name: fullName.trim(), phone: phone.trim() },
        file,
      },
      {
        onSuccess: async () => {
          await refreshProfile()
          void queryClient.invalidateQueries({ queryKey: ['users'] })
          void queryClient.invalidateQueries({ queryKey: ['user', profile.id] })
          toast.success(t('common.saved'))
          onClose()
        },
      },
    )
  }

  if (!profile) return null

  return (
    <Modal open={open} onClose={close} title={t('usercard.selfEditTitle')}>
      <form className="space-y-3.5" onSubmit={submit}>
        <div className="flex items-center gap-3.5 rounded-[14px] bg-surface-2 p-3">
          <Avatar name={fullName} src={preview ?? profile.photo_url} size={56} />
          <label className="cursor-pointer text-sm">
            <span className="inline-flex items-center rounded-[11px] border border-line-strong bg-surface px-3.5 py-2 font-medium text-ink-2 shadow-card transition-colors hover:bg-surface-2 hover:text-ink">
              {t('usercard.changePhoto')}
            </span>
            <input type="file" accept="image/*" className="hidden" onChange={onFile} />
          </label>
        </div>

        <Labeled label={t('usercard.fieldFullName')}>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </Labeled>
        <Labeled label={t('usercard.fieldPhone')}>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </Labeled>

        {save.isError && (
          <p className="rounded-[12px] bg-danger-soft px-3.5 py-2.5 text-[13px] font-medium text-danger">
            {save.error instanceof Error ? save.error.message : t('usercard.saveError')}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={close}>{t('common.cancel')}</Button>
          <Button type="submit" loading={save.isPending}>{t('common.save')}</Button>
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
