import { describe, expect, it } from 'vitest'
import { parseBackup, DATA_TABLES, ACCOUNT_TABLES } from './importData'
import { BACKUP_TABLES } from './exportData'

const validBackup = {
  app: 'tijorat-rushd-crm',
  version: 1,
  exported_at: '2026-07-09T10:00:00.000Z',
  counts: { tasks: 2 },
  tables: { tasks: [{ id: '1' }, { id: '2' }] },
}

describe('parseBackup', () => {
  it('принимает корректный файл бэкапа', () => {
    const b = parseBackup(JSON.stringify(validBackup))
    expect(b.app).toBe('tijorat-rushd-crm')
    expect(b.tables.tasks).toHaveLength(2)
  })

  it('битый JSON → ошибка badFile', () => {
    expect(() => parseBackup('{не json')).toThrowError('badFile')
  })

  it('чужое приложение → ошибка badFile', () => {
    const foreign = JSON.stringify({ ...validBackup, app: 'other-app' })
    expect(() => parseBackup(foreign)).toThrowError('badFile')
  })

  it('нет секции tables → ошибка badFile', () => {
    const noTables = JSON.stringify({ app: 'tijorat-rushd-crm', version: 1 })
    expect(() => parseBackup(noTables)).toThrowError('badFile')
  })

  it('null/примитив → ошибка badFile', () => {
    expect(() => parseBackup('null')).toThrowError('badFile')
    expect(() => parseBackup('42')).toThrowError('badFile')
  })
})

describe('группы таблиц импорта', () => {
  it('«данные» и «аккаунты» не пересекаются', () => {
    const overlap = DATA_TABLES.filter((t) => (ACCOUNT_TABLES as readonly string[]).includes(t))
    expect(overlap).toEqual([])
  })

  it('все таблицы групп входят в BACKUP_TABLES', () => {
    const known = new Set<string>(BACKUP_TABLES)
    for (const t of [...DATA_TABLES, ...ACCOUNT_TABLES]) {
      expect(known.has(t)).toBe(true)
    }
  })

  it('вместе группы покрывают весь BACKUP_TABLES', () => {
    const grouped = new Set<string>([...DATA_TABLES, ...ACCOUNT_TABLES])
    for (const t of BACKUP_TABLES) {
      expect(grouped.has(t)).toBe(true)
    }
  })
})
