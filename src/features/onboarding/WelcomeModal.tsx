import { useEffect, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronRight, ClipboardList, IdCard, ListChecks } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/features/auth/useAuth'
import { useT } from '@/i18n/useT'

const seenKey = (uid: string) => `tj_welcomed_${uid}`

function wasSeen(uid: string): boolean {
  try {
    return localStorage.getItem(seenKey(uid)) === '1'
  } catch {
    return true // нет доступа к localStorage — не навязываем модалку
  }
}

/**
 * Приветствие нового лида при первом входе (один раз, флаг в localStorage):
 * чек-лист первых шагов со ссылками. Показывается только лидам (role='user').
 */
export function WelcomeModal() {
  const { profile, role } = useAuth()
  const { t } = useT()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const uid = profile?.id ?? ''
  useEffect(() => {
    if (role === 'user' && uid && !wasSeen(uid)) setOpen(true)
  }, [role, uid])

  function dismiss() {
    try {
      localStorage.setItem(seenKey(uid), '1')
    } catch {
      /* ignore */
    }
    setOpen(false)
  }

  function goto(path: string) {
    dismiss()
    navigate(path)
  }

  const name = (profile?.full_name || '').split(' ')[0]

  return (
    <Modal open={open} onClose={dismiss} title={`${t('onb.welcome')}${name ? ', ' + name : ''}! 👋`}>
      <p className="mb-4 text-[13.5px] text-ink-2">{t('onb.intro')}</p>

      <div className="space-y-2.5">
        <Step
          icon={<IdCard size={20} />}
          title={t('onb.step1Title')}
          sub={t('onb.step1Sub')}
          onClick={() => goto('/my-data')}
        />
        <Step
          icon={<ClipboardList size={20} />}
          title={t('onb.step2Title')}
          sub={t('onb.step2Sub')}
          onClick={() => goto('/survey')}
        />
        <Step
          icon={<ListChecks size={20} />}
          title={t('onb.step3Title')}
          sub={t('onb.step3Sub')}
          onClick={() => goto('/cabinet')}
        />
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <Button variant="secondary" onClick={dismiss}>
          {t('onb.later')}
        </Button>
        <Button onClick={() => goto('/my-data')}>{t('onb.start')}</Button>
      </div>
    </Modal>
  )
}

function Step({
  icon,
  title,
  sub,
  onClick,
}: {
  icon: ReactNode
  title: string
  sub: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex w-full items-center gap-3 rounded-[14px] border border-line bg-surface-2 p-3.5 text-left transition-all duration-150 ease-ios hover:border-line-strong hover:bg-surface active:scale-[.99]"
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] bg-accent-grad text-on-accent shadow-glow">
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14px] font-bold text-ink">{title}</span>
        <span className="block truncate text-[12px] text-ink-3">{sub}</span>
      </span>
      <ChevronRight size={18} className="shrink-0 text-ink-3 transition-colors group-hover:text-accent" />
    </button>
  )
}
