import { describe, expect, it } from 'vitest'
import type { ActivityEvent } from '@/types'
import { activityText } from './activityText'

function ev(action: string, details: Record<string, unknown>): ActivityEvent {
  return {
    id: '1',
    user_id: 'u',
    actor_id: 'a',
    entity_type: 'task',
    entity_id: 't',
    action,
    details,
    created_at: '2026-06-22T10:00:00Z',
  }
}

describe('activityText', () => {
  it('создание задачи', () => {
    expect(activityText(ev('created', { title: 'Reels №1' }))).toBe(
      'Создана задача «Reels №1»',
    )
  })

  it('смена статуса переводит статусы на русский', () => {
    expect(
      activityText(
        ev('status_changed', {
          title: 'Reels №1',
          from: 'not_started',
          to: 'sent_to_user',
        }),
      ),
    ).toBe('Статус задачи «Reels №1»: Не начато → Отправлено пользователю')
  })
})
