import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath } from 'node:url'

// Псевдоним '@' → папка src (удобные импорты, см. docs/03-architecture.md).
export default defineConfig({
  plugins: [
    react(),
    // PWA: устанавливаемое приложение (manifest + service worker, авто-обновление).
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon.ico',
        'apple-touch-icon-180x180.png',
        'logo/logo-light.svg',
      ],
      manifest: {
        name: 'Tijorat & Rushd CRM',
        short_name: 'Tijorat CRM',
        description: 'CRM для управления лидами и задачами Tijorat & Rushd',
        lang: 'ru',
        dir: 'ltr',
        theme_color: '#0b0c0e',
        background_color: '#0b0c0e',
        display: 'standalone',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        navigateFallback: '/index.html',
        cleanupOutdatedCaches: true,
      },
      // В dev service worker выключен — чтобы не кэшировать во время разработки.
      // Установка проверяется на сборке: npm run build && npm run preview.
      devOptions: { enabled: false },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Крупные библиотеки — в отдельные кэшируемые чанки.
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-supabase': ['@supabase/supabase-js'],
          'vendor-query': ['@tanstack/react-query'],
        },
      },
    },
  },
})
