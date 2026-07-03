import { useT } from '@/i18n/useT'
import type { LeadStats } from './leadStats'

function Stat({
  label,
  value,
  tone = 'ink',
}: {
  label: string
  value: string | number
  tone?: 'ink' | 'success' | 'warn' | 'accent'
}) {
  const color =
    tone === 'success'
      ? 'text-success'
      : tone === 'warn'
        ? 'text-warn'
        : tone === 'accent'
          ? 'text-accent'
          : 'text-ink'
  return (
    <div className="rounded-[14px] bg-surface-2 p-3.5 text-center">
      <div className={`text-[24px] font-bold tracking-tight ${color}`}>{value}</div>
      <div className="mt-0.5 text-[11.5px] text-ink-2">{label}</div>
    </div>
  )
}

/** Воронка лидов: KPI-карточки + разбивка по источникам. */
export function LeadsFunnel({ stats }: { stats: LeadStats }) {
  const { t } = useT()
  const max = Math.max(1, ...stats.bySource.map((s) => s.count))

  return (
    <section className="space-y-4 rounded-[18px] border border-line bg-surface p-5 shadow-sh1">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label={t('leads.total')} value={stats.total} />
        <Stat label={t('leads.converted')} value={stats.converted} tone="success" />
        <Stat label={t('leads.notConverted')} value={stats.notConverted} tone="warn" />
        <Stat label={t('leads.rate')} value={`${stats.rate}%`} tone="accent" />
      </div>

      {stats.bySource.length > 0 && (
        <div>
          <div className="mb-2 text-[13px] font-bold text-ink">{t('leads.bySource')}</div>
          <div className="space-y-2">
            {stats.bySource.map((s) => (
              <div key={s.source} className="flex items-center gap-3">
                <span className="w-32 shrink-0 truncate text-[12.5px] text-ink-2">
                  {t(`leads.source.${s.source}`, s.source)}
                </span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-3">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${Math.round((s.count / max) * 100)}%` }}
                  />
                </div>
                <span className="w-8 shrink-0 text-right font-mono text-[12px] text-ink-3">
                  {s.count}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}
