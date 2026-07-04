import { AppShell } from '@/components/layout/AppShell'
import { useAuth } from '@/features/auth/useAuth'
import { useT } from '@/i18n/useT'
import { SurveyPanel } from '@/features/survey/SurveyPanel'

/** Отдельная вкладка «Анкета» — лид отвечает на вопросы (A/B). */
export function MySurveyPage() {
  const { profile } = useAuth()
  const { t } = useT()
  if (!profile) return null

  return (
    <AppShell title={t('nav.mySurvey')} subtitle={t('survey.hint')}>
      <SurveyPanel userId={profile.id} editable />
    </AppShell>
  )
}
