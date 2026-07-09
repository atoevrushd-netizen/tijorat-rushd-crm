import { useState, type ReactNode } from 'react'
import { Monitor, Moon, Palette, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useT } from '@/i18n/useT'
import { getTheme, setTheme, type Theme } from '@/lib/theme'
import { Section } from './SettingsUI'

const OPTIONS: { value: Theme; icon: ReactNode; labelKey: string }[] = [
  { value: 'light', icon: <Sun size={15} />, labelKey: 'settings.themeLight' },
  { value: 'dark', icon: <Moon size={15} />, labelKey: 'settings.themeDark' },
  { value: 'system', icon: <Monitor size={15} />, labelKey: 'settings.themeSystem' },
]

/** Выбор темы оформления (светлая/тёмная/системная). Применяется мгновенно. */
export function ThemeSection() {
  const { t } = useT()
  const [theme, setThemeState] = useState<Theme>(getTheme)

  function choose(v: Theme) {
    setThemeState(v)
    setTheme(v)
  }

  return (
    <Section icon={<Palette size={16} />} title={t('settings.theme')}>
      <div className="inline-flex flex-wrap gap-1 rounded-[13px] border border-line bg-surface-2 p-1">
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => choose(o.value)}
            aria-pressed={theme === o.value}
            className={cn(
              'flex items-center gap-2 rounded-[10px] px-3.5 py-2 text-[13px] font-semibold transition-all duration-200 ease-ios',
              theme === o.value
                ? 'bg-accent-grad text-on-accent shadow-glow'
                : 'text-ink-2 hover:bg-surface-3 hover:text-ink',
            )}
          >
            {o.icon}
            {t(o.labelKey)}
          </button>
        ))}
      </div>
    </Section>
  )
}
