import { describe, expect, it } from 'vitest'
import type { Task, TaskStatus } from '@/types'
import { taskCounts } from './taskCounts'

function task(status: TaskStatus): Task {
  return {
    id: Math.random().toString(),
    user_id: 'u',
    tab_id: null,
    title: 't',
    task_type: null,
    status,
    deadline: null,
    due_time: null,
    admin_comment: null,
    user_comment: null,
    created_by: null,
    updated_by: null,
    created_at: '',
    sent_at: null,
    accepted_at: null,
    updated_at: '',
  }
}

describe('taskCounts', () => {
  it('пустой список', () => {
    expect(taskCounts([])).toEqual({
      total: 0,
      accepted: 0,
      inProgress: 0,
      needsRevision: 0,
      notStarted: 0,
    })
  })

  it('считает по статусам', () => {
    const tasks = [
      task('not_started'),
      task('in_progress'),
      task('done'),
      task('sent_to_user'),
      task('accepted_by_user'),
      task('needs_revision'),
    ]
    expect(taskCounts(tasks)).toEqual({
      total: 6,
      accepted: 1,
      inProgress: 3, // in_progress + done + sent_to_user
      needsRevision: 1,
      notStarted: 1,
    })
  })
})
