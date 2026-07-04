import { Link } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { adminNav } from '@/components/layout/nav'
import { Avatar } from '@/components/ui/Avatar'
import { Skeleton } from '@/components/ui/Skeleton'
import { useT } from '@/i18n/useT'
import { useSurveyPeople } from '@/features/survey/useSurvey'

/** «Ответы всех»: список участников — открыть, чтобы посмотреть ответы. */
export function AnswersListPage() {
  const { t } = useT()
  const { data, isLoading, isError } = useSurveyPeople()

  return (
    <AppShell title={t('page.answers')} subtitle={t('survey.peopleHint')} nav={adminNav}>
      {isLoading && (
        <div className="grid gap-2 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger">
          {t('survey.loadError')}
        </div>
      )}

      {data && data.length === 0 && (
        <p className="py-10 text-center text-sm text-ink-3">
          {t('survey.peopleEmpty')}
        </p>
      )}

      {data && data.length > 0 && (
        <ul className="grid gap-2 sm:grid-cols-2">
          {data.map((p) => (
            <li key={p.id}>
              <Link
                to={`/answers/${p.id}`}
                className="flex items-center gap-3 rounded-xl border border-line bg-surface p-3 transition-all duration-[180ms] ease-kit hover:-translate-y-0.5 hover:border-line-strong hover:shadow-sh2"
              >
                <Avatar name={p.full_name} src={p.photo_url} size={44} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium text-ink">
                    {p.full_name || '—'}
                  </div>
                  <div className="text-[12px] text-accent">
                    {t('survey.viewAnswers')} →
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  )
}
