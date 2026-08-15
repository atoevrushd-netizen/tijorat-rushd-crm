import { useMemo, useState } from 'react'
import { AlertCircle, Check, RefreshCw, Search, Users as UsersIcon } from 'lucide-react'
import type { Profile } from '@/types'
import { cn } from '@/lib/utils'
import { useT } from '@/i18n/useT'
import { Input } from '@/components/ui/Input'
import { Avatar } from '@/components/ui/Avatar'
import { Skeleton } from '@/components/ui/Skeleton'

/** Мультивыбор резидентов: поиск, «выбрать всех отфильтрованных», галочки. */
export function ResidentMultiSelect({
  residents,
  selected,
  loading,
  error,
  onRetry,
  onToggle,
  onSetMany,
}: {
  residents: Profile[]
  selected: Set<string>
  loading?: boolean
  /** Список не загрузился (сеть/доступ) — показываем ошибку с «Повторить», а не «не найдены». */
  error?: boolean
  onRetry?: () => void
  onToggle: (id: string) => void
  /** Заменить выбор для набора id (выбрать/снять всех отфильтрованных). */
  onSetMany: (ids: string[], value: boolean) => void
}) {
  const { t } = useT()
  const [q, setQ] = useState('')

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return residents
    return residents.filter((r) =>
      [r.full_name, r.login, r.phone].some((v) => (v ?? '').toLowerCase().includes(s)),
    )
  }, [residents, q])

  const filteredIds = filtered.map((r) => r.id)
  const allFilteredSelected =
    filteredIds.length > 0 && filteredIds.every((id) => selected.has(id))

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[18px] border border-line bg-surface shadow-sh1">
      <div className="space-y-2.5 border-b border-line p-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] font-bold text-ink">{t('assign.residents')}</span>
          <span className="rounded-full bg-accent-soft px-2.5 py-0.5 text-[11.5px] font-bold text-accent">
            {t('assign.selectedN').replace('{n}', String(selected.size))}
          </span>
        </div>
        <Input
          variant="box"
          type="search"
          leftIcon={<Search size={16} />}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={t('assign.searchPlaceholder')}
        />
        <button
          type="button"
          onClick={() => onSetMany(filteredIds, !allFilteredSelected)}
          disabled={filteredIds.length === 0}
          className="text-[12.5px] font-semibold text-accent transition-colors hover:text-accent-600 disabled:opacity-40"
        >
          {allFilteredSelected ? t('assign.clearAll') : t('assign.selectAll')}
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {loading ? (
          <div className="space-y-2 p-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-[12px]" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-danger-soft text-danger">
              <AlertCircle className="h-5 w-5" />
            </span>
            <p className="text-[13px] font-medium text-ink-2">{t('assign.loadError')}</p>
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-accent"
              >
                <RefreshCw size={13} />
                {t('assign.retry')}
              </button>
            )}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-surface-2 text-ink-3">
              <UsersIcon className="h-5 w-5" />
            </span>
            <p className="text-[13px] font-medium text-ink-2">{t('assign.noResidents')}</p>
          </div>
        ) : (
          <ul className="space-y-1">
            {filtered.map((r) => {
              const on = selected.has(r.id)
              return (
                <li key={r.id}>
                  <button
                    type="button"
                    onClick={() => onToggle(r.id)}
                    aria-pressed={on}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-[12px] p-2 text-left transition-colors',
                      on ? 'bg-accent-soft' : 'hover:bg-surface-2',
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-6 w-6 flex-none items-center justify-center rounded-[7px] border-2 transition-colors',
                        on
                          ? 'border-accent bg-accent text-on-accent'
                          : 'border-line-strong text-transparent',
                      )}
                    >
                      <Check size={14} strokeWidth={3} />
                    </span>
                    <Avatar name={r.full_name} src={r.photo_url} size={34} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13.5px] font-medium text-ink">
                        {r.full_name || '—'}
                      </span>
                      <span className="block truncate font-mono text-[11px] text-ink-3">
                        {r.login || r.phone || '—'}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
