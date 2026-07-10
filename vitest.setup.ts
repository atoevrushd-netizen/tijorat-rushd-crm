import { webcrypto } from 'node:crypto'

// Некоторые версии Node (напр. 20 на CI) не пробрасывают Web Crypto API
// в песочницу Vitest → globalThis.crypto === undefined, и generatePassword()
// падает на crypto.getRandomValues. Гарантируем наличие crypto в тестах.
if (!globalThis.crypto) {
  Object.defineProperty(globalThis, 'crypto', {
    value: webcrypto,
    configurable: true,
  })
}
