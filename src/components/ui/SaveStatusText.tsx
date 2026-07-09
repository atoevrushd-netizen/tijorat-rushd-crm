import { Check, Loader2 } from 'lucide-react'
import { useT } from '@/i18n/useT'
import type { SaveStatus } from '@/lib/useAutosave'

/** Индикатор автосохранения: «сохранение…» / «сохранено» / ошибка. */
export function SaveStatusText({ status }: { status: SaveStatus }) {
  const { t } = useT()
  return (
    <div className="mt-1 h-4 text-[11px]">
      {status === 'saving' && (
        <span className="inline-flex items-center gap-1 text-ink-3">
          <Loader2 size={12} className="animate-spin" /> {t('survey.saving')}
        </span>
      )}
      {status === 'saved' && (
        <span className="inline-flex items-center gap-1 text-success">
          <Check size={12} /> {t('survey.saved')}
        </span>
      )}
      {status === 'error' && <span className="text-danger">{t('survey.saveError')}</span>}
    </div>
  )
}
