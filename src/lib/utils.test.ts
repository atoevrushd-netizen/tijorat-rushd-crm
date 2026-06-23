import { describe, expect, it } from 'vitest'
import { cn, formatDate } from './utils'

describe('cn', () => {
  it('объединяет классы через пробел', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c')
  })

  it('отбрасывает ложные значения', () => {
    expect(cn('a', false, null, undefined, '', 'b')).toBe('a b')
  })
})

describe('formatDate', () => {
  it('нет даты → «—»', () => {
    expect(formatDate(null)).toBe('—')
    expect(formatDate(undefined)).toBe('—')
    expect(formatDate('')).toBe('—')
  })

  it('некорректная дата → «—»', () => {
    expect(formatDate('не дата')).toBe('—')
  })

  it('валидная дата → формат ДД.ММ.ГГГГ', () => {
    expect(formatDate('2026-06-20T10:00:00Z')).toMatch(/^\d{2}\.\d{2}\.\d{4}$/)
  })
})
