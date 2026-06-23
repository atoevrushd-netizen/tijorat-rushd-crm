import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <main className="flex min-h-full flex-col items-center justify-center px-4 text-center">
      <p className="font-mono text-5xl font-bold text-ink">404</p>
      <p className="mt-2 text-ink-2">Страница не найдена</p>
      <div className="mt-6 flex items-center gap-5">
        <Link
          to="/"
          className="text-sm font-medium text-accent underline underline-offset-4"
        >
          На главную
        </Link>
        <Link
          to="/login"
          className="text-sm text-ink-3 underline underline-offset-4 hover:text-ink-2"
        >
          Вход
        </Link>
      </div>
    </main>
  )
}
