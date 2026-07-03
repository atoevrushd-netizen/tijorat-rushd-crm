import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Download } from 'lucide-react'
import type { Lead } from '@/types'
import { AppShell } from '@/components/layout/AppShell'
import { adminNav } from '@/components/layout/nav'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { cn, formatDate } from '@/lib/utils'
import { toCSV, downloadCSV } from '@/lib/csv'
import { toast, errorMessage } from '@/lib/toast'
import { useT } from '@/i18n/useT'
import { useLeads } from '@/features/leads/useLeads'
import { leadStats } from '@/features/leads/leadStats'
import { LeadsFunnel } from '@/features/leads/LeadsFunnel'

/** Раздел «Лиды»: воронка конверсии + таблица всех лидов. */
export function LeadsPage() {
  const { t } = useT()
  const navigate = useNavigate()
  const { data: leads, isLoading, isError } = useLeads()
  const [exporting, setExporting] = useState(false)

  function exportCsv() {
    if (!leads) return
    setExporting(true)
    try {
      const csv = toCSV<Lead>(leads, [
        { label: t('leads.colName'), get: (l) => l.full_name },
        { label: t('leads.colPhone'), get: (l) => l.phone },
        { label: t('leads.colSource'), get: (l) => t(`leads.source.${l.source ?? 'unknown'}`, l.source ?? '') },
        { label: t('leads.colCreated'), get: (l) => formatDate(l.created_at) },
        {
          label: t('leads.colStatus'),
          get: (l) => (l.converted_user_id ? t('leads.statusConverted') : t('leads.statusNew')),
        },
      ])
      downloadCSV(`tijorat-leads-full-${new Date().toISOString().slice(0, 10)}.csv`, csv)
      toast.success(`${t('leads.exported')} · ${leads.length}`)
    } catch (e) {
      toast.error(errorMessage(e))
    } finally {
      setExporting(false)
    }
  }

  return (
    <AppShell
      title={t('page.leads')}
      nav={adminNav}
      action={
        <Button
          variant="outline"
          leftIcon={<Download size={15} />}
          loading={exporting}
          disabled={!leads || leads.length === 0}
          onClick={exportCsv}
        >
          {t('leads.exportCsv')}
        </Button>
      }
    >
      {isLoading && (
        <div className="space-y-3">
          <Skeleton className="h-28 w-full rounded-[18px]" />
          <Skeleton className="h-64 w-full rounded-[18px]" />
        </div>
      )}

      {isError && (
        <div className="rounded-md bg-danger-soft px-4 py-3 text-sm text-danger">
          {t('leads.loadError')}
        </div>
      )}

      {leads && (
        <div className="space-y-4">
          <LeadsFunnel stats={leadStats(leads)} />

          {leads.length === 0 ? (
            <p className="py-10 text-center text-sm text-ink-3">{t('leads.empty')}</p>
          ) : (
            <div className="overflow-x-auto rounded-[18px] border border-line bg-surface shadow-sh1">
              <table className="w-full min-w-[560px] text-left text-[13px]">
                <thead>
                  <tr className="border-b border-line text-[11.5px] uppercase tracking-wide text-ink-3">
                    <th className="px-4 py-3 font-semibold">{t('leads.colName')}</th>
                    <th className="px-4 py-3 font-semibold">{t('leads.colPhone')}</th>
                    <th className="px-4 py-3 font-semibold">{t('leads.colSource')}</th>
                    <th className="px-4 py-3 font-semibold">{t('leads.colCreated')}</th>
                    <th className="px-4 py-3 font-semibold">{t('leads.colStatus')}</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l) => {
                    const converted = !!l.converted_user_id
                    return (
                      <tr
                        key={l.id}
                        onClick={() => converted && navigate(`/admin/users/${l.converted_user_id}`)}
                        className={cn(
                          'border-b border-line last:border-0',
                          converted && 'cursor-pointer hover:bg-surface-2',
                        )}
                      >
                        <td className="px-4 py-2.5 font-medium text-ink">{l.full_name || '—'}</td>
                        <td className="px-4 py-2.5 font-mono text-ink-2">{l.phone || '—'}</td>
                        <td className="px-4 py-2.5 text-ink-2">
                          {t(`leads.source.${l.source ?? 'unknown'}`, l.source ?? '—')}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-ink-3">{formatDate(l.created_at)}</td>
                        <td className="px-4 py-2.5">
                          <span
                            className={cn(
                              'rounded-full px-2 py-0.5 text-[11.5px] font-semibold',
                              converted
                                ? 'bg-success-soft text-success'
                                : 'bg-surface-3 text-ink-2',
                            )}
                          >
                            {converted ? t('leads.statusConverted') : t('leads.statusNew')}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </AppShell>
  )
}
