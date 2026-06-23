import { useState, type FormEvent } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
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
    setPwd.mutate({ userId, password }, { onSuccess: () => setDone(true) })
  }

  return (
    <Modal open={open} onClose={close} title="Сменить пароль">
      {done ? (
        <div className="space-y-3">
          <p className="rounded-md bg-accent-soft px-3 py-2 text-sm text-accent">
            Пароль для «{userName}» изменён. Передайте новый пароль пользователю.
          </p>
          <div className="rounded-md bg-surface-3 px-3 py-2 font-mono text-sm text-ink">
            {password}
          </div>
          <div className="flex justify-end">
            <Button onClick={close}>Готово</Button>
          </div>
        </div>
      ) : (
        <form className="space-y-3" onSubmit={submit}>
          <p className="text-sm text-ink-2">
            Задайте новый пароль для «{userName}». Он сразу отобразится в карточке
            пользователя.
          </p>
          <Input
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="новый пароль (не короче 6 символов)"
            required
          />
          {setPwd.isError && (
            <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
              {setPwd.error instanceof Error ? setPwd.error.message : 'Не удалось сменить пароль'}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={close}>Отмена</Button>
            <Button type="submit" loading={setPwd.isPending} disabled={password.length < 6}>
              Сменить
            </Button>
          </div>
        </form>
      )}
    </Modal>
  )
}
