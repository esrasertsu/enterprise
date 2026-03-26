import { useEffect, useMemo, useState } from 'react'
import type { AdminOrderListItem } from '../types/admin'

const orderStatusLabels: Record<number, string> = {
  1: 'Received',
  2: 'Pending approval',
  3: 'Approved',
  4: 'In production',
  5: 'Packed',
  6: 'Shipped',
  7: 'Delivered',
  8: 'Cancelled',
  9: 'Refunded',
}

const paymentStatusLabels: Record<number, string> = {
  1: 'Pending',
  2: 'Authorized',
  3: 'Paid',
  4: 'Failed',
  5: 'Refunded',
  6: 'Partially refunded',
}

const fulfillmentStatusLabels: Record<number, string> = {
  1: 'Unfulfilled',
  2: 'Processing',
  3: 'Shipped',
  4: 'Delivered',
  5: 'Returned',
}

function formatMoney(amount: number, currencyCode: string) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: currencyCode || 'EUR',
    maximumFractionDigits: 2,
  }).format(amount)
}

function OrdersPage() {
  const [orders, setOrders] = useState<AdminOrderListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadOrders() {
      setIsLoading(true)
      setError('')

      try {
        const response = await fetch('/api/admin/orders')
        if (!response.ok) {
          throw new Error('Orders could not be loaded.')
        }

        const data = (await response.json()) as AdminOrderListItem[]
        setOrders(data)
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unexpected error while loading orders.')
      } finally {
        setIsLoading(false)
      }
    }

    void loadOrders()
  }, [])

  const stats = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + order.grandTotal, 0)
    const openOrders = orders.filter((order) => order.fulfillmentStatus !== 4 && order.fulfillmentStatus !== 5).length
    const designSupportOrders = orders.filter((order) => order.needsDesignSupport).length

    return [
      { label: 'Toplam siparis', value: String(orders.length), detail: 'Gercek order tablosundan okunuyor.' },
      { label: 'Acilik bekleyen', value: String(openOrders), detail: 'Teslim veya iade disindaki hareketli siparisler.' },
      { label: 'Ciro', value: formatMoney(totalRevenue, orders[0]?.currencyCode ?? 'EUR'), detail: 'Listelenen siparislerin toplam tutari.' },
      { label: 'Tasarim destekli', value: String(designSupportOrders), detail: 'Artwork veya tasarim koordinasyonu isteyen siparisler.' },
    ]
  }, [orders])

  return (
    <section className="dashboard-page orders-page">
      <header className="dashboard-page__hero">
        <div>
          <span className="dashboard-page__eyebrow">Operations</span>
          <h1>Siparisler</h1>
          <p>Bu ekran artik gercek order verisini backend’den cekiyor. Durum, odeme, fulfillment ve siparis hacmini ayni panelde gorebilirsin.</p>
        </div>
      </header>

      <div className="dashboard-stats-grid dashboard-stats-grid--orders">
        {stats.map((stat) => (
          <article className="dashboard-stat" key={stat.label}>
            <span>{stat.label}</span>
            <strong>{stat.value}</strong>
            <p>{stat.detail}</p>
          </article>
        ))}
      </div>

      <section className="panel orders-panel">
        <div className="panel__header panel__header--stacked">
          <div>
            <h2>Order stream</h2>
            <span>{orders.length} siparis</span>
          </div>
        </div>

        {isLoading ? <p>Loading orders...</p> : null}
        {error ? <p className="message message--error">{error}</p> : null}

        {!isLoading && !error && orders.length === 0 ? (
          <div className="empty-state">
            <p>Henuz siparis bulunmuyor.</p>
            <span>Order tablosuna veri dustugunde bu ekran otomatik dolacak.</span>
          </div>
        ) : null}

        {!isLoading && !error && orders.length > 0 ? (
          <div className="orders-table-wrap">
            <table className="orders-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Musteri</th>
                  <th>Satir</th>
                  <th>Tutar</th>
                  <th>Order</th>
                  <th>Odeme</th>
                  <th>Fulfillment</th>
                  <th>Tarih</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong>{order.orderNumber}</strong>
                      {order.needsDesignSupport ? <span className="badge">Design support</span> : null}
                    </td>
                    <td>
                      <div className="orders-table__customer">
                        <strong>{order.customerName}</strong>
                        <span>{order.customerEmail}</span>
                      </div>
                    </td>
                    <td>{order.itemCount}</td>
                    <td>{formatMoney(order.grandTotal, order.currencyCode)}</td>
                    <td><span className="status-pill">{orderStatusLabels[order.orderStatus] ?? 'Unknown'}</span></td>
                    <td><span className="status-pill status-pill--muted">{paymentStatusLabels[order.paymentStatus] ?? 'Unknown'}</span></td>
                    <td><span className="status-pill status-pill--outline">{fulfillmentStatusLabels[order.fulfillmentStatus] ?? 'Unknown'}</span></td>
                    <td>{new Intl.DateTimeFormat('tr-TR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(order.createdAt))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </section>
  )
}

export default OrdersPage