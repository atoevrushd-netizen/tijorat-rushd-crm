import { Navigate } from 'react-router-dom'
import { FullPageSpinner } from '@/components/ui/FullPageSpinner'
import { useAuth } from './useAuth'
import { NoProfileScreen } from './NoProfileScreen'

/** Разводит вошедшего пользователя по разделу в зависимости от роли. */
export function HomeRedirect() {
  const { status, role } = useAuth()
  if (status === 'loading') return <FullPageSpinner />
  if (status === 'unauthenticated') return <Navigate to="/login" replace />
  if (!role) return <NoProfileScreen /> // авторизован, но роль не загрузилась — без цикла
  return <Navigate to={role === 'admin' ? '/admin' : '/cabinet'} replace />
}
