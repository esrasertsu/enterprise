import { useMemo } from 'react'
import { Button, Result, Space } from 'antd'
import { useTranslation } from 'react-i18next'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { formatCurrency } from '../lib/formatters'
import type { CreatedOrder } from '../types/api'

function CheckoutSuccessPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const orderFromState = location.state as CreatedOrder | null

  const orderSummary = useMemo(() => {
    const orderNumber = orderFromState?.orderNumber ?? searchParams.get('orderNumber') ?? '—'
    const currencyCode = orderFromState?.currencyCode ?? searchParams.get('currencyCode') ?? 'EUR'
    const total = orderFromState?.grandTotal ?? Number.parseFloat(searchParams.get('total') ?? '0')
    const createdAt = orderFromState?.createdAt ?? searchParams.get('createdAt') ?? ''

    return {
      orderNumber,
      totalLabel: formatCurrency(total, i18n.language) ?? '—',
      createdAtLabel: createdAt
        ? new Intl.DateTimeFormat(i18n.language === 'tr' ? 'tr-TR' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(createdAt))
        : '—',
      currencyCode,
    }
  }, [i18n.language, orderFromState?.createdAt, orderFromState?.currencyCode, orderFromState?.grandTotal, orderFromState?.orderNumber, searchParams])

  return (
    <section className="section-card checkout-success">
      <Result
        status="success"
        title={t('checkoutSuccess.title')}
        subTitle={`${t('checkoutSuccess.orderNumber')}: ${orderSummary.orderNumber}`}
        extra={(
          <Space wrap>
            <Button type="primary" onClick={() => navigate('/products')}>{t('checkoutSuccess.backToCatalog')}</Button>
            <Button onClick={() => navigate('/cart')}>{t('checkoutSuccess.backToCart')}</Button>
          </Space>
        )}
      />

      <div className="checkout-success__summary">
        <div className="checkout-success__row">
          <span>{t('checkoutSuccess.total')}</span>
          <strong>{orderSummary.totalLabel}</strong>
        </div>
        <div className="checkout-success__row">
          <span>{t('checkoutSuccess.createdAt')}</span>
          <strong>{orderSummary.createdAtLabel}</strong>
        </div>
        <div className="checkout-success__row">
          <span>{t('checkoutSuccess.status')}</span>
          <strong>{t('checkoutSuccess.received')}</strong>
        </div>
      </div>
    </section>
  )
}

export default CheckoutSuccessPage