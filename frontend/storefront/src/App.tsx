import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { App as AntApp, ConfigProvider, Spin, theme as antdTheme } from 'antd'
import deDE from 'antd/locale/de_DE'
import enUS from 'antd/locale/en_US'
import frFR from 'antd/locale/fr_FR'
import trTR from 'antd/locale/tr_TR'
import { useTranslation } from 'react-i18next'
import SiteHeader from './components/layout/SiteHeader'
import SiteFooter from './components/layout/SiteFooter'
import QuoteRequestDrawer from './components/quote/QuoteRequestDrawer'
import { normalizeStorefrontLanguageCode } from './lib/locales'

const HomePage = lazy(() => import('./pages/HomePage'))
const CatalogPage = lazy(() => import('./pages/CatalogPage'))
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'))
const CartPage = lazy(() => import('./pages/CartPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const CheckoutSuccessPage = lazy(() => import('./pages/CheckoutSuccessPage'))

const antLocales = {
  de: deDE,
  en: enUS,
  fr: frFR,
  lb: deDE,
  tr: trTR,
}

function App() {
  const { i18n } = useTranslation()
  const locale = antLocales[normalizeStorefrontLanguageCode(i18n.language)] ?? enUS

  return (
    <ConfigProvider
      locale={locale}
      theme={{
        algorithm: antdTheme.defaultAlgorithm,
        token: {
          colorPrimary: '#b6482d',
          colorInfo: '#b6482d',
          colorSuccess: '#51624f',
          colorWarning: '#d19639',
          colorError: '#bf3b2b',
          colorTextBase: '#241f1c',
          colorBgBase: '#f6f0e7',
          colorBorder: '#d6c8b8',
          borderRadius: 18,
          borderRadiusLG: 28,
          fontFamily: 'Manrope, sans-serif',
          fontFamilyCode: 'IBM Plex Mono, monospace',
          boxShadowSecondary: '0 24px 80px rgba(42, 28, 18, 0.12)',
        },
      }}
    >
      <AntApp>
        <Suspense fallback={<div className="page-loader"><Spin size="large" /></div>}>
          <div className="site-shell">
            <SiteHeader />
            <main className="site-main">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<CatalogPage />} />
                <Route path="/products/:slug" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/checkout/success" element={<CheckoutSuccessPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <SiteFooter />
            <QuoteRequestDrawer />
          </div>
        </Suspense>
      </AntApp>
    </ConfigProvider>
  )
}

export default App