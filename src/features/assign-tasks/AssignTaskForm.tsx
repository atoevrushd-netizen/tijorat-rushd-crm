import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { ListPlus } from 'lucide-react'
import { useT } from '@/i18n/useT'
import { monthYear } from '@/lib/dateI18n'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { TASK_CATEGORIES } from '@/features/calendar/monthly'

export type NewTaskFields = {
  title: string
  task_type: string
  /** 'YYYY-MM' из <input type="month"> */
  month: string
}

/** Текущий месяц 'YYYY-MM' (локальная зона) — дефолт для поля месяца. */
function currentMonth(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

/** Зажать 'YYYY-MM' в диапазон [min, max] (границы включительно). */
function clampMonth(m: string, min?: string, max?: string): string {
  if (min && m < min) return min
  if (max && m > max) return max
  return m
}

/**
 * Форма назначаемой задачи: название, категория, месяц + предпросмотр.
 * Месяц ограничен окном подписки выбранных резидентов (minMonth..maxMonth) — так
 * задача попадает в уже существующий месяц программы и не сдвигает нумерацию «Месяц N».
 */
export function AssignTaskForm({
  selectedCount,
  pending,
  ready,
  minMonth,
  maxMonth,
  onCreate,
}: {
  selectedCount: number
  pending: boolean
  /** id вкладки «Календарь» уже загружен — до этого создавать нельзя. */
  ready: boolean
  minMonth?: string
  maxMonth?: string
  onCreate: (fields: NewTaskFields) => void
}) {
  const { t, lang } = useT()
  const [title, setTitle] = useState('')
  const [taskType, setTaskType] = useState('lesson')
  const [month, setMonth] = useState(currentMonth)

  // Держим месяц в окне подписки выбранных резидентов (когда оно известно).
  useEffect(() => {
    setMonth((m) => clampMonth(m, minMonth, maxMonth))
  }, [minMonth, maxMonth])

  // Валидный 'YYYY-MM' в окне подписки. Firefox/Safari на десктопе рендерят
  // <input type="month"> как текст — min/max там не работают, проверяем сами.
  const monthValid =
    /^\d{4}-(0[1-9]|1[0-2])$/.test(month) &&
    (!minMonth || month >= minMonth) &&
    (!maxMonth || month <= maxMonth)
  const canSubmit = ready && selectedCount > 0 && title.trim().length > 0 && monthValid

  const monthLabel = useMemo(() => {
    if (!month) return ''
    const [y, m] = month.split('-').map(Number)
    // Название месяца на языке интерфейса (tg — вручную, ru — Intl).
    return monthYear(new Date(y, m - 1, 1), lang)
  }, [month, lang])

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!canSubmit) return
    onCreate({ title: title.trim(), task_type: taskType, month })
    // Оставляем выбор резидентов, месяц и категорию — чтобы быстро выдать ещё одну
    // задачу той же группе; чистим только название.
    setTitle('')
  }

  return (
    <form
      className="space-y-3.5 rounded-[18px] border border-line bg-surface p-4 shadow-sh1 sm:p-5"
      onSubmit={submit}
    >
      <Labeled label={t('assign.titleLabel')}>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t('assign.titlePlaceholder')}
          required
        />
      </Labeled>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Labeled label={t('assign.categoryLabel')}>
          <Select value={taskType} onChange={(e) => setTaskType(e.target.value)}>
            {TASK_CATEGORIES.map((c) => (
              <option key={c.type} value={c.type}>
                {lang === 'tg' ? c.tg : c.ru}
              </option>
            ))}
            <option value="other">{t('assign.categoryOther')}</option>
          </Select>
        </Labeled>
        <Labeled label={t('assign.monthLabel')}>
          <Input
            type="month"
            value={month}
            min={minMonth}
            max={maxMonth}
            onChange={(e) => setMonth(e.target.value)}
            required
            aria-invalid={month !== '' && !monthValid}
          />
          {month !== '' && !monthValid && (
            <p className="mt-1 text-[11.5px] font-medium text-danger">{t('assign.monthInvalid')}</p>
          )}
        </Labeled>
      </div>

      {/* Предпросмотр: что и кому создастся */}
      <div className="flex items-start gap-2.5 rounded-[12px] border border-line bg-surface-2 p-3 text-[12.5px]">
        <ListPlus className="mt-0.5 h-4 w-4 flex-none text-accent" />
        <p className="text-ink-2">
          {selectedCount === 0
            ? t('assign.previewEmpty')
            : t('assign.preview')
                .replace('{n}', String(selectedCount))
                .replace('{month}', monthLabel)}
        </p>
      </div>

      <div className="flex justify-end pt-1">
        <Button type="submit" loading={pending} disabled={!canSubmit}>
          {t('assign.createBtn').replace('{n}', String(selectedCount))}
        </Button>
      </div>
    </form>
  )
}

function Labeled({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-[12.5px] font-semibold text-ink-2">{label}</span>
      {children}
    </label>
  )
}
