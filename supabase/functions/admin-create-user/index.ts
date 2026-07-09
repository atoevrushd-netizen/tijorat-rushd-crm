// Edge Function: создание пользователя администратором.
// Безопасно выдаёт логин/пароль: пароль хэшируется GoTrue, service-ключ
// доступен только на сервере (не в браузере). Сама функция проверяет,
// что вызывающий — администратор.
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

// Та же логика, что и в src/lib/loginEmail.ts (Deno не видит src/).
const LOGIN_EMAIL_DOMAIN = 'users.tijorat.local'
function normalizeLogin(login: string): string {
  return login.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '')
}

Deno.serve(async (req) => {
  const json = (payload: unknown, status: number) =>
    new Response(JSON.stringify(payload), {
      status,
      headers: { ...cors(req), 'Content-Type': 'application/json' },
    })

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors(req) })
  }

  try {
    const url = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const authHeader = req.headers.get('Authorization') ?? ''

    // 1) Проверяем, что вызывающий — авторизованный администратор.
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

    // 2) Валидация входных данных.
    const body = await req.json().catch(() => null)
    if (!body) return json({ error: 'Некорректный JSON' }, 400)

    const login = normalizeLogin(String(body.login ?? ''))
    const password = String(body.password ?? '')
    const fullName = String(body.full_name ?? '').trim()
    const phone = String(body.phone ?? '').trim()
    const businessDirection = body.business_direction
      ? String(body.business_direction).trim()
      : null
    const status = ['active', 'paused', 'archived'].includes(body.status)
      ? body.status
      : 'active'

    if (!login || !password || !fullName || !phone) {
      return json(
        { error: 'Обязательны: логин, пароль, имя, телефон' },
        400,
      )
    }
    if (login.length < 3) {
      return json(
        { error: 'Логин не короче 3 символов (латиница, цифры, . _ -)' },
        400,
      )
    }
    if (password.length < 6) {
      return json({ error: 'Пароль не короче 6 символов' }, 400)
    }

    // Supabase Auth требует email — генерируем синтетический из логина.
    const email = `${login}@${LOGIN_EMAIL_DOMAIN}`

    // 3) Создаём пользователя (пароль хэшируется GoTrue).
    const { data: created, error: createErr } =
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: fullName },
      })
    if (createErr || !created.user) {
      const raw = createErr?.message ?? ''
      const friendly = /already (been )?registered|already exists|duplicate/i.test(raw)
        ? 'Этот логин уже занят'
        : raw || 'Не удалось создать пользователя'
      return json({ error: friendly }, 400)
    }
    const newId = created.user.id

    // 4) Дозаполняем профиль (строку уже создал триггер handle_new_user).
    const { error: updErr } = await admin
      .from('profiles')
      .update({
        full_name: fullName,
        phone,
        business_direction: businessDirection,
        status,
        login,
      })
      .eq('id', newId)
    if (updErr) {
      // Откат: не оставляем «осиротевшего» пользователя в auth без заполненного профиля.
      await admin.auth.admin.deleteUser(newId)
      return json({ error: `Профиль: ${updErr.message}` }, 400)
    }

    // 4b) Сохраняем пароль открыто (читает только админ) — чтобы админ его видел.
    const { error: credErr } = await admin.from('user_credentials').upsert({
      user_id: newId,
      password,
      updated_by: callerData.user.id,
    })
    if (credErr) {
      console.error('[admin-create-user] пароль не сохранён:', credErr.message)
    }

    // 5) Фиксируем лид (требование ТЗ: имя + телефон при каждой регистрации).
    const { error: leadErr } = await admin.from('leads').insert({
      full_name: fullName,
      phone,
      source: 'admin_created',
      converted_user_id: newId,
    })
    if (leadErr) {
      // Пользователь создан успешно; лид не критичен для входа — логируем, не валим запрос.
      console.error('[admin-create-user] лид не записан:', leadErr.message)
    }

    return json({ id: newId, email }, 200)
  } catch (e) {
    return json(
      { error: e instanceof Error ? e.message : 'Внутренняя ошибка' },
      500,
    )
  }
})
