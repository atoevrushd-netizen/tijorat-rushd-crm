import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Activity,
  ChevronLeft,
  IdCard,
  KeyRound,
  ListChecks,
  MessageSquareText,
  Trash2,
  Trophy,
} from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/Button'
import { CollapsibleSection } from '@/components/ui/CollapsibleSection'
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
import { LeadCardPanel } from '@/features/leadcard/LeadCardPanel'

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
      <AppShell title={t('page.userCard')}>
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
    <AppShell title={t('page.userCard')}>
      <div className="space-y-4 sm:space-y-5">
        <Link
          to="/admin"
          className="inline-flex items-center gap-1 rounded-full border border-line bg-surface py-1.5 pl-2 pr-3.5 text-[13px] font-medium text-ink-2 shadow-card transition-all duration-150 ease-ios hover:border-line-strong hover:bg-surface-2 hover:text-ink active:scale-[.97]"
        >
          <ChevronLeft size={16} />
          {t('users.backToList')}
        </Link>

        {/* Шапка-профиль: чистая белая карточка с акцентной деталью */}
        <section className="overflow-hidden rounded-[20px] border border-line bg-surface shadow-sh1">
          <div className="h-1.5 w-full bg-accent-grad" />
          <div className="p-5 sm:p-6">
            <div className="flex flex-wrap items-start gap-4">
              <Avatar
                name={user.full_name}
                src={user.photo_url}
                size={72}
                className="ring-2 ring-accent-soft"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-bold tracking-tight text-ink">
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

            <dl className="mt-6 grid grid-cols-1 gap-2.5 text-sm sm:grid-cols-2">
              <Field label={t('usercard.fieldPhone')} value={user.phone} />
              <Field label={t('usercard.fieldLogin')} value={user.login ?? user.email} />
              <PasswordField userId={user.id} />
              <Field label={t('usercard.fieldRegDate')} value={formatDate(user.registration_date)} />
              <Field
                label={t('usercard.fieldRole')}
                value={
                  user.role === 'admin'
                    ? t('common.role.admin')
                    : user.role === 'developer'
                      ? t('common.role.developer')
                      : t('common.role.user')
                }
              />
              <Field label={t('usercard.fieldSubStart')} value={formatDate(user.subscription_start)} />
              <Field label={t('usercard.fieldSubEnd')} value={formatDate(user.subscription_end)} />
              <div className="sm:col-span-2">
                <Field label={t('usercard.fieldAdminComment')} value={user.admin_comment} />
              </div>
            </dl>
          </div>
        </section>

        {/* Календарь/Медиа — сразу под шапкой (быстрый доступ к задачам) */}
        <UserTabs userId={user.id} />

        {/* Остальные разделы — «шторки», по умолчанию свёрнуты (быстро найти и раскрыть нужное) */}
        {user.role === 'user' && (
          <CollapsibleSection title={t('leadcard.title')} icon={<IdCard size={18} />}>
            <LeadCardPanel userId={user.id} editable />
          </CollapsibleSection>
        )}

        <CollapsibleSection title={t('survey.qa')} icon={<MessageSquareText size={18} />}>
          <SurveyPanel userId={user.id} editable={false} />
        </CollapsibleSection>

        <CollapsibleSection title={t('page.razbor')} icon={<ListChecks size={18} />}>
          <RazborPanel userId={user.id} editable={false} />
        </CollapsibleSection>

        <CollapsibleSection title={t('ach.title')} icon={<Trophy size={18} />}>
          <AchievementsBlock userId={user.id} bare />
        </CollapsibleSection>

        <CollapsibleSection title={t('activity.title')} icon={<Activity size={18} />}>
          <ActivityFeed userId={user.id} bare />
        </CollapsibleSection>
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
    <div className="rounded-[12px] bg-surface-2 px-3.5 py-3">
      <dt className="font-mono text-[11px] uppercase tracking-wide text-ink-3">
        {label}
      </dt>
      <dd className="mt-1 font-medium text-ink">{value || '—'}</dd>
    </div>
  )
}
