import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import type { TaskTemplate } from '@/types'
import { useT } from '@/i18n/useT'

const SELECT_CLS =
  'rounded-[10px] border border-line bg-surface px-2 py-2 text-[13px] text-ink outline-none focus:border-accent'

/** Инлайн-редактируемая строка шаблона задачи. */
export function TemplateRow({
  template,
  onSave,
  onDelete,
}: {
  template: TaskTemplate
  onSave: (patch: Partial<Pick<TaskTemplate, 'title' | 'tab_key' | 'task_type' | 'deadline'>>) => void
  onDelete: () => void
}) {
  const { t } = useT()
  const [title, setTitle] = useState(template.title)
  useEffect(() => setTitle(template.title), [template.title])

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-[12px] border border-line bg-surface-2 p-2.5 transition-colors hover:border-line-strong">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => title.trim() && title !== template.title && onSave({ title: title.trim() })}
        className="min-w-[140px] flex-1 rounded-[10px] border border-line bg-surface px-2.5 py-2 text-[13px] text-ink outline-none focus:border-accent"
      />
      <select
        value={template.tab_key}
        onChange={(e) => onSave({ tab_key: e.target.value })}
        className={SELECT_CLS}
      >
        <option value="calendar">{t('at.tabCalendar')}</option>
        <option value="media">{t('at.tabMedia')}</option>
      </select>
      <select
        value={template.task_type ?? 'other'}
        onChange={(e) => onSave({ task_type: e.target.value })}
        className={SELECT_CLS}
      >
        <option value="other">{t('at.typeOther')}</option>
        <option value="reels">{t('at.typeReels')}</option>
        <option value="creative">{t('at.typeCreative')}</option>
      </select>
      <input
        type="date"
        value={template.deadline ?? ''}
        onChange={(e) => onSave({ deadline: e.target.value || null })}
        className={SELECT_CLS}
      />
      <button
        type="button"
        onClick={onDelete}
        aria-label="Удалить"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] text-ink-3 transition-colors hover:bg-danger-soft hover:text-danger"
      >
        <Trash2 size={16} />
      </button>
    </div>
  )
}
