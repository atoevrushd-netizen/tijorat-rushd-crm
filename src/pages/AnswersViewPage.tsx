import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ExternalLink } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { Avatar } from '@/components/ui/Avatar'
import { useT } from '@/i18n/useT'
import { useUser } from '@/features/users/useUser'
import { SurveyPanel } from '@/features/survey/SurveyPanel'

/** Просмотр ответов одного участника (только чтение). Доступ — админ/разработчик. */
export function AnswersViewPage() {
  const { id } = useParams()
  const { t } = useT()
  const { data: person } = useUser(id)

  if (!id) return null

  // Чьи это ответы — в заголовке (раньше страница не показывала имя вообще).
  const name = person?.full_name || person?.login || ''

  return (
    <AppShell title={name || t('page.answers')} subtitle={t('survey.readonly')}>
      <div className="space-y-4">
        <Link
          to="/answers"
          className="inline-flex items-center gap-1.5 rounded-[11px] border border-line bg-surface px-3 py-2 text-[13px] font-medium text-ink-2 shadow-card transition-all duration-150 ease-kit hover:-translate-y-px hover:border-line-strong hover:text-ink"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('users.backToList')}
        </Link>
        {person && (
          <Link
            to={`/admin/users/${person.id}`}
            className="flex items-center gap-3 rounded-[16px] border border-line bg-surface p-3 shadow-sh1 transition-colors hover:bg-surface-2"
          >
            <Avatar name={person.full_name} src={person.photo_url} size={40} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14px] font-semibold text-ink">{name || '—'}</span>
              <span className="block truncate font-mono text-[11.5px] text-ink-3">{person.phone || person.login || ''}</span>
            </span>
            <ExternalLink size={16} className="shrink-0 text-ink-3" />
          </Link>
        )}
        <SurveyPanel userId={id} editable={false} />
      </div>
    </AppShell>
  )
}
