import { useMemo } from 'react'
import { NavLink, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import './App.css'
import OrdersPage from './pages/OrdersPage'
import ProductsPage from './pages/ProductsPage'

type AdminSection = 'dashboard' | 'orders' | 'products' | 'customers' | 'sales'

interface MenuItem {
  id: AdminSection
  label: string
  eyebrow: string
  path: string
}

const menuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', eyebrow: 'Overview', path: '/' },
  { id: 'orders', label: 'Siparisler', eyebrow: 'Fulfillment', path: '/orders' },
  { id: 'products', label: 'Urunler', eyebrow: 'Catalog', path: '/products' },
  { id: 'customers', label: 'Musteriler', eyebrow: 'Accounts', path: '/customers' },
  { id: 'sales', label: 'Satis takibi', eyebrow: 'Revenue', path: '/sales' },
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
  return (
    <section className="dashboard-page">
      <header className="dashboard-page__hero">
        <span className="dashboard-page__eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{description}</p>
      </header>

      <div className="dashboard-placeholder-grid">
        <article className="placeholder-card">
          <h3>Hazir moduller</h3>
          <p>Bu alan siparis akislari, musteri segmentleri veya gelir panelleri icin ayrildi. Products ekrani su an aktif calisan moduldur.</p>
        </article>
        <article className="placeholder-card">
          <h3>Sonraki adim</h3>
          <p>Bu bolume backend endpoint'leri geldikce liste, filtre ve detay kartlari ayni dashboard diliyle eklenebilir.</p>
        </article>
      </div>
    </section>
  )
}

interface DashboardHomeProps {
  onNavigate: (section: AdminSection) => void
}

function DashboardHome({ onNavigate }: DashboardHomeProps) {
  const stats = useMemo(
    () => [
      { title: 'Aktif moduller', value: '5', detail: 'Dashboard, siparisler, urunler, musteriler ve satis takibi icin ayri girisler hazir.' },
      { title: 'Urun operasyonu', value: 'Canli', detail: 'Mevcut urun editoru yan menu altinda korunuyor ve aninda erisilebilir durumda.' },
      { title: 'Sonraki teslim', value: 'Orders', detail: 'Siradaki mantikli modul siparis listesi ve durum takibi ekrani.' },
    ],
    [],
  )

  return (
    <section className="dashboard-page">
      <header className="dashboard-page__hero dashboard-page__hero--accent">
        <div>
          <span className="dashboard-page__eyebrow">Admin home</span>
          <h1>Operasyon merkezini tek yerden yonet.</h1>
          <p>Soldaki menu artik admin icin ana giris oldu. Products modulu mevcut editoru aynen koruyor; diger alanlar da ayni kabuk icinde buyuyebilir.</p>
        </div>
        <button type="button" className="primary-button" onClick={() => onNavigate('products')}>Products paneline git</button>
      </header>

      <div className="dashboard-stats-grid">
        {stats.map((stat) => (
          <SectionStatCard key={stat.title} title={stat.title} value={stat.value} detail={stat.detail} />
        ))}
      </div>

      <div className="dashboard-modules-grid">
        <ModuleCard
          title="Catalog management"
          description="Mevcut urun olusturma, guncelleme, varyant, attribute ve gorsel yonetimi bu modulde duruyor. Sol menuden Products ile aciliyor."
          actionLabel="Products"
          onAction={() => onNavigate('products')}
        />
        <ModuleCard
          title="Order operations"
          description="Siparis listeleme, durum degisimi ve fulfillment timeline'i icin ayrilmis alan."
          actionLabel="Siparisler"
          onAction={() => onNavigate('orders')}
        />
        <ModuleCard
          title="Sales visibility"
          description="Gunluk hacim, tekliften siparise donusum ve kategori bazli satis takibi icin temel alan."
          actionLabel="Satis takibi"
          onAction={() => onNavigate('sales')}
        />
      </div>
    </section>
  )
}

function AdminLayout() {
  const location = useLocation()

  const activeSection = useMemo<AdminSection>(() => {
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
            <strong>Ecommerce Admin</strong>
            <small>packaging operations</small>
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
              <span>{item.eyebrow}</span>
              <strong>{item.label}</strong>
            </NavLink>
          ))}
        </nav>

        <div className="app-sidebar__footer">
          <span>Current focus</span>
          <strong>{menuItems.find((item) => item.id === activeSection)?.label}</strong>
        </div>
      </aside>

      <section className="app-content">
        <header className="app-content__topbar">
          <div>
            <span className="app-content__eyebrow">Admin workspace</span>
            <h2>{menuItems.find((item) => item.id === activeSection)?.label}</h2>
          </div>
          <div className="app-content__status">
            <span>Frontend</span>
            <strong>TSX layout active</strong>
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
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route index element={<DashboardHomeRoute />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route
          path="customers"
          element={(
            <PlaceholderPage
              title="Musteriler"
              eyebrow="CRM"
              description="Musteri profilleri, adresler, siparis gecmisi ve teklif etkilesimi bu alanda toplanabilir."
            />
          )}
        />
        <Route
          path="sales"
          element={(
            <PlaceholderPage
              title="Satis takibi"
              eyebrow="Analytics"
              description="Kategori bazli hacim, teklif donusumleri ve kanal performansi gibi KPI panelleri icin yer ayrildi."
            />
          )}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App