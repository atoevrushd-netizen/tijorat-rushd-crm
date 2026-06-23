import { describe, expect, it } from 'vitest'
import type { TaskStatus } from '@/types'
import { ADMIN_STATUS_OPTIONS, TASK_STATUS_LABEL } from './taskStatus'

const ALL: TaskStatus[] = [
  'not_started',
  'in_progress',
  'done',
  'sent_to_user',
  'accepted_by_user',
  'needs_revision',
]

describe('taskStatus', () => {
  it('у каждого статуса есть подпись', () => {
    for (const s of ALL) {
      expect(TASK_STATUS_LABEL[s]).toBeTruthy()
    }
  })

  it('админ не выставляет статусы принятия вручную', () => {
    expect(ADMIN_STATUS_OPTIONS).not.toContain('accepted_by_user')
    expect(ADMIN_STATUS_OPTIONS).not.toContain('needs_revision')
  })
})
