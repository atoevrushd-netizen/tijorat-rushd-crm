import { Component, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { error: Error | null }

/** Ловит ошибки рендера, чтобы приложение не «белело». */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-full flex-col items-center justify-center p-6 text-center">
          <p className="text-lg font-bold text-ink">Что-то пошло не так</p>
          <p className="mt-2 max-w-md text-sm text-ink-2">
            {this.state.error.message}
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-on-accent transition-colors hover:bg-accent-600"
          >
            Перезагрузить
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
