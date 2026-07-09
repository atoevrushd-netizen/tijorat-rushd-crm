/** Функция перевода (из useT). */
type Translate = (key: string, fallback?: string) => string

/**
 * Дружелюбное локализованное сообщение об ошибке входа вместо сырого
 * английского текста Supabase (Invalid login credentials / Failed to fetch / …).
 */
export function authErrorMessage(err: unknown, t: Translate): string {
  const raw = err instanceof Error ? err.message.toLowerCase() : ''
  const code = String((err as { code?: string })?.code ?? '').toLowerCase()

  if (code === 'invalid_credentials' || raw.includes('invalid login')) {
    return t('auth.errInvalid')
  }
  if (
    raw.includes('failed to fetch') ||
    raw.includes('networkerror') ||
    raw.includes('load failed') ||
    raw.includes('network')
  ) {
    return t('auth.errNetwork')
  }
  if (code.includes('rate') || raw.includes('too many') || raw.includes('rate limit')) {
    return t('auth.errRateLimit')
  }
  // email not confirmed и прочее — общий текст (у нас email всегда подтверждён)
  return t('auth.error')
}
