import { AppShell } from '@/components/layout/AppShell'
import { userNav } from '@/components/layout/nav'
import { useAuth } from '@/features/auth/useAuth'
import { useT } from '@/i18n/useT'
import { RazborPanel } from '@/features/razbor/RazborPanel'

/** Вкладка «Разбор» — коуч-разборы: текст + поля ответов лида. */
export function RazborPage() {
  const { profile } = useAuth()
  const { t } = useT()
  if (!profile) return null

  return (
    <AppShell title={t('page.razbor')} subtitle={t('razbor.hint')} nav={userNav}>
      <RazborPanel userId={profile.id} editable />
    </AppShell>
  )
}
