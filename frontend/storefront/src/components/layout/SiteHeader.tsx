import { AppstoreOutlined, GlobalOutlined, MessageOutlined, ShoppingCartOutlined } from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { Badge, Button, Select } from 'antd'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { fetchCart } from '../../lib/api/cart'
import { getOrCreateCartSessionId } from '../../lib/cartSession'
import { normalizeStorefrontLanguageCode, storefrontLanguageOptions } from '../../lib/locales'
import { openQuoteDrawer } from '../../lib/quoteDrawerStore'

function SiteHeader() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const sessionId = getOrCreateCartSessionId()
  const activeLanguage = normalizeStorefrontLanguageCode(i18n.language)

  const isCatalogPage = location.pathname === '/products'
  const isProductsPage = location.pathname.startsWith('/products')
  const isCartPage = location.pathname.startsWith('/cart')
  const cartQuery = useQuery({
    queryKey: ['cart', sessionId, i18n.language],
    queryFn: () => fetchCart({ sessionId, languageCode: i18n.language }),
  })

  return (
    <header className="site-header">
      <button className="brand-mark" type="button" onClick={() => navigate('/')}>
        <span className="brand-mark__badge">AP</span>
        <span>
          <strong>Ambalaj Pro</strong>
          <small>multilingual packaging storefront</small>
        </span>
      </button>

      <nav className="site-nav">
        <NavLink to="/products">{t('nav.products')}</NavLink>
      </nav>

      <div className="site-header__actions">
        <Select
          aria-label={t('common.language')}
          className="site-header__language-select"
          popupMatchSelectWidth={false}
          suffixIcon={<GlobalOutlined />}
          value={activeLanguage}
          options={storefrontLanguageOptions.map((option) => ({
            label: `${option.label} (${option.shortLabel})`,
            value: option.value,
          }))}
          onChange={(value) => {
            void i18n.changeLanguage(value)
          }}
        />
        <Button
          icon={<AppstoreOutlined />}
          type={isProductsPage ? 'primary' : 'default'}
          onClick={() => navigate('/products')}
        >
          {t('common.shopNow')}
        </Button>
        <Button icon={<MessageOutlined />} type="primary" onClick={() => openQuoteDrawer('')}>
          {t('common.quote')}
        </Button>
        <Badge count={cartQuery.data?.itemCount ?? 0} size="small" overflowCount={99}>
          <Button
            icon={<ShoppingCartOutlined />}
            type={isCartPage ? 'primary' : 'default'}
            onClick={() => navigate('/cart')}
          >
            {t('nav.cart')}
          </Button>
        </Badge>
      </div>
    </header>
  )
}

export default SiteHeader