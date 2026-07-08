import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download, RotateCcw, Search, Trash2 } from 'lucide-react'
import type { Profile } from '@/types'
import { AppShell } from '@/components/layout/AppShell'
import { Avatar } from '@/components/ui/Avatar'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { formatDate } from '@/lib/utils'
import { toCSV, downloadCSV } from '@/lib/csv'
import { useDebouncedValue } from '@/lib/useDebouncedValue'
import { toast, errorMessage } from '@/lib/toast'
import { confirm } from '@/lib/confirm'
import { useT } from '@/i18n/useT'
import { listAllLeads } from '@/features/users/api'
import {
  usePermanentDeleteUser,
  useRestoreUser,
  useUsers,
} from '@/features/users/useUsers'
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
  const [exporting, setExporting] = useState(false)
  const debouncedSearch = useDebouncedValue(search, 300)

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch, showTrash])

  // Экспорт текущего среза лидов (с учётом поиска/«Корзины») в CSV для Excel.
  async function exportCsv() {
    setExporting(true)
    try {
      const rows = await listAllLeads(debouncedSearch, showTrash)
      const csv = toCSV<Profile>(rows, [
        { label: t('users.colName'), get: (u) => u.full_name ?? '' },
        { label: t('users.colPhone'), get: (u) => u.phone ?? '' },
        { label: t('users.colLogin'), get: (u) => u.login ?? '' },
        { label: t('users.colDirection'), get: (u) => u.business_direction ?? '' },
        { label: t('users.colStatus'), get: (u) => t(`userStatus.${u.status}`, u.status) },
        { label: t('users.colRegistered'), get: (u) => formatDate(u.registration_date) },
      ])
      downloadCSV(`tijorat-leads-${new Date().toISOString().slice(0, 10)}.csv`, csv)
      toast.success(`${t('users.exported')} · ${rows.length}`)
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      setExporting(false)
    }
  }

  const { data, isLoading, isError, error } = useUsers({
    search: debouncedSearch,
    page,
    pageSize: PAGE_SIZE,
    trashed: showTrash,
  })

  return (
    <AppShell
      title={t('page.users')}
      action={<Button onClick={() => setCreateOpen(true)}>{t('users.create')}</Button>}
    >
      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-[16px] border border-line bg-surface p-2.5 shadow-sh1">
        <div className="min-w-[180px] flex-1">
          <Input
            variant="box"
            type="search"
            leftIcon={<Search size={16} />}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('users.searchPlaceholder')}
          />
        </div>
        <Button
          variant={showTrash ? 'primary' : 'secondary'}
          leftIcon={<Trash2 size={15} />}
          onClick={() => setShowTrash((v) => !v)}
        >
          {showTrash ? t('users.toActive') : t('users.trash')}
        </Button>
        <Button
          variant="secondary"
          leftIcon={<Download size={15} />}
          loading={exporting}
          onClick={exportCsv}
        >
          {t('users.exportCsv')}
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-2.5 rounded-[18px] border border-line bg-surface p-4 shadow-sh1">
          {[0, 1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-[14px]" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-[12px] bg-danger-soft px-4 py-3 text-sm text-danger">
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
              onRestore={(id) =>
                restore.mutate(id, {
                  onSuccess: () => toast.success(t('common.saved')),
                })
              }
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
  const purge = usePermanentDeleteUser()
  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-[18px] border border-line bg-surface px-6 py-14 text-center shadow-sh1">
        <span className="flex h-12 w-12 items-center justify-center rounded-[15px] bg-surface-2 text-ink-3">
          <Trash2 className="h-6 w-6" />
        </span>
        <p className="text-sm font-medium text-ink-2">{t('users.trashEmpty')}</p>
      </div>
    )
  }
  return (
    <ul className="space-y-2.5">
      {users.map((u) => (
        <li
          key={u.id}
          className="flex items-center gap-3 rounded-[16px] border border-line bg-surface p-3 shadow-sh1"
        >
          <Avatar name={u.full_name} src={u.photo_url} size={44} />
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium text-ink">{u.full_name || '—'}</div>
            <div className="truncate font-mono text-xs text-ink-3">
              {u.phone || '—'} · {t('users.deletedAt')} {formatDate(u.deleted_at)}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<RotateCcw size={14} />}
              disabled={restoring}
              onClick={() => onRestore(u.id)}
              aria-label={t('users.restore')}
              title={t('users.restore')}
            >
              <span className="hidden sm:inline">{t('users.restore')}</span>
            </Button>
            <Button
              size="sm"
              variant="danger"
              leftIcon={<Trash2 size={14} />}
              loading={purge.isPending}
              onClick={async () => {
                if (
                  await confirm({
                    message: t('users.deleteForeverConfirm'),
                    danger: true,
                    confirmLabel: t('users.deleteForever'),
                  })
                )
                  purge.mutate(u.id, {
                    onSuccess: () => toast.success(t('common.deleted')),
                  })
              }}
              aria-label={t('users.deleteForever')}
              title={t('users.deleteForever')}
            >
              <span className="hidden sm:inline">{t('users.deleteForever')}</span>
            </Button>
          </div>
        </li>
      ))}
    </ul>
  )
}
