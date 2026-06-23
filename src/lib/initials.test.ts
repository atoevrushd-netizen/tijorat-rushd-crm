import { describe, expect, it } from 'vitest'
import { initials } from './initials'

describe('initials', () => {
  it('берёт первые буквы имени и фамилии', () => {
    expect(initials('Равшан Рашидов')).toBe('РР')
  })

  it('из одного слова — одна буква', () => {
    expect(initials('Алексей')).toBe('А')
  })

  it('не больше двух букв', () => {
    expect(initials('Иван Петрович Сидоров')).toBe('ИП')
  })

  it('схлопывает лишние пробелы', () => {
    expect(initials('  Анна   Кан  ')).toBe('АК')
  })

  it('пустое/нет имени → «?»', () => {
    expect(initials('')).toBe('?')
    expect(initials(null)).toBe('?')
    expect(initials(undefined)).toBe('?')
    expect(initials('   ')).toBe('?')
  })
})
