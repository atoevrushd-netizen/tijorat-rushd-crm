import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

// Отдельный конфиг для тестов: без react-плагина (наши тесты — чистый TS, без JSX).
// fileParallelism:false — последовательный прогон, стабильно на Windows (Vitest 4).
export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    include: ['src/**/*.test.ts'],
    fileParallelism: false,
  },
})
