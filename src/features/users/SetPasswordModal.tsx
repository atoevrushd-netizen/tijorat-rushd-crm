import { useState, type FormEvent } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { toast } from '@/lib/toast'
import { useT } from '@/i18n/useT'
import { useSetPassword } from './useSetPassword'

export function SetPasswordModal({
  userId,
  userName,
  open,
  onClose,
}: {
  userId: string
  userName: string
  open: boolean
  onClose: () => void
}) {
  const { t } = useT()
  const setPwd = useSetPassword()
  const [password, setPassword] = useState('')
  const [done, setDone] = useState(false)

  function close() {
    setPwd.reset()
    setPassword('')
    setDone(false)
    onClose()
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    if (password.length < 6) return
    setPwd.mutate(
      { userId, password },
      {
        onSuccess: () => {
          toast.success(t('common.saved'))
          setDone(true)
        },
      },
    )
  }

  return (
    <Modal open={open} onClose={close} title={t('usercard.changePassword')}>
      {done ? (
        <div className="space-y-3">
          <p className="rounded-md bg-accent-soft px-3 py-2 text-sm text-accent">
            {t('usercard.pwdChanged').replace('{name}', userName)}
          </p>
          <div className="rounded-md bg-surface-3 px-3 py-2 font-mono text-sm text-ink">
            {password}
          </div>
          <div className="flex justify-end">
            <Button onClick={close}>{t('usercard.done')}</Button>
          </div>
        </div>
      ) : (
        <form className="space-y-3" onSubmit={submit}>
          <p className="text-sm text-ink-2">
            {t('usercard.pwdSetHint').replace('{name}', userName)}
          </p>
          <Input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('usercard.newPasswordPlaceholder')}
            required
          />
          {setPwd.isError && (
            <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
              {setPwd.error instanceof Error ? setPwd.error.message : t('usercard.pwdError')}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={close}>{t('common.cancel')}</Button>
            <Button type="submit" loading={setPwd.isPending} disabled={password.length < 6}>
              {t('usercard.changePasswordShort')}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
