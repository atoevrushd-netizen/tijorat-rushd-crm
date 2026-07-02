import { Link, useParams } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { adminNav, userNav } from '@/components/layout/nav'
import { useAuth } from '@/features/auth/useAuth'
import { useT } from '@/i18n/useT'
import { SurveyPanel } from '@/features/survey/SurveyPanel'

/** Просмотр ответов одного участника (только чтение). Открыт всем авторизованным. */
export function AnswersViewPage() {
  const { id } = useParams()
  const { role } = useAuth()
  const { t } = useT()
  const nav = role === 'admin' ? adminNav : userNav

  if (!id) return null

  return (
    <AppShell title={t('page.answers')} subtitle={t('survey.readonly')} nav={nav}>
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
