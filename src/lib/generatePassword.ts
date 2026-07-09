/** Криптостойкое случайное число [0, max). */
function randInt(max: number): number {
  const a = new Uint32Array(1)
  crypto.getRandomValues(a)
  return a[0] % max
}

/**
 * Надёжный, но читаемый пароль: строчные/прописные (без похожих l/I/O/o/0/1),
 * цифры и спецсимвол. Гарантирует по одному символу каждого класса.
 */
export function generatePassword(length = 12): string {
  const lower = 'abcdefghijkmnpqrstuvwxyz'
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const digits = '23456789'
  const special = '!@#$%*?-_'
  const all = lower + upper + digits + special
  const pick = (set: string) => set[randInt(set.length)]

  const chars = [pick(lower), pick(upper), pick(digits), pick(special)]
  for (let i = chars.length; i < Math.max(8, length); i++) chars.push(pick(all))

  // Перемешать (Фишер–Йейтс), чтобы обязательные символы не были в начале.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randInt(i + 1)
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }
  return chars.join('')
}
