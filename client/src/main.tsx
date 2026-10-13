import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Set layout mode before render (CSP-compliant, external module)
try {
  const params = new URLSearchParams(window.location.search)
  const isFull = params.get('mode') === 'full' || params.get('mode') === 'web'
  const isExt = params.get('mode') === 'extension' || params.get('ext') === '1' || (window.location.protocol === 'chrome-extension:' && !isFull)
  if (isFull || (!isExt && window.location.protocol !== 'chrome-extension:')) {
    document.documentElement.classList.add('full-screen-mode')
    document.documentElement.classList.remove('extension-popup-mode')
  } else {
    document.documentElement.classList.add('extension-popup-mode')
    document.documentElement.classList.remove('full-screen-mode')
  }
} catch {
  // Fallback
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
