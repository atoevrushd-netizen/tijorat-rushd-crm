import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/app/App'
import { initTheme } from '@/lib/theme'
import '@/styles/index.css'

// Применяем сохранённую тему до рендера — без «мигания» светлым.
initTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
