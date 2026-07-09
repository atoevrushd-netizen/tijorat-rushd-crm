import { describe, expect, it } from 'vitest'
import { generatePassword } from './generatePassword'

describe('generatePassword', () => {
  it('длина по умолчанию — 12', () => {
    expect(generatePassword()).toHaveLength(12)
  })

  it('уважает заданную длину', () => {
    expect(generatePassword(16)).toHaveLength(16)
  })

  it('минимум 8 символов даже при малой длине', () => {
    expect(generatePassword(4).length).toBeGreaterThanOrEqual(8)
  })

  it('содержит по символу каждого класса (100 прогонов)', () => {
    for (let i = 0; i < 100; i++) {
      const pw = generatePassword()
      expect(pw).toMatch(/[a-z]/)
      expect(pw).toMatch(/[A-Z]/)
      expect(pw).toMatch(/[2-9]/)
      expect(pw).toMatch(/[!@#$%*?_-]/)
    }
  })

  it('без похожих символов l I O o 0 1 (100 прогонов)', () => {
    const ambiguous = /[lIOo01]/
    for (let i = 0; i < 100; i++) {
      expect(generatePassword()).not.toMatch(ambiguous)
    }
  })
})
