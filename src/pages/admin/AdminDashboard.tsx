import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { adminNav } from '@/components/layout/nav'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useDebouncedValue } from '@/lib/useDebouncedValue'
import { Skeleton } from '@/components/ui/Skeleton'
import { useUsers } from '@/features/users/useUsers'
import { UsersTable } from '@/features/users/UsersTable'
import { Pagination } from '@/features/users/Pagination'
import { CreateUserModal } from '@/features/users/CreateUserModal'

const PAGE_SIZE = 10

/** Админ-панель: список пользователей, поиск, пагинация, создание. */
export function AdminDashboard() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [createOpen, setCreateOpen] = useState(false)
  const debouncedSearch = useDebouncedValue(search, 300)

  useEffect(() => {
    setPage(1)
  }, [debouncedSearch])

  const { data, isLoading, isError, error } = useUsers({
    search: debouncedSearch,
    page,
    pageSize: PAGE_SIZE,
  })

  return (
    <AppShell
      title="Пользователи"
      nav={adminNav}
      action={<Button onClick={() => setCreateOpen(true)}>+ Создать пользователя</Button>}
    >
      <div className="mb-4 max-w-sm">
        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск: имя, телефон, логин, email"
        />
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
          Не удалось загрузить пользователей
          {error instanceof Error ? `: ${error.message}` : ''}.
        </div>
      )}

      {data && (
        <div className="space-y-4">
          <UsersTable
            users={data.items}
            onRowClick={(user) => navigate(`/admin/users/${user.id}`)}
          />
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
