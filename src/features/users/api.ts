import { supabase } from '@/lib/supabase'
import type { Profile, UserStatus } from '@/types'
import { buildSearchFilter } from './buildSearchFilter'
import type { UsersPage, UsersQuery } from './types'

/** Список пользователей с поиском и пагинацией (RLS пускает только админов). */
export async function listUsers({
  search,
  page,
  pageSize,
}: UsersQuery): Promise<UsersPage> {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('profiles')
    .select('*', { count: 'exact' })
    .order('registration_date', { ascending: false })
    .range(from, to)

  const filter = buildSearchFilter(search)
  if (filter) query = query.or(filter)

  const { data, error, count } = await query
  if (error) throw error
  return { items: (data ?? []) as Profile[], total: count ?? 0 }
}

/** Загрузить один профиль по id (для карточки пользователя). */
export async function getUser(id: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data as Profile | null
}

/** Открытый пароль пользователя (user_credentials). Читает только админ (RLS). */
export async function getUserPassword(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('user_credentials')
    .select('password')
    .eq('user_id', userId)
    .maybeSingle()
  if (error) throw error
  return (data?.password as string | undefined) ?? null
}

export type CreateUserInput = {
  full_name: string
  phone: string
  /** Логин для входа; email генерируется в Edge Function. */
  login: string
  password: string
  business_direction?: string
  status?: UserStatus
}

/**
 * Создать пользователя через защищённую Edge Function `admin-create-user`
 * (выдача пароля и service-ключ — только на сервере).
 */
export async function createUser(
  input: CreateUserInput,
): Promise<{ id: string }> {
  const { data, error } = await supabase.functions.invoke('admin-create-user', {
    body: input,
  })
  if (error) throw new Error(await readFunctionError(error))
  return data as { id: string }
}

export type UpdateUserInput = {
  full_name?: string
  phone?: string
  business_direction?: string | null
  status?: UserStatus
  admin_comment?: string | null
  photo_url?: string | null
  subscription_start?: string | null
  subscription_end?: string | null
}

/** Загрузить фото в Storage (bucket `avatars`) и вернуть публичный URL. */
export async function uploadAvatar(userId: string, file: File): Promise<string> {
  const ALLOWED = ['image/jpeg', 'image/png', 'image/webp']
  if (!ALLOWED.includes(file.type)) {
    throw new Error('Допустимы только изображения: JPG, PNG, WebP')
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Файл слишком большой (максимум 5 МБ)')
  }
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase()
  const path = `${userId}.${ext}`
  const { error } = await supabase.storage
    .from('avatars')
    .upload(path, file, { upsert: true, contentType: file.type })
  if (error) throw error
  const { data } = supabase.storage.from('avatars').getPublicUrl(path)
  // ?v=... — чтобы браузер не показывал старое фото из кэша.
  return `${data.publicUrl}?v=${Date.now()}`
}

/** Сохранить изменения профиля (при наличии файла — сначала загрузить фото). */
export async function saveUser(args: {
  id: string
  patch: UpdateUserInput
  file?: File | null
}): Promise<void> {
  const patch = { ...args.patch }
  if (args.file) {
    patch.photo_url = await uploadAvatar(args.id, args.file)
  }
  const { error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', args.id)
  if (error) throw error
}

/** Сменить/сбросить пароль пользователя (через Edge Function `admin-set-password`). */
export async function setUserPassword(
  userId: string,
  password: string,
): Promise<void> {
  const { error } = await supabase.functions.invoke('admin-set-password', {
    body: { user_id: userId, password },
  })
  if (error) throw new Error(await readFunctionError(error))
}

/** Достаёт понятное сообщение об ошибке из ответа Edge Function. */
async function readFunctionError(error: unknown): Promise<string> {
  const ctx = (error as { context?: Response }).context
  if (ctx && typeof ctx.json === 'function') {
    try {
      const body = await ctx.json()
      if (body?.error) return String(body.error)
    } catch {
      /* тело не JSON — используем общее сообщение ниже */
    }
  }
  return error instanceof Error ? error.message : 'Не удалось выполнить запрос'
}
