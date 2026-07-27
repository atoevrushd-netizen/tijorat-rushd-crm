import { ErrorBoundary } from '@/app/ErrorBoundary'
import { AppProviders } from '@/app/providers'
import { AppRouter } from '@/app/router'
import { MaintenancePage } from '@/app/MaintenancePage'

// ⏸️ ПАУЗА САЙТА. true → вместо CRM показывается страница «временно на паузе»
// (база Supabase и данные НЕ затрагиваются). Чтобы снова включить приложение —
// поставить false и запушить (или откатить коммит паузы). Тип boolean задан явно,
// чтобы код приложения ниже не считался недостижимым.
const PAUSED: boolean = true

export function App() {
  if (PAUSED) return <MaintenancePage />

  return (
    <ErrorBoundary>
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </ErrorBoundary>
  )
}
