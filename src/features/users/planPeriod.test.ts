import { describe, expect, it } from 'vitest'
import { planPeriod } from './planPeriod'

describe('planPeriod', () => {
  it('3 месяца: старт — 1-е число месяца, конец — последний день 3-го месяца', () => {
    const { start, end } = planPeriod(3, new Date(2026, 6, 15)) // 15 июля 2026
    expect(start).toBe('2026-07-01')
    expect(end).toBe('2026-09-30') // июль, август, сентябрь = 3 календарных месяца
  })

  it('6 месяцев охватывают 6 календарных месяцев', () => {
    const { start, end } = planPeriod(6, new Date(2026, 6, 1))
    expect(start).toBe('2026-07-01')
    expect(end).toBe('2026-12-31')
  })

  it('корректно переходит через границу года', () => {
    const { start, end } = planPeriod(3, new Date(2026, 10, 20)) // 20 ноября 2026
    expect(start).toBe('2026-11-01')
    expect(end).toBe('2027-01-31') // ноя, дек, янв
  })
})
