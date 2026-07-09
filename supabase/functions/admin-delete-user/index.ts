// Edge Function: ПОЛНОЕ удаление лида (auth.users + каскад: профиль, задачи,
// ответы анкет/разбора, пароли). Необратимо. Вызывающий обязан быть админом
// или разработчиком. Защиты: нельзя удалить свой аккаунт и не-лида (role != 'user').
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.46.1'

const ALLOWED_ORIGINS = [
  'https://atoevrushd-netizen.github.io',
  'http://localhost:5173',
]

function cors(req: Request) {
  const origin = req.headers.get('Origin') ?? ''
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    Vary: 'Origin',
  }
}

function json(payload: unknown, status: number, req: Request) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...cors(req), 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors(req) })
  }

  try {
    const url = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const authHeader = req.headers.get('Authorization') ?? ''

    // 1) Вызывающий — авторизованный админ/разработчик?
    const caller = createClient(url, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: callerData, error: callerErr } = await caller.auth.getUser()
    if (callerErr || !callerData.user) {
      return json({ error: 'Не авторизован' }, 401, req)
    }

    const admin = createClient(url, serviceKey)
    const { data: me } = await admin
      .from('profiles')
      .select('role')
      .eq('id', callerData.user.id)
      .maybeSingle()
    if (me?.role !== 'admin' && me?.role !== 'developer') {
      return json({ error: 'Нужны права администратора' }, 403, req)
    }

    // 2) Валидация + защиты.
    const body = await req.json().catch(() => null)
    if (!body) return json({ error: 'Некорректный JSON' }, 400, req)
    const userId = String(body.user_id ?? '').trim()
    if (!userId) return json({ error: 'Обязателен user_id' }, 400, req)
    if (userId === callerData.user.id) {
      return json({ error: 'Нельзя удалить свой аккаунт' }, 400, req)
    }

    const { data: target } = await admin
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle()
    if (!target) return json({ error: 'Пользователь не найден' }, 404, req)
    if (target.role !== 'user') {
      return json({ error: 'Удалять навсегда можно только лидов' }, 403, req)
    }

    // 3) Удаление: сносим auth.users → каскад убирает профиль и все связанные данные.
    const { error: delErr } = await admin.auth.admin.deleteUser(userId)
    if (delErr) return json({ error: delErr.message }, 400, req)

    return json({ ok: true }, 200, req)
  } catch (e) {
    return json(
      { error: e instanceof Error ? e.message : 'Внутренняя ошибка' },
      500,
      req,
    )
  }
})
