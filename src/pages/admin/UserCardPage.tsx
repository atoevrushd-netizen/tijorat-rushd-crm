import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { adminNav } from '@/components/layout/nav'
import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Button } from '@/components/ui/Button'
import { FullPageSpinner } from '@/components/ui/FullPageSpinner'
import { formatDate } from '@/lib/utils'
import { useUser } from '@/features/users/useUser'
import { useSoftDeleteUser } from '@/features/users/useUsers'
import { EditUserModal } from '@/features/users/EditUserModal'
import { SetPasswordModal } from '@/features/users/SetPasswordModal'
import { PasswordField } from '@/features/users/PasswordField'
import { AchievementsBlock } from '@/features/achievements/AchievementsBlock'
import { UserTabs } from '@/features/tabs/UserTabs'
import { ActivityFeed } from '@/features/activity-log/ActivityFeed'

/** Карточка пользователя — «медкарта»: данные, вкладки, достижения, история. */
export function UserCardPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data: user, isLoading } = useUser(id)
  const del = useSoftDeleteUser()
  const [editing, setEditing] = useState(false)
  const [pwdOpen, setPwdOpen] = useState(false)

  if (isLoading) return <FullPageSpinner />

  if (!user) {
    return (
      <AppShell title="Карточка пользователя" nav={adminNav}>
        <p className="text-center text-ink-2">
          Пользователь не найден.{' '}
          <Link to="/admin" className="text-accent underline">
            К списку
          </Link>
        </p>
      </AppShell>
    )
  }

  return (
    <AppShell title="Карточка пользователя" nav={adminNav}>
      <div className="space-y-6">
        <Link
          to="/admin"
          className="inline-block text-sm text-ink-3 transition-colors hover:text-ink-2"
        >
          ← К списку
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
                {user.business_direction || 'Направление не указано'}
              </p>
            </div>
            <div className="flex w-full gap-2 sm:w-auto sm:flex-col">
              <Button
                variant="secondary"
                className="flex-1 sm:flex-none"
                onClick={() => setEditing(true)}
              >
                Редактировать
              </Button>
              <Button
                variant="secondary"
                className="flex-1 sm:flex-none"
                onClick={() => setPwdOpen(true)}
              >
                Сменить пароль
              </Button>
              <Button
                variant="danger"
                className="flex-1 sm:flex-none"
                leftIcon={<Trash2 size={15} />}
                loading={del.isPending}
                onClick={() => {
                  if (
                    window.confirm(
                      `Удалить «${user.full_name || 'пользователя'}»? Лид уйдёт в «Корзину» — его можно восстановить.`,
                    )
                  )
                    del.mutate(user.id, {
                      onSuccess: () => navigate('/admin/users'),
                    })
                }}
              >
                Удалить
              </Button>
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
            <Field label="Телефон" value={user.phone} />
            <Field label="Логин" value={user.login ?? user.email} />
            <PasswordField userId={user.id} />
            <Field label="Дата регистрации" value={formatDate(user.registration_date)} />
            <Field label="Роль" value={user.role === 'admin' ? 'Администратор' : 'Пользователь'} />
            <Field label="Подписка с" value={formatDate(user.subscription_start)} />
            <Field label="Подписка по" value={formatDate(user.subscription_end)} />
            <div className="sm:col-span-2">
              <Field label="Комментарий администратора" value={user.admin_comment} />
            </div>
          </dl>
        </section>

        <UserTabs userId={user.id} />
        <AchievementsBlock userId={user.id} />
        <ActivityFeed userId={user.id} />
      </div>

      <EditUserModal user={editing ? user : null} onClose={() => setEditing(false)} />
      <SetPasswordModal
        userId={user.id}
        userName={user.full_name || user.login || 'пользователь'}
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
