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
        text: `Бэкап создан и скачан: лидов ${backup.counts.leads ?? 0}, пользователей ${backup.counts.profiles ?? 0}, задач ${backup.counts.tasks ?? 0}; всего записей ${total}.`,
      })
    } catch (e) {
      setMsg({
        ok: false,
        text: e instanceof Error ? e.message : 'Не удалось создать бэкап',
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <Section
        icon={<UserCog size={15} />}
        title="Профиль администратора"
        action={
          <Button variant="secondary" size="sm" onClick={() => setEditOpen(true)}>
            Изменить
          </Button>
        }
      >
        <Row label="Имя" value={profile?.full_name} />
        <Row label="Логин" value={profile?.login ?? profile?.email} />
      </Section>

      <Section icon={<CalendarClock size={15} />} title={t('page.autotasks')}>
        <p className="mb-3 text-[13px] text-ink-2">{t('at.hint')}</p>
        <Link
          to="/admin/auto-tasks"
          className="inline-flex items-center gap-2 rounded-[14px] bg-accent px-[22px] py-3 text-[15px] font-semibold text-on-accent transition-all duration-150 ease-ios hover:bg-accent-600 active:scale-[.96]"
        >
          {t('at.open')}
        </Link>
      </Section>

      <Section icon={<Database size={15} />} title="Данные и бэкапы">
        <p className="mb-3 text-[13px] text-ink-2">
          Бэкап сохраняет <b>все</b> данные CRM в один файл: лиды, пользователи,
          задачи, вкладки, достижения, история действий и пароли. Скачайте его и
          храните в надёжном месте — так лиды и их данные не потеряются.
        </p>
        <Button leftIcon={<Download size={15} />} onClick={onBackup} loading={busy}>
          Создать бэкап
        </Button>
        {msg && (
          <p
            className={
              'mt-3 rounded-md px-3 py-2 text-sm ' +
              (msg.ok ? 'bg-accent-soft text-accent' : 'bg-danger-soft text-danger')
            }
          >
            {msg.text}
          </p>
        )}
        <p className="mt-3 text-[12px] text-ink-3">
          ⚠️ Делайте бэкап регулярно и перед массовыми изменениями. В файле есть
          пароли — храните его как секрет.
        </p>
      </Section>

      <Section icon={<ShieldCheck size={15} />} title="Импорт и Корзина">
        <p className="text-[13px] text-ink-3">
          Восстановление из бэкапа (безопасное слияние — ничего не удаляет) и
          «Корзина» удалённых лидов с возможностью восстановления — готовлю
          следующим шагом.
        </p>
      </Section>

      <SelfEditProfileModal open={editOpen} onClose={() => setEditOpen(false)} />
    </div>
  )
}
