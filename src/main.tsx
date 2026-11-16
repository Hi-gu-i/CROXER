import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

/**
 * 기본은 통합 App.
 * 로컬에서 부품 카탈로그만 보려면:
 * - src/App.preview.tsx 를 두고 (gitignore)
 * - .env.local 에 VITE_UI_PREVIEW=1
 */
async function render() {
  const usePreview = import.meta.env.VITE_UI_PREVIEW === '1'
  const App = usePreview
    ? (await import(/* @vite-ignore */ './App.preview')).default
    : (await import('./App')).default

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

void render()
