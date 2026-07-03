import { describe, it, expect } from 'vitest'
import { daysUntil, deadlineState } from './deadline'

/** Дата со сдвигом в днях от «сегодня» в формате YYYY-MM-DD. */
function iso(offsetDays: number): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + offsetDays)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

describe('daysUntil', () => {
  it('null без дедлайна', () => expect(daysUntil(null)).toBeNull())
  it('0 для сегодня', () => expect(daysUntil(iso(0))).toBe(0))
  it('отрицательно для прошлого', () => expect(daysUntil(iso(-2))).toBe(-2))
  it('положительно для будущего', () => expect(daysUntil(iso(5))).toBe(5))
})

describe('deadlineState', () => {
  it('null без дедлайна', () => expect(deadlineState(null, 'not_started')).toBeNull())
  it('null для завершённой, даже если срок прошёл', () => {
    expect(deadlineState(iso(-3), 'done')).toBeNull()
    expect(deadlineState(iso(-3), 'accepted_by_user')).toBeNull()
  })
  it('overdue в прошлом', () => expect(deadlineState(iso(-1), 'not_started')).toBe('overdue'))
  it('soon сегодня и в ближайшие дни', () => {
    expect(deadlineState(iso(0), 'not_started')).toBe('soon')
    expect(deadlineState(iso(3), 'in_progress')).toBe('soon')
  })
  it('ok когда до срока далеко', () => expect(deadlineState(iso(10), 'not_started')).toBe('ok'))
})
