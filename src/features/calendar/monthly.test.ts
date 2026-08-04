import { describe, expect, it } from 'vitest'
import type { Task } from '@/types'
import { compareTasks, taskNumber } from './monthly'

function task(id: string, title: string, title_ru?: string): Task {
  return {
    id,
    user_id: 'u',
    tab_id: null,
    title,
    title_ru: title_ru ?? title,
    title_tg: null,
    task_type: null,
    status: 'not_started',
    deadline: null,
    due_time: null,
    admin_comment: null,
    user_comment: null,
    created_by: null,
    updated_by: null,
    created_at: '2026-08-01T00:00:00Z',
    sent_at: null,
    accepted_at: null,
    updated_at: '2026-08-01T00:00:00Z',
  }
}

describe('taskNumber', () => {
  it('извлекает номер из «№N»', () => {
    expect(taskNumber(task('a', 'Рилс №7'))).toBe(7)
    expect(taskNumber(task('a', 'Креатив № 12'))).toBe(12)
  })
  it('без номера — в конец', () => {
    expect(taskNumber(task('a', 'Футбол'))).toBe(Number.MAX_SAFE_INTEGER)
  })
})

describe('compareTasks', () => {
  it('перемешанные №3,№1,№5,№2,№4 → строго №1..№5', () => {
    const shuffled = [
      task('c', 'Рилс №3'),
      task('a', 'Рилс №1'),
      task('e', 'Рилс №5'),
      task('b', 'Рилс №2'),
      task('d', 'Рилс №4'),
    ]
    const titles = [...shuffled].sort(compareTasks).map((t) => t.title)
    expect(titles).toEqual(['Рилс №1', 'Рилс №2', 'Рилс №3', 'Рилс №4', 'Рилс №5'])
  })

  it('№10 после №2 (числовое сравнение, не строковое)', () => {
    const list = [task('a', 'Рилс №10'), task('b', 'Рилс №2')]
    expect([...list].sort(compareTasks).map((t) => t.title)).toEqual(['Рилс №2', 'Рилс №10'])
  })

  it('без номера — после нумерованных; одинаковые названия стабильны по id', () => {
    const list = [
      task('b', 'Футбол'),
      task('a', 'Футбол'),
      task('c', 'Мастермайнд'),
      task('d', 'Рилс №1'),
    ]
    const sorted = [...list].sort(compareTasks)
    expect(sorted[0].title).toBe('Рилс №1')
    // ненумерованные — по алфавиту, при равенстве — по id
    expect(sorted.slice(1).map((t) => `${t.title}:${t.id}`)).toEqual([
      'Мастермайнд:c',
      'Футбол:a',
      'Футбол:b',
    ])
  })
})
