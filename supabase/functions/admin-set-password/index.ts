// Edge Function: смена/сброс пароля пользователя администратором.
// Пароль меняется через service-ключ (только на сервере). Старый пароль
// недоступен (хэширован) — админ задаёт новый. Вызывающий обязан быть админом.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.46.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(payload: unknown, status: number) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const authHeader = req.headers.get('Authorization') ?? ''

    // 1) Вызывающий — авторизованный администратор?
    const caller = createClient(url, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: callerData, error: callerErr } = await caller.auth.getUser()
    if (callerErr || !callerData.user) {
      return json({ error: 'Не авторизован' }, 401)
    }

    const admin = createClient(url, serviceKey)
    const { data: me } = await admin
      .from('profiles')
      .select('role')
      .eq('id', callerData.user.id)
      .maybeSingle()
    if (me?.role !== 'admin') {
      return json({ error: 'Нужны права администратора' }, 403)
    }

    // 2) Валидация.
    const body = await req.json().catch(() => null)
    if (!body) return json({ error: 'Некорректный JSON' }, 400)
    const userId = String(body.user_id ?? '').trim()
    const password = String(body.password ?? '')
    if (!userId || !password) {
      return json({ error: 'Обязательны: user_id и пароль' }, 400)
    }
    if (password.length < 6) {
      return json({ error: 'Пароль не короче 6 символов' }, 400)
    }

    // 3) Смена пароля (service-ключ).
    const { error: updErr } = await admin.auth.admin.updateUserById(userId, {
      password,
    })
    if (updErr) {
      return json({ error: updErr.message }, 400)
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

    return json({ ok: true }, 200)
  } catch (e) {
    return json(
      { error: e instanceof Error ? e.message : 'Внутренняя ошибка' },
      500,
    )
  }
})
