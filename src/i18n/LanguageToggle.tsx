import { useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { useMediaQuery } from '@/lib/useMediaQuery'
import { useT } from './useT'
import { LANGS, LANG_LABEL, LANG_SHORT } from './types'

/**
 * Переключатель языка (ТҶ | РУ) — сегментированный тумблер с плавно
 * скользящим индикатором. Зафиксирован в правом верхнем углу и присутствует
 * на всех экранах (в т.ч. на странице входа), всегда на одном месте.
 * Скрыт на полноэкранном мобильном чате — там он перекрыл бы шапку диалога.
 */
export function LanguageToggle() {
  const { lang, setLang, t } = useT()
  const { pathname } = useLocation()
  // Тот же порог, что и полноэкранный моб. чат в ChatPage (min-width:768px),
  // чтобы не было «мёртвой зоны» на дробной ширине ~767.5px.
  const desktop = useMediaQuery('(min-width: 768px)')
  const activeIndex = LANGS.indexOf(lang)

  if (!desktop && pathname.startsWith('/chat')) return null

  return (
    <div
      className="fixed right-[max(0.75rem,env(safe-area-inset-right))] top-[max(0.6rem,env(safe-area-inset-top))] z-40"
      role="group"
      aria-label={t('common.language')}
    >
      <div className="relative flex rounded-full border border-line bg-[var(--header-bg)] p-[3px] shadow-sh1 backdrop-blur-md">
        {/* Скользящий индикатор активного языка */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-[3px] left-[3px] w-9 rounded-full bg-accent-grad shadow-glow transition-transform duration-300 ease-kit"
          style={{ transform: `translateX(${activeIndex * 100}%)` }}
        />
        {LANGS.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLang(l)}
            aria-pressed={lang === l}
            title={LANG_LABEL[l]}
            className={cn(
              'relative z-10 w-9 rounded-full py-[5px] text-[11.5px] font-bold tracking-wide transition-colors duration-200',
              lang === l ? 'text-on-accent' : 'text-ink-2 hover:text-ink',
            )}
          >
            {LANG_SHORT[l]}
          </button>
        ))}
      </div>
    </div>
  )
}
