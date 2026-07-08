import { Link } from 'react-router-dom'
import { ChevronRight, Inbox } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { Avatar } from '@/components/ui/Avatar'
import { Skeleton } from '@/components/ui/Skeleton'
import { useT } from '@/i18n/useT'
import { useSurveyPeople } from '@/features/survey/useSurvey'

/** «Ответы всех»: список участников — открыть, чтобы посмотреть ответы. */
export function AnswersListPage() {
  const { t } = useT()
  const { data, isLoading, isError } = useSurveyPeople()

  return (
    <AppShell title={t('page.answers')} subtitle={t('survey.peopleHint')}>
      {isLoading && (
        <div className="grid gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-[76px] w-full rounded-[18px]" />
          ))}
        </div>
      )}

      {isError && (
        <div className="rounded-[12px] bg-danger-soft px-4 py-3 text-sm font-medium text-danger">
          {t('survey.loadError')}
        </div>
      )}

      {data && data.length === 0 && (
        <div className="rounded-[18px] border border-line bg-surface p-10 text-center shadow-sh1">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-[14px] bg-accent-soft text-accent">
            <Inbox className="h-6 w-6" />
          </span>
          <p className="mt-4 text-sm text-ink-3">{t('survey.peopleEmpty')}</p>
        </div>
      )}

      {data && data.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2">
          {data.map((p) => (
            <li key={p.id}>
              <Link
                to={`/answers/${p.id}`}
                className="group flex items-center gap-3.5 rounded-[18px] border border-line bg-surface p-4 shadow-sh1 transition-all duration-[180ms] ease-kit hover:-translate-y-0.5 hover:border-line-strong hover:shadow-sh2"
              >
                <Avatar name={p.full_name} src={p.photo_url} size={48} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[15px] font-semibold text-ink">
                    {p.full_name || '—'}
                  </div>
                  <div className="mt-0.5 inline-flex items-center gap-1 text-[12.5px] font-medium text-accent">
                    {t('survey.viewAnswers')}
                    <ChevronRight className="h-3.5 w-3.5 transition-transform duration-200 ease-kit group-hover:translate-x-0.5" />
                  </div>
                </div>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[11px] bg-surface-2 text-ink-3 transition-colors group-hover:bg-accent-soft group-hover:text-accent">
                  <ChevronRight className="h-[18px] w-[18px]" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AppShell>
  )
}
