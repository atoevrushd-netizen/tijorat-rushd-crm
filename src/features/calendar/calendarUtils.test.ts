import { describe, expect, it } from 'vitest'
import {
  buildMonthMatrix,
  formatDateShort,
  groupTasksByDate,
  isWithinRange,
  ymd,
} from './calendarUtils'

describe('calendarUtils', () => {
  it('ymd форматирует без сдвига зоны', () => {
    expect(ymd(new Date(2026, 5, 9))).toBe('2026-06-09')
    expect(ymd(new Date(2026, 11, 31))).toBe('2026-12-31')
  })

  it('formatDateShort → DD.MM.YYYY', () => {
    expect(formatDateShort('2026-06-09')).toBe('09.06.2026')
  })

  it('buildMonthMatrix: 6 недель по 7 дней, старт с понедельника', () => {
    const weeks = buildMonthMatrix(2026, 5) // июнь 2026 (1-е — понедельник)
    expect(weeks).toHaveLength(6)
    expect(weeks.every((w) => w.length === 7)).toBe(true)
    // первая ячейка — понедельник
    expect(new Date(weeks[0][0].date + 'T00:00:00').getDay()).toBe(1)
    // 1 июня присутствует и помечен как inMonth
    const flat = weeks.flat()
    const first = flat.find((c) => c.date === '2026-06-01')
    expect(first?.inMonth).toBe(true)
  })

  it('isWithinRange: включительно, и false без границ', () => {
    expect(isWithinRange('2026-06-10', '2026-06-01', '2026-06-30')).toBe(true)
    expect(isWithinRange('2026-06-01', '2026-06-01', '2026-06-30')).toBe(true)
    expect(isWithinRange('2026-07-01', '2026-06-01', '2026-06-30')).toBe(false)
    expect(isWithinRange('2026-06-10', null, '2026-06-30')).toBe(false)
  })

  it('groupTasksByDate группирует по дню и пропускает без дедлайна', () => {
    const map = groupTasksByDate([
      { deadline: '2026-06-10' },
      { deadline: '2026-06-10' },
      { deadline: null },
      { deadline: '2026-06-12' },
    ])
    expect(map['2026-06-10']).toHaveLength(2)
    expect(map['2026-06-12']).toHaveLength(1)
    expect(Object.keys(map)).toHaveLength(2)
  })
})
