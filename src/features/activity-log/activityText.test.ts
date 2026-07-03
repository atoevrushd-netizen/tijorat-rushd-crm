import { describe, expect, it } from 'vitest'
import type { ActivityEvent } from '@/types'
import { activityText } from './activityText'
import misc from '@/i18n/dictionaries/misc'
import status from '@/i18n/dictionaries/status'

// Русский переводчик-заглушка (как в UI при lang='ru').
const ru: Record<string, string> = { ...misc.ru, ...status.ru }
const t = (key: string, fallback?: string) => ru[key] ?? fallback ?? key

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
    expect(activityText(ev('created', { title: 'Reels №1' }), t)).toBe(
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
        t,
      ),
    ).toBe('Статус задачи «Reels №1»: Не начато → Отправлено пользователю')
  })
})
