// Edge Function: пользователь сам меняет свой пароль (зная старый).
// Проверяет старый пароль повторным входом, ставит новый через service-ключ и
// синхронизирует user_credentials (чтобы админ по-прежнему видел актуальный пароль).
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

Deno.serve(async (req) => {
  const json = (payload: unknown, status: number) =>
    new Response(JSON.stringify(payload), {
      status,
      headers: { ...cors(req), 'Content-Type': 'application/json' },
    })

  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors(req) })

  try {
    const url = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const authHeader = req.headers.get('Authorization') ?? ''

    // Кто вызывает?
    const caller = createClient(url, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: callerData, error: callerErr } = await caller.auth.getUser()
    if (callerErr || !callerData.user?.email) {
      return json({ error: 'Не авторизован' }, 401)
    }

    const body = await req.json().catch(() => null)
    if (!body) return json({ error: 'Некорректный JSON' }, 400)
    const oldPassword = String(body.old_password ?? '')
    const newPassword = String(body.new_password ?? '')
    if (!oldPassword || !newPassword) {
      return json({ error: 'Укажите старый и новый пароль' }, 400)
    }
    if (newPassword.length < 6) {
      return json({ error: 'Новый пароль не короче 6 символов' }, 400)
    }

    // Проверяем старый пароль повторным входом (отдельный клиент, без сессии).
    const verifier = createClient(url, anonKey)
    const { error: signErr } = await verifier.auth.signInWithPassword({
      email: callerData.user.email,
      password: oldPassword,
    })
    if (signErr) {
      return json({ error: 'Старый пароль неверный' }, 403)
    }

    // Ставим новый пароль (service-ключ) + синхронизируем открытый пароль.
    const admin = createClient(url, serviceKey)
    const { error: updErr } = await admin.auth.admin.updateUserById(callerData.user.id, {
      password: newPassword,
    })
    if (updErr) return json({ error: updErr.message }, 400)

    const { error: credErr } = await admin.from('user_credentials').upsert({
      user_id: callerData.user.id,
      password: newPassword,
      updated_by: callerData.user.id,
    })
    if (credErr) {
      console.error('[self-change-password] пароль не синхронизирован:', credErr.message)
    }

    return json({ ok: true }, 200)
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'Внутренняя ошибка' }, 500)
  }
})
