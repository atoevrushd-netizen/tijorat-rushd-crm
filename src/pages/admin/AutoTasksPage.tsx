import { Gift, Package, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from '@/lib/toast'
import { AppShell } from '@/components/layout/AppShell'
import { Skeleton } from '@/components/ui/Skeleton'
import { Switch } from '@/components/ui/Switch'
import { useT } from '@/i18n/useT'
import { useSettings, useUpdateSettings } from '@/features/autotasks/useAutoTasks'

/**
 * «Авто-задачи»: включение/выключение авто-выдачи + справка о наборах.
 * Состав наборов задаётся программно по плану подписки (3/6 мес, monthly_set 0053);
 * старый редактор шаблонных групп удалён — он не влиял на выдачу с версии 0048.
 */
export function AutoTasksPage() {
  const { t } = useT()
  const settingsQ = useSettings()
  const updateSettings = useUpdateSettings()
  const settings = settingsQ.data

  return (
    <AppShell title={t('page.autotasks')} subtitle={t('at.hint')}>
      {settingsQ.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full rounded-[18px]" />
          <Skeleton className="h-40 w-full rounded-[18px]" />
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-5">
          {/* Тумблер вкл/выкл авто-выдачи */}
          <section className="flex items-center justify-between gap-4 rounded-[18px] border border-line bg-surface p-5 shadow-sh1 sm:p-6">
            <div className="flex min-w-0 items-center gap-3.5">
              <span
                className={cn(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] transition-colors',
                  settings?.auto_tasks_enabled
                    ? 'bg-success-soft text-success'
                    : 'bg-surface-2 text-ink-3',
                )}
              >
                <Zap size={20} />
              </span>
              <div className="min-w-0">
                <div className="font-semibold text-ink">{t('at.enabled')}</div>
                <div className="mt-0.5 text-[13px] text-ink-3">
                  {settings?.auto_tasks_enabled ? t('at.enabledOn') : t('at.enabledOff')}
                </div>
              </div>
            </div>
            <Switch
              checked={!!settings?.auto_tasks_enabled}
              label={t('at.enabled')}
              onChange={(v) =>
                updateSettings.mutate(
                  { auto_tasks_enabled: v },
                  { onSuccess: () => toast.success(t('common.saved')) },
                )
              }
            />
          </section>

          {/* Справка: какие наборы выдаются по планам */}
          <section className="rounded-[18px] border border-line bg-surface p-5 shadow-sh1 sm:p-6">
            <div className="mb-3 font-mono text-[11px] uppercase tracking-[.1em] text-ink-3">
              {t('at.setsTitle')}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[14px] bg-surface-2 p-4">
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-surface-3 text-ink-2">
                    <Package size={16} />
                  </span>
                  <span className="text-[14px] font-bold text-ink">{t('at.plan3Title')}</span>
                </div>
                <p className="text-[12.5px] leading-relaxed text-ink-2">{t('at.plan3Desc')}</p>
              </div>
              <div className="rounded-[14px] bg-accent-soft/60 p-4" style={{ background: 'var(--accent-soft)' }}>
                <div className="mb-1.5 flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-[10px] bg-accent-grad text-on-accent">
                    <Gift size={16} />
                  </span>
                  <span className="text-[14px] font-bold text-ink">{t('at.plan6Title')}</span>
                </div>
                <p className="text-[12.5px] leading-relaxed text-ink-2">{t('at.plan6Desc')}</p>
              </div>
            </div>
            <p className="mt-3 text-[12px] leading-snug text-ink-3">{t('at.changeNote')}</p>
          </section>
        </div>
      )}
    </AppShell>
  )
}
