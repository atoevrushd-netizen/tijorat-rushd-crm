import { describe, expect, it } from 'vitest'
import { toCSV } from './csv'

type Row = { v: string }
const cell = (v: string) => {
  const csv = toCSV<Row>([{ v }], [{ label: 'x', get: (r) => r.v }])
  // строки: BOM+заголовок, данные, пустая
  return csv.split('\n')[1]
}

describe('toCSV — защита от инъекции формул', () => {
  it('формулы (=, @) экранируются апострофом', () => {
    expect(cell('=HYPERLINK("http://evil","x")')).toContain(`'=HYPERLINK`)
    expect(cell('@SUM(A1:A9)')).toBe(`'@SUM(A1:A9)`)
  })

  it('телефон «+992 90 123 45 67» НЕ получает апостроф', () => {
    expect(cell('+992 90 123 45 67')).toBe('+992 90 123 45 67')
    expect(cell('+992-90-123-45-67')).toBe('+992-90-123-45-67')
    expect(cell('-15')).toBe('-15')
  })

  it('«+» перед текстом (не число) всё же экранируется', () => {
    expect(cell('+cmd|calc')).toBe(`'+cmd|calc`)
  })

  it('кавычки/запятые оборачиваются и удваиваются', () => {
    expect(cell('a,b')).toBe('"a,b"')
    expect(cell('say "hi"')).toBe('"say ""hi"""')
  })
})
