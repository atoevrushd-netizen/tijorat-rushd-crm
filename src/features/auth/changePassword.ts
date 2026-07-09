import { supabase } from '@/lib/supabase'

/** Достаёт понятное сообщение об ошибке из ответа Edge Function. */
async function readFunctionError(error: unknown): Promise<string> {
  const ctx = (error as { context?: Response }).context
  if (ctx && typeof ctx.json === 'function') {
    try {
      const body = await ctx.json()
      if (body?.error) return String(body.error)
    } catch {
      /* тело не JSON */
    }
  }
  return error instanceof Error ? error.message : 'Не удалось сменить пароль'
}

/** Сменить свой пароль (зная старый) через Edge Function `self-change-password`. */
export async function changeOwnPassword(
  oldPassword: string,
  newPassword: string,
): Promise<void> {
  const { error } = await supabase.functions.invoke('self-change-password', {
    body: { old_password: oldPassword, new_password: newPassword },
  })
  if (error) throw new Error(await readFunctionError(error))
}
