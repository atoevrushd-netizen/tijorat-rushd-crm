import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  Activity,
  BadgeCheck,
  CalendarPlus,
  ChevronLeft,
  IdCard,
  KeyRound,
  ListChecks,
  ListPlus,
  MessageSquareText,
  Power,
  PowerOff,
  RefreshCw,
  Trash2,
  Trophy,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AppShell } from '@/components/layout/AppShell'
import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/Button'
import { Switch } from '@/components/ui/Switch'
import { CollapsibleSection } from '@/components/ui/CollapsibleSection'
import { FullPageSpinner } from '@/components/ui/FullPageSpinner'
import { formatDate } from '@/lib/utils'
import { toast } from '@/lib/toast'
import { confirm } from '@/lib/confirm'
import { useT } from '@/i18n/useT'
import { useUser } from '@/features/users/useUser'
import { useSoftDeleteUser } from '@/features/users/useUsers'
import {
  useRebuildMonthly,
  useRegenerateMonthly,
  useSetLeadPaid,
  useSetResidentActive,
} from '@/features/users/useResidentLifecycle'
import { EditUserModal } from '@/features/users/EditUserModal'
import { SetPasswordModal } from '@/features/users/SetPasswordModal'
import { PasswordField } from '@/features/users/PasswordField'
import { PlanBadge } from '@/features/users/PlanBadge'
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
  const setActive = useSetResidentActive()
  const regen = useRegenerateMonthly()
  const rebuild = useRebuildMonthly()
  const setPaid = useSetLeadPaid()
  const [editing, setEditing] = useState(false)
  const [pwdOpen, setPwdOpen] = useState(false)

  if (isLoading) return <FullPageSpinner />

  if (!user) {
    return (
      <AppShell title={t('page.userCard')}>
        <p className="text-center text-ink-2">
          {t('usercard.notFound')}{' '}
          <Link to="/admin/users" className="text-accent underline">
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
          to="/admin/users"
          className="inline-flex items-center gap-1 rounded-full border border-line bg-surface py-1.5 pl-2 pr-3.5 text-[13px] font-medium text-ink-2 shadow-card transition-all duration-150 ease-ios hover:border-line-strong hover:bg-surface-2 hover:text-ink active:scale-[.97]"
        >
          <ChevronLeft size={16} />
          {t('users.backToList')}
        </Link>

        {/* Шапка-профиль: чистая карточка; у оплативших — приятная зелёная подсветка */}
        <section
          className={cn(
            'overflow-hidden rounded-[20px] border bg-surface shadow-sh1 transition-colors duration-300',
            user.paid_at ? 'border-[rgba(52,199,89,.35)]' : 'border-line',
          )}
          style={
            user.paid_at
              ? {
                  // мягкая зелёная «дымка» поверх обычной поверхности карточки
                  background:
                    'linear-gradient(0deg, var(--success-soft), var(--success-soft)), var(--surface)',
                }
              : undefined
          }
        >
          <div
            className={cn('h-1.5 w-full', !user.paid_at && 'bg-accent-grad')}
            style={
              user.paid_at
                ? { background: 'linear-gradient(90deg, var(--success), #7ee2a2)' }
                : undefined
            }
          />
          <div className="p-5 sm:p-6">
            <div className="flex flex-wrap items-start gap-4">
              <Avatar
                name={user.full_name}
                src={user.photo_url}
                size={72}
                className={cn(
                  'ring-2',
                  user.paid_at ? 'ring-[rgba(52,199,89,.45)]' : 'ring-accent-soft',
                )}
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-bold tracking-tight text-ink">
                    {user.full_name || '—'}
                  </h2>
                  <StatusBadge status={user.status} />
                  <PlanBadge months={user.plan_months} />
                  {user.paid_at && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-success px-2.5 py-0.5 text-[11.5px] font-semibold text-white shadow-[0_0_10px_rgba(52,199,89,.35)]">
                      <BadgeCheck size={13} />
                      {t('usercard.paidBadge')}
                    </span>
                  )}
                  {user.deactivated_at && (
                    <span className="rounded-full bg-danger-soft px-2.5 py-0.5 text-[11.5px] font-semibold text-danger">
                      {t('usercard.deactivatedBadge')}
                    </span>
                  )}
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
                {user.role === 'user' && (
                  <Button
                    variant={user.deactivated_at ? 'primary' : 'secondary'}
                    aria-label={user.deactivated_at ? t('usercard.activate') : t('usercard.deactivate')}
                    title={user.deactivated_at ? t('usercard.activate') : t('usercard.deactivate')}
                    leftIcon={user.deactivated_at ? <Power size={16} /> : <PowerOff size={16} />}
                    loading={setActive.isPending}
                    onClick={async () => {
                      const activating = !!user.deactivated_at
                      if (!activating) {
                        const ok = await confirm({
                          message: t('usercard.deactivateConfirm').replace(
                            '{name}',
                            user.full_name || t('usercard.userFallbackGenitive'),
                          ),
                          danger: true,
                          confirmLabel: t('usercard.deactivate'),
                        })
                        if (!ok) return
                      }
                      setActive.mutate(
                        { leadId: user.id, active: activating },
                        {
                          onSuccess: () =>
                            toast.success(activating ? t('usercard.activated') : t('usercard.deactivatedToast')),
                        },
                      )
                    }}
                  >
                    <span className="hidden sm:inline">
                      {user.deactivated_at ? t('usercard.activate') : t('usercard.deactivate')}
                    </span>
                  </Button>
                )}
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

            {/* «Оплатил полностью» — ставит только админ/разработчик (0055) */}
            {user.role === 'user' && (
              <div
                className={cn(
                  'mt-4 flex items-center justify-between gap-4 rounded-[14px] border px-4 py-3.5 transition-colors duration-300',
                  user.paid_at
                    ? 'border-[rgba(52,199,89,.35)] bg-success-soft'
                    : 'border-line bg-surface-2',
                )}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={cn(
                      'flex h-10 w-10 flex-none items-center justify-center rounded-[12px] transition-colors',
                      user.paid_at ? 'bg-success text-white' : 'bg-surface-3 text-ink-3',
                    )}
                  >
                    <BadgeCheck size={20} />
                  </span>
                  <div className="min-w-0">
                    <div className="text-[13.5px] font-bold text-ink">
                      {t('usercard.paidTitle')}
                    </div>
                    <div
                      className={cn(
                        'truncate text-[12px]',
                        user.paid_at ? 'font-medium text-success' : 'text-ink-3',
                      )}
                    >
                      {user.paid_at ? t('usercard.paidYes') : t('usercard.paidNo')}
                    </div>
                  </div>
                </div>
                <Switch
                  checked={!!user.paid_at}
                  disabled={setPaid.isPending}
                  label={t('usercard.paidTitle')}
                  onChange={(v) =>
                    setPaid.mutate(
                      { leadId: user.id, paid: v },
                      {
                        onSuccess: () =>
                          toast.success(v ? t('usercard.paidOnToast') : t('usercard.paidOffToast')),
                      },
                    )
                  }
                />
              </div>
            )}
          </div>
        </section>

        {/* Задачи: назначить вручную (инструмент) + создать помесячные по подписке (0048) */}
        {user.role === 'user' && (
          <div className="flex flex-wrap justify-end gap-2">
            <Button
              variant="secondary"
              leftIcon={<ListPlus size={16} />}
              onClick={() => navigate(`/admin/assign-task?lead=${user.id}`)}
            >
              {t('usercard.assignTask')}
            </Button>
            <Button
              variant="secondary"
              leftIcon={<CalendarPlus size={16} />}
              loading={regen.isPending}
              onClick={() =>
                regen.mutate(user.id, {
                  onSuccess: (n) =>
                    toast.success(t('usercard.tasksCreated').replace('{n}', String(n))),
                })
              }
            >
              {t('usercard.generateTasks')}
            </Button>
            <Button
              variant="secondary"
              leftIcon={<RefreshCw size={16} />}
              loading={rebuild.isPending}
              onClick={async () => {
                if (await confirm({ message: t('usercard.rebuildConfirm'), danger: true, confirmLabel: t('usercard.rebuildTasks') }))
                  rebuild.mutate(user.id, {
                    onSuccess: (n) =>
                      toast.success(t('usercard.rebuildDone').replace('{n}', String(n))),
                  })
              }}
            >
              {t('usercard.rebuildTasks')}
            </Button>
          </div>
        )}

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
