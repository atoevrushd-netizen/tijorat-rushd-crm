import { createContext } from 'react'
import type { AuthContextValue } from './types'

/** Контекст авторизации. Провайдер — в AuthProvider.tsx, доступ — через useAuth. */
export const AuthContext = createContext<AuthContextValue | null>(null)
