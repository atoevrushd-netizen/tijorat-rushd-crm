import { Link, useParams } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { adminNav } from '@/components/layout/nav'
import { useT } from '@/i18n/useT'
import { SurveyPanel } from '@/features/survey/SurveyPanel'

/** Просмотр ответов одного участника (только чтение). Доступ — админ/разработчик. */
export function AnswersViewPage() {
  const { id } = useParams()
  const { t } = useT()

  if (!id) return null

  return (
    <AppShell title={t('page.answers')} subtitle={t('survey.readonly')} nav={adminNav}>
      <div className="space-y-4">
        <Link
          to="/answers"
          className="inline-block text-sm text-ink-3 transition-colors hover:text-ink-2"
        >
          {t('users.backToList')}
        </Link>
        <SurveyPanel userId={id} editable={false} />
      </div>
    </AppShell>
  )
}
