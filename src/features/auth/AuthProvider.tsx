import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session } from '@supabase/supabase-js'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { AuthContext } from './auth-context'
import { fetchProfile, signInWithPassword, signOut } from './api'
import type { AuthContextValue, AuthStatus, Profile } from './types'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    let active = true
    let runId = 0 // защита от гонок: применяем только результат последнего запроса

    async function loadProfile(currentSession: Session | null) {
      const myRun = ++runId
      const apply = (next: () => void) => {
        if (active && myRun === runId) next()
      }

      if (!currentSession) {
        apply(() => {
          setProfile(null)
          setStatus('unauthenticated')
        })
        return
      }
      try {
        const loaded = await fetchProfile(currentSession.user.id)
        apply(() => {
          setProfile(loaded)
          setStatus('authenticated')
        })
      } catch {
        apply(() => {
          setProfile(null)
          setStatus('authenticated')
        })
      }
    }

    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      if (event === 'SIGNED_OUT') {
        // не оставляем чувствительные данные (пароли) в кэше после выхода
        queryClient.clear()
      }
      setSession(next)
      void loadProfile(next)
    })

    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [queryClient])

  // Перечитать профиль (например, после самостоятельной правки в кабинете).
  const refreshProfile = useCallback(async () => {
    if (!session) return
    try {
      const loaded = await fetchProfile(session.user.id)
      setProfile(loaded)
    } catch {
      // оставляем текущий профиль
    }
  }, [session])

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      session,
      profile,
      role: profile?.role ?? null,
      signInWithPassword,
      signOut,
      refreshProfile,
    }),
    [status, session, profile, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
