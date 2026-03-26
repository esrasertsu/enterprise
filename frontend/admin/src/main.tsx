import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App'
import { AdminI18nProvider } from './lib/adminI18n'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found')
}

createRoot(rootElement).render(
  <StrictMode>
    <AdminI18nProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AdminI18nProvider>
  </StrictMode>,
)