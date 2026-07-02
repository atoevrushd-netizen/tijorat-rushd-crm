import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { RotateCcw, Trash2 } from 'lucide-react'
import type { Profile } from '@/types'
import { AppShell } from '@/components/layout/AppShell'
import { adminNav } from '@/components/layout/nav'
import { Avatar } from '@/components/ui/Avatar'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDate } from '@/lib/utils'
import { useDebouncedValue } from '@/lib/useDebouncedValue'
import { useT } from '@/i18n/useT'
import { useRestoreUser, useUsers } from '@/features/users/useUsers'
import { UsersTable } from '@/features/users/UsersTable'
import { Pagination } from '@/features/users/Pagination'
import { CreateUserModal } from '@/features/users/CreateUserModal'

const PAGE_SIZE = 10

/** Админ-панель: список пользователей, поиск, пагинация, создание, «Корзина». */
export function AdminDashboard() {
  const navigate = useNavigate()
  const restore = useRestoreUser()
  const { t } = useT()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const [showTrash, setShowTrash] = useState(false)
  const debouncedSearch = useDebouncedValue(search, 300)

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, showTrash])

  const { data, isLoading, isError, error } = useUsers({
    search: debouncedSearch,
    page,
    pageSize: PAGE_SIZE,
    trashed: showTrash,
  })

  return (
    <AppShell
      title={t('page.users')}
      nav={adminNav}
      action={<Button onClick={() => setCreateOpen(true)}>{t('users.create')}</Button>}
    >
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="max-w-sm flex-1">
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('users.searchPlaceholder')}
          />
        </div>
        <Button
          variant={showTrash ? 'primary' : 'outline'}
          leftIcon={<Trash2 size={15} />}
          onClick={() => setShowTrash((v) => !v)}
        >
          {showTrash ? t('users.toActive') : t('users.trash')}
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-2 rounded-xl border border-line bg-surface p-4">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-md bg-danger-soft px-4 py-3 text-sm text-danger">
          {t('users.loadError')}
          {error instanceof Error ? `: ${error.message}` : ''}.
        </div>
      )}

      {data && (
        <div className="space-y-4">
          {showTrash ? (
            <TrashList
              users={data.items}
              restoring={restore.isPending}
              onRestore={(id) => restore.mutate(id)}
            />
          ) : (
            <UsersTable
              users={data.items}
              onRowClick={(user) => navigate(`/admin/users/${user.id}`)}
            />
          )}
          <Pagination
            page={page}
            pageSize={PAGE_SIZE}
            total={data.total}
            onPageChange={setPage}
          />
        </div>
      )}

      <CreateUserModal open={createOpen} onClose={() => setCreateOpen(false)} />
    </AppShell>
  )
}

/** «Корзина»: удалённые лиды с возможностью восстановить. */
function TrashList({
  users,
  restoring,
  onRestore,
}: {
  users: Profile[]
  restoring: boolean
  onRestore: (id: string) => void
}) {
  const { t } = useT()
  if (users.length === 0) {
    return <p className="py-10 text-center text-sm text-ink-3">{t('users.trashEmpty')}</p>
  }
  return (
    <ul className="space-y-2">
      {users.map((u) => (
        <li
          key={u.id}
          className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3"
        >
          <Avatar name={u.full_name} src={u.photo_url} size={40} />
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium text-ink">{u.full_name || '—'}</div>
            <div className="truncate font-mono text-xs text-ink-3">
              {u.phone || '—'} · {t('users.deletedAt')} {formatDate(u.deleted_at)}
            </div>
          </div>
          <Button
            size="sm"
            variant="secondary"
            leftIcon={<RotateCcw size={14} />}
            disabled={restoring}
            onClick={() => onRestore(u.id)}
          >
            {t('users.restore')}
          </Button>
        </li>
      ))}
    </ul>
  )
}
