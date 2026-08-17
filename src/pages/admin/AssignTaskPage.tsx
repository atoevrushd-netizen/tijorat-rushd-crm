import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { Profile } from '@/types'
import { AppShell } from '@/components/layout/AppShell'
import { toast } from '@/lib/toast'
import { useT } from '@/i18n/useT'
import { useAuth } from '@/features/auth/useAuth'
import { useCreateTasks } from '@/features/tasks/useTasks'
import type { CreateTaskInput } from '@/features/tasks/api'
import { useAllResidents, useCalendarTabId } from '@/features/assign-tasks/useAssign'
import { ResidentMultiSelect } from '@/features/assign-tasks/ResidentMultiSelect'
import { AssignTaskForm, type NewTaskFields } from '@/features/assign-tasks/AssignTaskForm'

/**
 * Пересечение окон подписки выбранных резидентов в месяцах 'YYYY-MM'.
 * blocked=true — задачу создавать НЕЛЬЗЯ: у кого-то нет подписки или окна не пересекаются
 * (иначе задача создала бы у одного из них «фантомный» месяц вне его программы).
 */
function subscriptionWindow(rs: Profile[]): { min?: string; max?: string; blocked: boolean } {
  if (rs.length === 0) return { blocked: false }
  if (rs.some((r) => !r.subscription_start || !r.subscription_end)) return { blocked: true }
  const starts = rs.map((r) => r.subscription_start!.slice(0, 7))
  const ends = rs.map((r) => r.subscription_end!.slice(0, 7))
  const min = [...starts].sort().at(-1) // самый поздний старт
  const max = [...ends].sort()[0] // самый ранний конец
  if (min && max && min > max) return { blocked: true } // окна не пересекаются
  return { min, max, blocked: false }
}

/**
 * Инструмент админа «Назначить задачу»: выбрать одного или нескольких резидентов
 * и создать им задачу за конкретный месяц (попадает в помесячный вид).
 */
export function AssignTaskPage() {
  const { t } = useT()
  const { profile } = useAuth()
  const [params] = useSearchParams()
  const preselectLead = params.get('lead')

  const {
    data: allResidents,
    isLoading,
    isError: residentsError,
    refetch: refetchResidents,
  } = useAllResidents()
  const { data: calendarTabId, isError: tabError, refetch: refetchTab } = useCalendarTabId()
  const create = useCreateTasks()
  // Готово, когда запрос id вкладки завершился (string — найдена, null — нет).
  // undefined = ещё грузится или ошибка → кнопку блокируем, ложного «не найдена» не показываем.
  const calendarReady = calendarTabId !== undefined

  // Деактивированных не показываем: они не увидят задачу (заблокированы экраном «доступ завершён»).
  const residents = useMemo(
    () => (allResidents ?? []).filter((r) => !r.deactivated_at),
    [allResidents],
  )

  const [selected, setSelected] = useState<Set<string>>(new Set())

  // Предвыбор резидента из ?lead=<id> (например, из карточки) — один раз, когда список готов.
  const preselected = useRef(false)
  useEffect(() => {
    if (preselected.current || !preselectLead || residents.length === 0) return
    if (residents.some((r) => r.id === preselectLead)) {
      setSelected((s) => new Set(s).add(preselectLead))
      preselected.current = true
    }
  }, [preselectLead, residents])

  // Окно подписки выбранных — ограничивает выбор месяца (чтобы не сдвигать нумерацию «Месяц N»).
  const monthWindow = useMemo(
    () => subscriptionWindow(residents.filter((r) => selected.has(r.id))),
    [residents, selected],
  )

  function toggle(id: string) {
    setSelected((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  function setMany(ids: string[], value: boolean) {
    setSelected((s) => {
      const next = new Set(s)
      ids.forEach((id) => (value ? next.add(id) : next.delete(id)))
      return next
    })
  }

  function onCreate(fields: NewTaskFields) {
    if (selected.size === 0) return
    if (!calendarTabId) {
      toast.error(t('assign.noCalendarTab'))
      return
    }
    const inputs: CreateTaskInput[] = [...selected].map((userId) => ({
      user_id: userId,
      tab_id: calendarTabId,
      title: fields.title,
      task_type: fields.task_type,
      period_month: `${fields.month}-01`,
      created_by: profile?.id ?? null,
    }))
    // Ошибку покажет глобальный обработчик мутаций (providers.tsx) — без дубля тоста.
    create.mutate(inputs, {
      onSuccess: () =>
        toast.success(t('assign.created').replace('{n}', String(inputs.length))),
    })
  }

  return (
    <AppShell title={t('page.assignTask')} subtitle={t('assign.subtitle')}>
      {/* Сбой запроса вкладки «Календарь» — без её id создать задачу нельзя */}
      {tabError && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-[rgba(255,69,58,.35)] bg-danger-soft px-4 py-3 text-[13px] text-danger">
          <span>{t('assign.tabLoadError')}</span>
          <button
            type="button"
            onClick={() => void refetchTab()}
            className="font-semibold underline underline-offset-2"
          >
            {t('assign.retry')}
          </button>
        </div>
      )}
      <div className="grid gap-4 lg:grid-cols-[minmax(280px,360px)_1fr]">
        <div className="h-[52vh] lg:h-[calc(100dvh-12rem)]">
          <ResidentMultiSelect
            residents={residents}
            selected={selected}
            loading={isLoading}
            error={residentsError}
            onRetry={() => void refetchResidents()}
            onToggle={toggle}
            onSetMany={setMany}
          />
        </div>
        <div className="space-y-3">
          {monthWindow.blocked && (
            <div className="rounded-[14px] border border-[rgba(255,159,10,.4)] bg-warn-soft px-4 py-3 text-[13px] text-ink-2">
              {t('assign.windowBlocked')}
            </div>
          )}
          <AssignTaskForm
            selectedCount={selected.size}
            pending={create.isPending}
            ready={calendarReady && !monthWindow.blocked}
            minMonth={monthWindow.min}
            maxMonth={monthWindow.max}
            onCreate={onCreate}
          />
        </div>
      </div>
    </AppShell>
  )
}
