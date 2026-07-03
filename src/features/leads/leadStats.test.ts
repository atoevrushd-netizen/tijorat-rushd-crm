import { describe, it, expect } from 'vitest'
import { leadStats } from './leadStats'
import type { Lead } from '@/types'

function lead(partial: Partial<Lead>): Lead {
  return {
    id: Math.random().toString(36),
    full_name: 'X',
    phone: '000',
    source: 'admin_created',
    converted_user_id: null,
    created_at: '2026-01-01T00:00:00Z',
    ...partial,
  }
}

describe('leadStats', () => {
  it('пустой список', () => {
    expect(leadStats([])).toEqual({
      total: 0,
      converted: 0,
      notConverted: 0,
      rate: 0,
      bySource: [],
    })
  })

  it('считает конверсию и разбивку по источникам', () => {
    const leads: Lead[] = [
      lead({ converted_user_id: 'u1', source: 'admin_created' }),
      lead({ converted_user_id: 'u2', source: 'admin_created' }),
      lead({ converted_user_id: null, source: 'self' }),
      lead({ converted_user_id: null, source: null }),
    ]
    const s = leadStats(leads)
    expect(s.total).toBe(4)
    expect(s.converted).toBe(2)
    expect(s.notConverted).toBe(2)
    expect(s.rate).toBe(50)
    // admin_created (2) первым, дальше self и unknown по 1
    expect(s.bySource[0]).toEqual({ source: 'admin_created', count: 2 })
    expect(s.bySource.find((x) => x.source === 'unknown')?.count).toBe(1)
  })
})
