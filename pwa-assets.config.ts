// Конфиг генерации PWA-иконок из public/pwa-icon.svg (чёрный фон + белый лого).
// Плоский объект без импортов: генератор запускается через npx, и его пакет
// недоступен из node_modules проекта. Сплошной чёрный фон на ВСЕХ выводах
// (в т.ч. в паддинге maskable/apple) — чтобы при установке не было белой рамки.
export default {
  headLinkOptions: { preset: '2023' },
  preset: {
    transparent: {
      sizes: [64, 192, 512],
      favicons: [[48, 'favicon.ico']],
      resizeOptions: { background: '#000000', fit: 'contain' },
    },
    maskable: {
      sizes: [512],
      padding: 0.3,
      resizeOptions: { background: '#000000', fit: 'contain' },
    },
    apple: {
      sizes: [180],
      padding: 0.3,
      resizeOptions: { background: '#000000', fit: 'contain' },
    },
  },
  images: ['public/pwa-icon.svg'],
}
