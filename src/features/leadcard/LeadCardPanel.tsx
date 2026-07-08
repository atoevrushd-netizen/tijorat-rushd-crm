import { useEffect, useRef, useState } from 'react'
import { Check, IdCard } from 'lucide-react'
import { Skeleton } from '@/components/ui/Skeleton'
import { useT } from '@/i18n/useT'
import type { LeadCardField } from '@/types'
import { LEAD_CARD_GROUPS, LEAD_CARD_LABEL } from './fields'
import { useLeadCard, useUpsertLeadCard } from './useLeadCard'

/** Одно поле карточки: подпись + значение, автосохранение при потере фокуса. */
function Field({
  label,
  initial,
  readOnly,
  onSave,
}: {
  label: string
  initial: string
  readOnly: boolean
  onSave: (value: string) => Promise<unknown>
}) {
  const [value, setValue] = useState(initial)
  const savedRef = useRef(initial)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setValue(initial)
    savedRef.current = initial
  }, [initial])

  async function blur() {
    const next = value.trim()
    if (readOnly || next === savedRef.current) return
    try {
      await onSave(next)
      savedRef.current = next
      setValue(next)
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    } catch {
      /* ошибку покажет глобальный обработчик мутаций */
    }
  }

  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 px-0.5 font-mono text-[10.5px] uppercase tracking-wider text-ink-3">
        {label}
        {saved && <Check className="h-3 w-3 text-success" />}
      </span>
      {readOnly ? (
        <div className="rounded-[12px] bg-surface-2 px-3.5 py-2.5 text-[14px] text-ink">
          {value || '—'}
        </div>
      ) : (
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={blur}
          placeholder="—"
          className="w-full rounded-[12px] border border-transparent bg-surface-2 px-3.5 py-2.5 text-[14px] text-ink outline-none transition-colors placeholder:text-ink-3 focus:border-accent focus:bg-surface"
        />
      )}
    </label>
  )
}

/**
 * «Мои данные» — бизнес-карта лида: личные/бизнес/финансовые поля с автосохранением.
 * Пока таблицы нет (миграция 0030 не применена) — не рендерится, кабинет не ломается.
 */
export function LeadCardPanel({
  userId,
  editable = true,
}: {
  userId: string
  editable?: boolean
}) {
  const { t } = useT()
  const { data, isLoading, isError } = useLeadCard(userId)
  const upsert = useUpsertLeadCard(userId)

  // Таблицы ещё нет / нет доступа — тихо скрываем блок (не ломаем кабинет).
  if (isError) return null

  return (
    <section className="animate-rise rounded-[18px] border border-line bg-surface p-5 shadow-sh1 sm:p-6">
      <header className="mb-5 flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] bg-accent-soft text-accent">
          <IdCard size={20} />
        </span>
        <div className="min-w-0">
          <h2 className="text-[16px] font-bold text-ink">{t('leadcard.title')}</h2>
          <p className="truncate text-[12.5px] text-ink-3">{t('leadcard.subtitle')}</p>
        </div>
      </header>

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[68px] rounded-[12px]" />
          ))}
        </div>
      ) : (
        <div className="space-y-5">
          {LEAD_CARD_GROUPS.map((group) => (
            <div key={group.titleKey}>
              <div className="mb-2.5 px-0.5 font-mono text-[11px] uppercase tracking-[.1em] text-ink-3">
                {t(group.titleKey)}
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.fields.map((field: LeadCardField) => (
                  <Field
                    key={field}
                    label={t(LEAD_CARD_LABEL[field])}
                    initial={data?.[field] ?? ''}
                    readOnly={!editable}
                    onSave={(v) => upsert.mutateAsync({ [field]: v })}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
