import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { useT } from '@/i18n/useT'
import { SurveyPanel } from '@/features/survey/SurveyPanel'

/** Просмотр ответов одного участника (только чтение). Доступ — админ/разработчик. */
export function AnswersViewPage() {
  const { id } = useParams()
  const { t } = useT()

  if (!id) return null

  return (
    <AppShell title={t('page.answers')} subtitle={t('survey.readonly')}>
      <div className="space-y-4">
        <Link
          to="/answers"
          className="inline-flex items-center gap-1.5 rounded-[11px] border border-line bg-surface px-3 py-2 text-[13px] font-medium text-ink-2 shadow-card transition-all duration-150 ease-kit hover:-translate-y-px hover:border-line-strong hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('users.backToList')}
        </Link>
        <SurveyPanel userId={id} editable={false} />
      </div>
    </AppShell>
  )
}
