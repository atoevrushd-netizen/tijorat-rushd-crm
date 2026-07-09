// Edge Function: смена/сброс пароля пользователя администратором.
// Пароль меняется через service-ключ (только на сервере). Вызывающий обязан
// быть админом/разработчиком. Защита от эскалации: обычный админ НЕ может менять
// пароль другому админу/разработчику — только разработчик (или сам себе).
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

    // 2) Валидация.
    const body = await req.json().catch(() => null)
    if (!body) return json({ error: 'Некорректный JSON' }, 400, req)
    const userId = String(body.user_id ?? '').trim()
    const password = String(body.password ?? '')
    if (!userId || !password) {
      return json({ error: 'Обязательны: user_id и пароль' }, 400, req)
    }
    if (password.length < 6) {
      return json({ error: 'Пароль не короче 6 символов' }, 400, req)
    }

    // 3) Защита от эскалации: пароль админа/разработчика может менять только
    //    разработчик (или сам владелец аккаунта).
    const { data: target } = await admin
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle()
    if (!target) return json({ error: 'Пользователь не найден' }, 404, req)
    if (
      (target.role === 'admin' || target.role === 'developer') &&
      me.role !== 'developer' &&
      userId !== callerData.user.id
    ) {
      return json(
        { error: 'Пароль администратора/разработчика может менять только разработчик' },
        403,
        req,
      )
    }

    // 4) Смена пароля (service-ключ).
    const { error: updErr } = await admin.auth.admin.updateUserById(userId, {
      password,
    })
    if (updErr) {
      return json({ error: updErr.message }, 400, req)
    }

    // Сохраняем новый пароль открыто (для просмотра администратором).
    const { error: credErr } = await admin.from('user_credentials').upsert({
      user_id: userId,
      password,
      updated_by: callerData.user.id,
    })
    if (credErr) {
      console.error('[admin-set-password] пароль не сохранён:', credErr.message)
    }

    return json({ ok: true }, 200, req)
  } catch (e) {
    return json(
      { error: e instanceof Error ? e.message : 'Внутренняя ошибка' },
      500,
      req,
    )
  }
})
