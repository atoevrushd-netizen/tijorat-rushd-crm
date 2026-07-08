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
    'flex h-10 w-10 items-center justify-center rounded-[12px] border border-line bg-surface text-ink-2 shadow-card transition-all duration-150 ease-ios hover:border-line-strong hover:bg-surface-2 hover:text-ink active:scale-95 disabled:cursor-not-allowed disabled:opacity-[.4] disabled:shadow-none'

  return (
    <div className="flex items-center justify-between gap-4 rounded-[16px] border border-line bg-surface px-4 py-2.5 text-sm text-ink-3 shadow-sh1">
      <span>
        Всего: <span className="font-mono font-semibold text-ink-2">{total}</span>
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className={btn}
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Назад"
        >
          <ChevronLeft size={17} />
        </button>
        <span className="min-w-16 text-center font-mono text-[13px] font-semibold text-ink-2">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          className={btn}
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Вперёд"
        >
          <ChevronRight size={17} />
        </button>
      </div>
    </div>
  )
}
