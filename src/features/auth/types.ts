import type { Session } from '@supabase/supabase-js'
import type { Profile, UserRole } from '@/types'

// Profile живёт в @/types (общий доменный тип); ре-экспортируем для удобства фичи.
export type { Profile }

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

export type AuthContextValue = {
  status: AuthStatus
  session: Session | null
  profile: Profile | null
  role: UserRole | null
  signInWithPassword: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  /** Перечитать профиль текущего пользователя (после самостоятельной правки). */
  refreshProfile: () => Promise<void>
}
