import { ChevronLeft, ChevronRight } from 'lucide-react'

type PaginationProps = {
  page: number
  pageSize: number
  total: number
  onPageChange: (page: number) => void
}

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const btn =
    'flex h-9 w-9 items-center justify-center rounded-md border border-line-strong text-ink-2 transition-colors hover:bg-surface-2 hover:text-ink disabled:cursor-not-allowed disabled:opacity-[.4]'

  return (
    <div className="flex items-center justify-between gap-4 text-sm text-ink-3">
      <span>
        Всего: <span className="font-mono text-ink-2">{total}</span>
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={btn}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Назад"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="min-w-16 text-center font-mono text-ink-2">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          className={btn}
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Вперёд"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
