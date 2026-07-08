import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarClock, Database, Download, ShieldCheck, UserCog } from 'lucide-react'
import { useAuth } from '@/features/auth/useAuth'
import { useT } from '@/i18n/useT'
import { Button } from '@/components/ui/Button'
import { SelfEditProfileModal } from '@/features/users/SelfEditProfileModal'
import { buildBackup, downloadBackup } from './exportData'
import { Row, Section } from './SettingsUI'

/** Подробные настройки администратора: профиль + бэкапы/данные. */
export function AdminSettings() {
  const { profile } = useAuth()
  const { t } = useT()
  const [editOpen, setEditOpen] = useState(false)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  async function onBackup() {
    setBusy(true)
    setMsg(null)
    try {
      const backup = await buildBackup()
      downloadBackup(backup)
      const total = Object.values(backup.counts).reduce((a, n) => a + n, 0)
      setMsg({
        ok: true,
        text: t('settings.backupDone')
          .replace('{leads}', String(backup.counts.leads ?? 0))
          .replace('{profiles}', String(backup.counts.profiles ?? 0))
          .replace('{tasks}', String(backup.counts.tasks ?? 0))
          .replace('{total}', String(total)),
      })
    } catch (e) {
      setMsg({
        ok: false,
        text: e instanceof Error ? e.message : t('settings.backupFail'),
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <Section
        icon={<UserCog size={15} />}
        title={t('settings.adminProfile')}
        action={
          <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
            {t('settings.edit')}
          </Button>
        }
      >
        <Row label={t('settings.name')} value={profile?.full_name} />
        <Row label={t('settings.login')} value={profile?.login ?? profile?.email} />
      </Section>

      <Section icon={<CalendarClock size={15} />} title={t('page.autotasks')}>
        <p className="mb-3 text-[13px] text-ink-2">{t('at.hint')}</p>
        <Link
          to="/admin/auto-tasks"
          className="inline-flex items-center gap-2 rounded-[13px] bg-accent-grad px-[22px] py-3 text-[15px] font-semibold text-on-accent shadow-glow transition-all duration-150 ease-ios hover:brightness-[1.06] active:scale-[.96] active:brightness-95"
        >
          {t('at.open')}
        </Link>
      </Section>

      <Section icon={<Database size={15} />} title={t('settings.dataBackups')}>
        <p className="mb-3 text-[13px] text-ink-2">
          {t('settings.backupDesc1')}
          <b>{t('settings.backupDescAll')}</b>
          {t('settings.backupDesc2')}
        </p>
        <Button leftIcon={<Download size={15} />} onClick={onBackup} loading={busy}>
          {t('settings.createBackup')}
        </Button>
        {msg && (
          <p
            className={
              'mt-3 rounded-[12px] px-3.5 py-2.5 text-sm font-medium ' +
              (msg.ok ? 'bg-success-soft text-success' : 'bg-danger-soft text-danger')
            }
          >
            {msg.text}
          </p>
        )}
        <p className="mt-3 text-[12px] text-ink-3">{t('settings.backupWarn')}</p>
      </Section>

      <Section icon={<ShieldCheck size={15} />} title={t('settings.importTrash')}>
        <p className="text-[13px] text-ink-3">{t('settings.importTrashDesc')}</p>
      </Section>

      <SelfEditProfileModal open={editOpen} onClose={() => setEditOpen(false)} />
    </div>
  )
}
