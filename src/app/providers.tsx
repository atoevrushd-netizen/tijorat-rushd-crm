import { type ReactNode } from 'react'
import {
  MutationCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { LanguageProvider } from '@/i18n/LanguageProvider'
import { LanguageToggle } from '@/i18n/LanguageToggle'
import { Toaster } from '@/components/ui/Toaster'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { errorMessage, toast } from '@/lib/toast'

// Один общий QueryClient на всё приложение.
// Любая упавшая мутация показывает тост с ошибкой (раньше многие падали молча).
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
  mutationCache: new MutationCache({
    onError: (err) => toast.error(errorMessage(err)),
  }),
})

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <AuthProvider>{children}</AuthProvider>
          {/* Внутри Router — переключатель языка использует useLocation (прячется на моб. чате) */}
          <LanguageToggle />
        </BrowserRouter>
        <Toaster />
        <ConfirmDialog />
      </LanguageProvider>
    </QueryClientProvider>
  )
}
