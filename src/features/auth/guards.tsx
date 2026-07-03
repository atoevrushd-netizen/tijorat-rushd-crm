import { Navigate, Outlet } from 'react-router-dom'
import type { UserRole } from '@/types'
import { FullPageSpinner } from '@/components/ui/FullPageSpinner'
import { useAuth } from './useAuth'
import { NoProfileScreen } from './NoProfileScreen'

/** Пускает только авторизованных; иначе — на страницу входа. */
export function RequireAuth() {
  const { status } = useAuth()
  if (status === 'loading') return <FullPageSpinner />
  if (status === 'unauthenticated') return <Navigate to="/login" replace />
  return <Outlet />
}

/** Пускает только пользователей с нужной ролью; иначе — на главную.
 *  Если профиль/роль не загрузились — показываем экран, а не редиректим (защита от цикла). */
export function RequireRole({ role }: { role: UserRole }) {
  const { status, role: currentRole } = useAuth()
  if (status === 'loading') return <FullPageSpinner />
  if (status === 'unauthenticated') return <Navigate to="/login" replace />
  if (!currentRole) return <NoProfileScreen />
  // Разработчик — супер-доступ: проходит и на admin-, и на developer-маршруты.
  const allowed =
    currentRole === role || (currentRole === 'developer' && role === 'admin')
  if (!allowed) return <Navigate to="/" replace />
  return <Outlet />
}
