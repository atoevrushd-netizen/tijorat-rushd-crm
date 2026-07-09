import { useState, type FormEvent, type ReactNode } from 'react'
import { useMutation } from '@tanstack/react-query'
import { KeyRound } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { toast } from '@/lib/toast'
import { useT } from '@/i18n/useT'
import { changeOwnPassword } from '@/features/auth/changePassword'
import { Section } from './SettingsUI'

/** Смена собственного пароля (знаю старый → задаю новый). Для лида и админа. */
export function ChangePasswordSection() {
  const { t } = useT()
  const [oldP, setOldP] = useState('')
  const [newP, setNewP] = useState('')
  const [confirm, setConfirm] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const m = useMutation({ mutationFn: () => changeOwnPassword(oldP, newP) })

  function submit(e: FormEvent) {
    e.preventDefault()
    setErr(null)
    if (newP.length < 6) return setErr(t('settings.pwdMinError'))
    if (newP !== confirm) return setErr(t('settings.pwdMismatch'))
    m.mutate(undefined, {
      onSuccess: () => {
        toast.success(t('settings.pwdChanged'))
        setOldP('')
        setNewP('')
        setConfirm('')
      },
      onError: (e2) => setErr(e2 instanceof Error ? e2.message : t('settings.pwdError')),
    })
  }

  return (
    <Section icon={<KeyRound size={16} />} title={t('settings.changePassword')}>
      <form className="space-y-3" onSubmit={submit}>
        <Field label={t('settings.oldPassword')}>
          <PasswordInput
            value={oldP}
            onChange={(e) => setOldP(e.target.value)}
            autoComplete="current-password"
            required
          />
        </Field>
        <Field label={t('settings.newPassword')}>
          <PasswordInput
            value={newP}
            onChange={(e) => setNewP(e.target.value)}
            autoComplete="new-password"
            required
          />
        </Field>
        <Field label={t('settings.confirmPassword')}>
          <PasswordInput
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
          />
        </Field>

        {err && (
          <p className="rounded-[12px] bg-danger-soft px-3.5 py-2.5 text-[13px] font-medium text-danger">
            {err}
          </p>
        )}

        <div className="flex justify-end pt-1">
          <Button type="submit" loading={m.isPending} disabled={!oldP || !newP || !confirm}>
            {t('settings.savePassword')}
          </Button>
        </div>
      </form>
    </Section>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-[12.5px] font-semibold text-ink-2">{label}</span>
      {children}
    </label>
  )
}
