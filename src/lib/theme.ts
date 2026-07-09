/** Тема оформления: светлая, тёмная или «как в системе». */
export type Theme = 'light' | 'dark' | 'system'

const KEY = 'tj_theme'
const DARK_BG = '#0b0d12'
const LIGHT_BG = '#f2f2f7'

function prefersDark(): boolean {
  return (
    typeof matchMedia !== 'undefined' &&
    matchMedia('(prefers-color-scheme: dark)').matches
  )
}

/** Сохранённый выбор (по умолчанию — «как в системе»). */
export function getTheme(): Theme {
  try {
    const s = localStorage.getItem(KEY)
    if (s === 'light' || s === 'dark' || s === 'system') return s
  } catch {
    /* localStorage недоступен */
  }
  return 'system'
}

/** Применить тему к <html> (data-theme) + обновить meta theme-color. */
export function applyTheme(theme: Theme): void {
  const dark = theme === 'dark' || (theme === 'system' && prefersDark())
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light')
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', dark ? DARK_BG : LIGHT_BG)
}

/** Сохранить выбор и применить. */
export function setTheme(theme: Theme): void {
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    /* ignore */
  }
  applyTheme(theme)
}

/** Инициализация при старте приложения (вызывать до рендера). */
export function initTheme(): void {
  applyTheme(getTheme())
  if (typeof matchMedia !== 'undefined') {
    matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (getTheme() === 'system') applyTheme('system')
    })
  }
}
