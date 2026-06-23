import { useContext } from 'react'
import { AuthContext } from './auth-context'

/** Доступ к состоянию авторизации. Используется внутри <AuthProvider>. */
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth должен использоваться внутри <AuthProvider>')
  }
  return ctx
}
