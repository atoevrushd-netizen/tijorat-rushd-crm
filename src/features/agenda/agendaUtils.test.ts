import { describe, expect, it } from 'vitest'
import type { AgendaTask } from './api'
import {
  agendaCounts,
  checkState,
  groupByLead,
  matchesFilter,
  shiftDay,
} from './agendaUtils'

function task(p: Partial<AgendaTask>): AgendaTask {
  return {
    id: p.id ?? crypto.randomUUID(),
    title: p.title ?? 'T',
    status: p.status ?? 'not_started',
    deadline: p.deadline ?? '2026-06-25',
    due_time: p.due_time ?? null,
    user_id: p.user_id ?? 'u1',
    lead_name: p.lead_name ?? 'Лид',
    lead_photo: p.lead_photo ?? null,
  }
}

describe('checkState', () => {
  it('maps status to the three checkbox states', () => {
    expect(checkState('done')).toBe('done')
    expect(checkState('submitted')).toBe('submitted')
    expect(checkState('not_started')).toBe('empty')
    expect(checkState('in_progress')).toBe('empty')
    expect(checkState('needs_revision')).toBe('empty')
  })
})

describe('matchesFilter', () => {
  it('filters by checkbox state', () => {
    expect(matchesFilter('submitted', 'all')).toBe(true)
    expect(matchesFilter('submitted', 'submitted')).toBe(true)
    expect(matchesFilter('done', 'submitted')).toBe(false)
    expect(matchesFilter('done', 'done')).toBe(true)
    expect(matchesFilter('needs_revision', 'todo')).toBe(true)
    expect(matchesFilter('done', 'todo')).toBe(false)
  })
})

describe('agendaCounts', () => {
  it('counts submitted / done / todo', () => {
    const rows = [
      task({ status: 'submitted' }),
      task({ status: 'submitted' }),
      task({ status: 'done' }),
      task({ status: 'not_started' }),
    ]
    expect(agendaCounts(rows)).toEqual({ total: 4, submitted: 2, done: 1, todo: 1 })
  })
})

describe('groupByLead', () => {
  it('groups tasks per lead and sorts by name', () => {
    const rows = [
      task({ id: 'a', user_id: 'u2', lead_name: 'Борис' }),
      task({ id: 'b', user_id: 'u1', lead_name: 'Анна' }),
      task({ id: 'c', user_id: 'u1', lead_name: 'Анна' }),
    ]
    const groups = groupByLead(rows)
    expect(groups.map((g) => g.name)).toEqual(['Анна', 'Борис'])
    expect(groups[0].tasks).toHaveLength(2)
    expect(groups[1].tasks).toHaveLength(1)
  })
})

describe('shiftDay', () => {
  it('shifts a YYYY-MM-DD day and rolls over months/years', () => {
    expect(shiftDay('2026-06-25', 1)).toBe('2026-06-26')
    expect(shiftDay('2026-06-25', -1)).toBe('2026-06-24')
    expect(shiftDay('2026-06-30', 1)).toBe('2026-07-01')
    expect(shiftDay('2026-01-01', -1)).toBe('2025-12-31')
  })
})
