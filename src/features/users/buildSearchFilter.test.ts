import { describe, expect, it } from 'vitest'
import { buildSearchFilter } from './buildSearchFilter'

describe('buildSearchFilter', () => {
  it('пустой запрос → null', () => {
    expect(buildSearchFilter('')).toBeNull()
    expect(buildSearchFilter('   ')).toBeNull()
  })

  it('ищет по всем полям через ilike', () => {
    expect(buildSearchFilter('Иван')).toBe(
      'full_name.ilike.%Иван%,phone.ilike.%Иван%,login.ilike.%Иван%,email.ilike.%Иван%',
    )
  })

  it('обрезает пробелы по краям', () => {
    expect(buildSearchFilter('  Иван  ')).toBe(
      'full_name.ilike.%Иван%,phone.ilike.%Иван%,login.ilike.%Иван%,email.ilike.%Иван%',
    )
  })

  it('заменяет запятые на пробел (чтобы не сломать .or())', () => {
    expect(buildSearchFilter('Иван,Пётр')).toBe(
      'full_name.ilike.%Иван Пётр%,phone.ilike.%Иван Пётр%,login.ilike.%Иван Пётр%,email.ilike.%Иван Пётр%',
    )
  })
})
