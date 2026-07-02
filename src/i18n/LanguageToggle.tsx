import { cn } from '@/lib/utils'
import { useT } from './useT'
import { LANGS, LANG_LABEL, LANG_SHORT } from './types'

/**
 * Переключатель языка (ТҶ | РУ) — сегментированный тумблер с плавно
 * скользящим индикатором. Зафиксирован в правом верхнем углу и присутствует
 * на всех экранах (в т.ч. на странице входа), всегда на одном месте.
 */
export function LanguageToggle() {
  const { lang, setLang, t } = useT()
  const activeIndex = LANGS.indexOf(lang)

  return (
    <div
      className="fixed right-[max(0.75rem,env(safe-area-inset-right))] top-[max(0.6rem,env(safe-area-inset-top))] z-40"
      role="group"
      aria-label={t('common.language')}
    >
      <div className="relative flex rounded-full border border-line-strong bg-[rgba(18,20,24,.82)] p-[3px] shadow-sh1 backdrop-blur-md">
        {/* Скользящий индикатор активного языка */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-[3px] left-[3px] w-9 rounded-full bg-accent shadow-[0_2px_10px_rgba(10,132,255,.45)] transition-transform duration-300 ease-kit"
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
              lang === l ? 'text-on-accent' : 'text-ink-3 hover:text-ink',
            )}
          >
            {LANG_SHORT[l]}
          </button>
        ))}
      </div>
    </div>
  )
}
