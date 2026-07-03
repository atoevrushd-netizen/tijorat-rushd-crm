/** Колонка CSV: заголовок + как достать значение из строки. */
export type CsvColumn<T> = { label: string; get: (row: T) => unknown }

/** BOM (U+FEFF) в начале файла — чтобы Excel открывал UTF-8 (кириллицу) без «кракозябр». */
const BOM = String.fromCharCode(0xfeff)

/** Экранировать одно поле CSV (кавычки/запятые/переводы строк). */
function esc(value: unknown): string {
  const s = value == null ? '' : String(value)
  return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/** Собрать CSV-текст (разделитель — запятая). */
export function toCSV<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const header = columns.map((c) => esc(c.label)).join(',')
  const body = rows.map((r) => columns.map((c) => esc(c.get(r))).join(',')).join('\n')
  return `${BOM}${header}\n${body}\n`
}

/** Скачать строку как CSV-файл. */
export function downloadCSV(filename: string, csv: string): void {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
