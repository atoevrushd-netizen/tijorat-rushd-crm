import { type ReactNode } from 'react'

/** Карточка-секция настроек: иконка + заголовок + действие справа. */
export function Section({
  icon,
  title,
  action,
  children,
}: {
  icon?: ReactNode
  title: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="rounded-xl border border-line bg-surface p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {icon && (
            <span className="flex h-8 w-8 items-center justify-center rounded-[9px] bg-accent-soft text-accent">
              {icon}
            </span>
          )}
          <h2 className="text-[15px] font-bold text-ink">{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}

/** Строка «метка — значение». */
export function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-line py-2.5 last:border-0">
      <span className="text-[13px] text-ink-3">{label}</span>
      <span className="text-right text-[13.5px] font-medium text-ink">{value || '—'}</span>
    </div>
  )
}
