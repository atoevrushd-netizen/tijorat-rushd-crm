import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Check, ChevronLeft } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { Avatar } from '@/components/ui/Avatar'
import { useAuth } from '@/features/auth/useAuth'
import { useT } from '@/i18n/useT'
import { saveUser } from '@/features/users/api'
import { LeadCardPanel } from '@/features/leadcard/LeadCardPanel'

/**
 * «Мои данные» — отдельная страница-кабинет данных лида.
 * Имя редактируется здесь и синхронизируется в профиль (обновляется везде);
 * остальные поля — в бизнес-карте (lead_cards) с автосохранением.
 */
export function MyDataPage() {
  const { profile, refreshProfile } = useAuth()
  const { t } = useT()
  const qc = useQueryClient()
  const saveName = useMutation({ mutationFn: saveUser })

  const [name, setName] = useState('')
  const savedRef = useRef('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!profile) return
    setName(profile.full_name ?? '')
    savedRef.current = profile.full_name ?? ''
  }, [profile])

  if (!profile) return null

  async function blurName() {
    const next = name.trim()
    if (next === savedRef.current) return
    try {
      await saveName.mutateAsync({ id: profile!.id, patch: { full_name: next } })
      await refreshProfile()
      void qc.invalidateQueries({ queryKey: ['users'] })
      void qc.invalidateQueries({ queryKey: ['user', profile!.id] })
      savedRef.current = next
      setName(next)
      setSaved(true)
      setTimeout(() => setSaved(false), 1500)
    } catch {
      /* ошибку покажет глобальный обработчик мутаций */
    }
  }

  return (
    <AppShell title={t('leadcard.title')} subtitle={t('leadcard.subtitle')}>
      <div className="space-y-4 sm:space-y-5">
        <Link
          to="/cabinet"
          className="inline-flex items-center gap-1 rounded-full border border-line bg-surface py-1.5 pl-2 pr-3.5 text-[13px] font-medium text-ink-2 shadow-card transition-all duration-150 ease-ios hover:border-line-strong hover:bg-surface-2 hover:text-ink active:scale-[.97]"
        >
          <ChevronLeft size={16} />
          {t('nav.myCabinet')}
        </Link>

        {/* Имя (редактируется, синхронизируется в профиль) */}
        <section className="rounded-[18px] border border-line bg-surface p-5 shadow-sh1 sm:p-6">
          <div className="flex items-center gap-4">
            <Avatar
              name={name}
              src={profile.photo_url}
              size={60}
              className="ring-2 ring-accent-soft"
            />
            <label className="block min-w-0 flex-1">
              <span className="mb-1.5 flex items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-wider text-ink-3">
                {t('leadcard.name')}
                {saved && <Check className="h-3 w-3 text-success" />}
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={blurName}
                placeholder={t('leadcard.name')}
                className="w-full rounded-[12px] border border-transparent bg-surface-2 px-3.5 py-2.5 text-[16px] font-semibold text-ink outline-none transition-colors placeholder:font-normal placeholder:text-ink-3 focus:border-accent focus:bg-surface"
              />
            </label>
          </div>
        </section>

        {/* Бизнес-карта: 17 полей */}
        <LeadCardPanel userId={profile.id} editable />
      </div>
    </AppShell>
  )
}
