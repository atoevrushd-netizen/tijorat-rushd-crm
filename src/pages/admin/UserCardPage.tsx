import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { KeyRound, Trash2 } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { adminNav } from '@/components/layout/nav'
import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/Button'
import { FullPageSpinner } from '@/components/ui/FullPageSpinner'
import { formatDate } from '@/lib/utils'
import { toast } from '@/lib/toast'
import { confirm } from '@/lib/confirm'
import { useT } from '@/i18n/useT'
import { useUser } from '@/features/users/useUser'
import { useSoftDeleteUser } from '@/features/users/useUsers'
import { EditUserModal } from '@/features/users/EditUserModal'
import { SetPasswordModal } from '@/features/users/SetPasswordModal'
import { PasswordField } from '@/features/users/PasswordField'
import { AchievementsBlock } from '@/features/achievements/AchievementsBlock'
import { UserTabs } from '@/features/tabs/UserTabs'
import { ActivityFeed } from '@/features/activity-log/ActivityFeed'
import { SurveyPanel } from '@/features/survey/SurveyPanel'
import { RazborPanel } from '@/features/razbor/RazborPanel'

/** Карточка пользователя — «медкарта»: данные, вкладки, достижения, история. */
export function UserCardPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { t } = useT()
  const { data: user, isLoading } = useUser(id)
  const del = useSoftDeleteUser()
  const [editing, setEditing] = useState(false)
  const [pwdOpen, setPwdOpen] = useState(false)

  if (isLoading) return <FullPageSpinner />

  if (!user) {
    return (
      <AppShell title={t('page.userCard')} nav={adminNav}>
        <p className="text-center text-ink-2">
          {t('usercard.notFound')}{' '}
          <Link to="/admin" className="text-accent underline">
            {t('usercard.toList')}
          </Link>
        </p>
      </AppShell>
    )
  }

  return (
    <AppShell title={t('page.userCard')} nav={adminNav}>
      <div className="space-y-6">
        <Link
          to="/admin"
          className="inline-block text-sm text-ink-3 transition-colors hover:text-ink-2"
        >
          {t('users.backToList')}
        </Link>

        {/* Шапка */}
        <section className="rounded-xl border border-line bg-surface p-6">
          <div className="flex flex-wrap items-start gap-4">
            <Avatar name={user.full_name} src={user.photo_url} size={72} />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-xl font-bold text-ink">
                  {user.full_name || '—'}
                </h2>
                <StatusBadge status={user.status} />
              </div>
              <p className="mt-1 text-sm text-ink-2">
                {user.business_direction || t('usercard.noDirection')}
              </p>
            </div>
            <div className="flex w-full items-center gap-2 sm:w-auto sm:flex-col sm:items-stretch">
              <Button
                variant="secondary"
                className="flex-1 sm:flex-none"
                onClick={() => setEditing(true)}
              >
                {t('usercard.edit')}
              </Button>
              {/* На телефоне — иконки (без текста), на десктопе — текст */}
              <Button
                variant="secondary"
                aria-label={t('usercard.changePassword')}
                title={t('usercard.changePassword')}
                leftIcon={<KeyRound size={16} />}
                onClick={() => setPwdOpen(true)}
              >
                <span className="hidden sm:inline">{t('usercard.changePassword')}</span>
              </Button>
              <Button
                variant="danger"
                aria-label={t('usercard.delete')}
                title={t('usercard.delete')}
                leftIcon={<Trash2 size={16} />}
                loading={del.isPending}
                onClick={async () => {
                  if (
                    await confirm({
                      message: t('usercard.deleteConfirm').replace(
                        '{name}',
                        user.full_name || t('usercard.userFallbackGenitive'),
                      ),
                      danger: true,
                      confirmLabel: t('usercard.delete'),
                    })
                  )
                    del.mutate(user.id, {
                      onSuccess: () => {
                        toast.success(t('common.deleted'))
                        navigate('/admin/users')
                      },
                    })
                }}
              >
                <span className="hidden sm:inline">{t('usercard.delete')}</span>
              </Button>
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <Field label={t('usercard.fieldPhone')} value={user.phone} />
            <Field label={t('usercard.fieldLogin')} value={user.login ?? user.email} />
            <PasswordField userId={user.id} />
            <Field label={t('usercard.fieldRegDate')} value={formatDate(user.registration_date)} />
            <Field
              label={t('usercard.fieldRole')}
              value={user.role === 'admin' ? t('common.role.admin') : t('common.role.user')}
            />
            <Field label={t('usercard.fieldSubStart')} value={formatDate(user.subscription_start)} />
            <Field label={t('usercard.fieldSubEnd')} value={formatDate(user.subscription_end)} />
            <div className="sm:col-span-2">
              <Field label={t('usercard.fieldAdminComment')} value={user.admin_comment} />
            </div>
          </dl>
        </section>

        {/* Анкеты A/B лида (просмотр админом) */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-ink">{t('survey.title')}</h2>
          <SurveyPanel userId={user.id} editable={false} />
        </section>

        {/* «Разбор» лида (просмотр админом) */}
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-ink">{t('page.razbor')}</h2>
          <RazborPanel userId={user.id} editable={false} />
        </section>

        <UserTabs userId={user.id} />
        <AchievementsBlock userId={user.id} />
        <ActivityFeed userId={user.id} />
      </div>

      <EditUserModal user={editing ? user : null} onClose={() => setEditing(false)} />
      <SetPasswordModal
        userId={user.id}
        userName={user.full_name || user.login || t('usercard.userFallback')}
        open={pwdOpen}
        onClose={() => setPwdOpen(false)}
      />
    </AppShell>
  )
}

function Field({
  label,
  value,
}: {
  label: string
  value: string | null | undefined
}) {
  return (
    <div>
      <dt className="font-mono text-[11px] uppercase tracking-wide text-ink-3">
        {label}
      </dt>
      <dd className="mt-0.5 text-ink">{value || '—'}</dd>
    </div>
  )
}
