import { describe, expect, it } from 'vitest'
import { authErrorMessage } from './authError'

// Заглушка перевода: возвращает сам ключ — так проверяем, КАКОЙ ключ выбран.
const t = (key: string) => key

describe('authErrorMessage', () => {
  it('неверный логин/пароль → errInvalid (по коду)', () => {
    expect(authErrorMessage({ code: 'invalid_credentials' }, t)).toBe('auth.errInvalid')
  })

  it('неверный логин/пароль → errInvalid (по тексту)', () => {
    expect(authErrorMessage(new Error('Invalid login credentials'), t)).toBe('auth.errInvalid')
  })

  it('нет сети → errNetwork', () => {
    expect(authErrorMessage(new Error('Failed to fetch'), t)).toBe('auth.errNetwork')
    expect(authErrorMessage(new Error('NetworkError when attempting'), t)).toBe('auth.errNetwork')
    expect(authErrorMessage(new Error('Load failed'), t)).toBe('auth.errNetwork')
  })

  it('слишком много попыток → errRateLimit', () => {
    expect(authErrorMessage(new Error('Too many requests'), t)).toBe('auth.errRateLimit')
    expect(authErrorMessage({ code: 'over_rate_limit' }, t)).toBe('auth.errRateLimit')
  })

  it('неизвестная ошибка → общий текст', () => {
    expect(authErrorMessage(new Error('Something odd'), t)).toBe('auth.error')
    expect(authErrorMessage(null, t)).toBe('auth.error')
    expect(authErrorMessage(undefined, t)).toBe('auth.error')
  })
})
