import { type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { LanguageProvider } from '@/i18n/LanguageProvider'
import { LanguageToggle } from '@/i18n/LanguageToggle'

// Один общий QueryClient на всё приложение.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <AuthProvider>{children}</AuthProvider>
        </BrowserRouter>
        {/* Глобальный переключатель языка — всегда в правом верхнем углу */}
        <LanguageToggle />
      </LanguageProvider>
    </QueryClientProvider>
  )
}
