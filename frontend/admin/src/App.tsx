import { useMemo } from 'react'
import { NavLink, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import { useAdminI18n } from './lib/adminI18n'
import CategoriesPage from './pages/CategoriesPage'
import OrdersPage from './pages/OrdersPage'
import ProductsPage from './pages/ProductsPage'

type AdminSection = 'dashboard' | 'categories' | 'orders' | 'products' | 'customers' | 'sales'

interface MenuItem {
  id: AdminSection
  labelKey: string
  eyebrowKey: string
  path: string
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', labelKey: 'menu.dashboard', eyebrowKey: 'menu.overview', path: '/' },
  { id: 'categories', labelKey: 'menu.categories', eyebrowKey: 'menu.catalog', path: '/categories' },
  { id: 'orders', labelKey: 'menu.orders', eyebrowKey: 'menu.fulfillment', path: '/orders' },
  { id: 'products', labelKey: 'menu.products', eyebrowKey: 'menu.catalog', path: '/products' },
  { id: 'customers', labelKey: 'menu.customers', eyebrowKey: 'menu.accounts', path: '/customers' },
  { id: 'sales', labelKey: 'menu.sales', eyebrowKey: 'menu.revenue', path: '/sales' },
]

interface SectionCardProps {
  title: string
  value: string
  detail: string
}

function SectionStatCard({ title, value, detail }: SectionCardProps) {
  return (
    <article className="dashboard-stat">
      <span>{title}</span>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  )
}

interface ModuleCardProps {
  title: string
  description: string
  actionLabel: string
  onAction: () => void
}

function ModuleCard({ title, description, actionLabel, onAction }: ModuleCardProps) {
  return (
    <article className="module-card">
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <button type="button" className="secondary-button" onClick={onAction}>{actionLabel}</button>
    </article>
  )
}

interface PlaceholderPageProps {
  title: string
  eyebrow: string
  description: string
}

function PlaceholderPage({ title, eyebrow, description }: PlaceholderPageProps) {
  const { t } = useAdminI18n()

  return (
    <section className="dashboard-page">
      <header className="dashboard-page__hero">
        <span className="dashboard-page__eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </header>

      <div className="dashboard-placeholder-grid">
        <article className="placeholder-card">
          <h3>{t('placeholders.modulesReady')}</h3>
          <p>{t('placeholders.modulesReadyDesc')}</p>
        </article>
        <article className="placeholder-card">
          <h3>{t('placeholders.nextStep')}</h3>
          <p>{t('placeholders.nextStepDesc')}</p>
        </article>
      </div>
    </section>
  )
}

interface DashboardHomeProps {
  onNavigate: (section: AdminSection) => void
}

function DashboardHome({ onNavigate }: DashboardHomeProps) {
  const { t } = useAdminI18n()

  const stats = useMemo(
    () => [
      { title: t('dashboard.statsModules'), value: '6', detail: t('dashboard.statsModulesDetail') },
      { title: t('dashboard.statsCatalog'), value: 'Live', detail: t('dashboard.statsCatalogDetail') },
      { title: t('dashboard.statsNext'), value: t('menu.orders'), detail: t('dashboard.statsNextDetail') },
    ],
    [t],
  )

  return (
    <section className="dashboard-page">
      <header className="dashboard-page__hero dashboard-page__hero--accent">
        <div>
          <span className="dashboard-page__eyebrow">{t('dashboard.eyebrow')}</span>
          <h1>{t('dashboard.title')}</h1>
          <p>{t('dashboard.description')}</p>
        </div>
        <button type="button" className="primary-button" onClick={() => onNavigate('products')}>{t('dashboard.cta')}</button>
      </header>

      <div className="dashboard-stats-grid">
        {stats.map((stat) => (
          <SectionStatCard key={stat.title} title={stat.title} value={stat.value} detail={stat.detail} />
        ))}
      </div>

      <div className="dashboard-modules-grid">
        <ModuleCard
          title={t('dashboard.moduleCategories')}
          description={t('dashboard.moduleCategoriesDesc')}
          actionLabel={t('menu.categories')}
          onAction={() => onNavigate('categories')}
        />
        <ModuleCard
          title={t('dashboard.moduleProducts')}
          description={t('dashboard.moduleProductsDesc')}
          actionLabel={t('menu.products')}
          onAction={() => onNavigate('products')}
        />
        <ModuleCard
          title={t('dashboard.moduleOrders')}
          description={t('dashboard.moduleOrdersDesc')}
          actionLabel={t('menu.orders')}
          onAction={() => onNavigate('orders')}
        />
        <ModuleCard
          title={t('dashboard.moduleSales')}
          description={t('dashboard.moduleSalesDesc')}
          actionLabel={t('menu.sales')}
          onAction={() => onNavigate('sales')}
        />
      </div>
    </section>
  )
}

function AdminLayout() {
  const location = useLocation()
  const { languageOptions, locale, setLocale, t } = useAdminI18n()

  const activeSection = useMemo<AdminSection>(() => {
    if (location.pathname.startsWith('/categories')) {
      return 'categories'
    }

    if (location.pathname.startsWith('/orders')) {
      return 'orders'
    }

    if (location.pathname.startsWith('/products')) {
      return 'products'
    }

    if (location.pathname.startsWith('/customers')) {
      return 'customers'
    }

    if (location.pathname.startsWith('/sales')) {
      return 'sales'
    }

    return 'dashboard'
  }, [location.pathname])

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="app-sidebar__brand">
          <span className="app-sidebar__badge">EA</span>
          <div>
            <strong>{t('shell.brand')}</strong>
            <small>{t('shell.tagline')}</small>
          </div>
        </div>

        <nav className="app-sidebar__nav" aria-label="Admin sections">
          {menuItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) => `app-nav-item${isActive ? ' app-nav-item--active' : ''}`}
            >
              <span>{t(item.eyebrowKey)}</span>
              <strong>{t(item.labelKey)}</strong>
            </NavLink>
          ))}
        </nav>

        <div className="app-sidebar__footer">
          <span>{t('shell.currentFocus')}</span>
          <strong>{t(menuItems.find((item) => item.id === activeSection)?.labelKey ?? 'menu.dashboard')}</strong>
        </div>
      </aside>

      <section className="app-content">
        <header className="app-content__topbar">
          <div>
            <span className="app-content__eyebrow">{t('shell.workspace')}</span>
            <h2>{t(menuItems.find((item) => item.id === activeSection)?.labelKey ?? 'menu.dashboard')}</h2>
          </div>
          <div className="app-content__actions">
            <label className="app-language-select">
              <span>{t('shell.language')}</span>
              <select value={locale} onChange={(event) => setLocale(event.target.value)}>
                {languageOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <div className="app-content__status">
              <span>{t('shell.frontend')}</span>
              <strong>{t('shell.layoutActive')}</strong>
            </div>
          </div>
        </header>

        <Outlet />
      </section>
    </div>
  )
}

function DashboardHomeRoute() {
  const navigate = useNavigate()
  return <DashboardHome onNavigate={(section) => navigate(menuItems.find((item) => item.id === section)?.path ?? '/')} />
}

function App() {
  const { t } = useAdminI18n()

  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<DashboardHomeRoute />} />
        <Route path="categories" element={<CategoriesPage />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route
          path="customers"
          element={(
            <PlaceholderPage
              title={t('placeholders.customersTitle')}
              eyebrow={t('placeholders.customersEyebrow')}
              description={t('placeholders.customersDesc')}
            />
          )}
        />
        <Route
          path="sales"
          element={(
            <PlaceholderPage
              title={t('placeholders.salesTitle')}
              eyebrow={t('placeholders.salesEyebrow')}
              description={t('placeholders.salesDesc')}
            />
          )}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App