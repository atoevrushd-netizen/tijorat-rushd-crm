import { Component, type ReactNode } from 'react'
import { LANG_STORAGE_KEY } from '@/i18n/language-context'
import { DEFAULT_LANG, type Lang } from '@/i18n/types'

type Props = { children: ReactNode }
type State = { error: Error | null }

// ErrorBoundary — класс ВНЕ LanguageProvider, поэтому useT недоступен: читаем
// выбранный язык напрямую из localStorage со своим минимальным словарём.
const FALLBACK: Record<Lang, { title: string; reload: string }> = {
  tg: { title: 'Хатогӣ рӯй дод', reload: 'Аз нав бор кардан' },
  ru: { title: 'Что-то пошло не так', reload: 'Перезагрузить' },
}

function pickLang(): Lang {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY)
    if (saved === 'ru' || saved === 'tg') return saved
  } catch {
    /* localStorage недоступен — язык по умолчанию */
  }
  return DEFAULT_LANG
}

/** Ловит ошибки рендера, чтобы приложение не «белело». */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (this.state.error) {
      const l = FALLBACK[pickLang()]
      return (
        <div className="flex min-h-full flex-col items-center justify-center p-6 text-center">
          <p className="text-lg font-bold text-ink">{l.title}</p>
          <p className="mt-2 max-w-md text-sm text-ink-2">
            {this.state.error.message}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-on-accent transition-colors hover:bg-accent-600"
          >
            {l.reload}
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
