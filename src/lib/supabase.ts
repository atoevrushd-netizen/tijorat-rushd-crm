import { createClient } from '@supabase/supabase-js'

// Единый клиент Supabase на всё приложение (см. docs/03-architecture.md).
const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  // Ожидаемо в Фазе 0: реальные значения зададим в .env на Фазе 1.
  console.warn(
    '[supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY не заданы. ' +
      'Это нормально для Фазы 0 — подключение настроим в Фазе 1.',
  )
}

// Заглушки-значения, чтобы клиент не падал до настройки .env.
export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  anonKey || 'placeholder-anon-key',
)
