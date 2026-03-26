import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { App, Button, Card, Empty, InputNumber, Skeleton, Space } from 'antd'
import { DeleteOutlined, ShoppingOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { fetchCart, removeCartItem, updateCartItem } from '../lib/api/cart'
import { getApiErrorMessage } from '../lib/api/http'
import { getOrCreateCartSessionId } from '../lib/cartSession'
import { formatCurrency } from '../lib/formatters'

function CartPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { message } = App.useApp()
  const sessionId = getOrCreateCartSessionId()

  const cartQuery = useQuery({
    queryKey: ['cart', sessionId, i18n.language],
    queryFn: () => fetchCart({ sessionId, languageCode: i18n.language }),
  })

  const cart = cartQuery.data
  const cartSummary = useMemo(() => {
    return {
      subtotal: formatCurrency(cart?.subtotalExclVat, i18n.language) ?? '—',
      vat: formatCurrency(cart?.vatTotal, i18n.language) ?? '—',
      total: formatCurrency(cart?.grandTotal, i18n.language) ?? '—',
    }
  }, [cart?.grandTotal, cart?.subtotalExclVat, cart?.vatTotal, i18n.language])

  const quantityMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) => updateCartItem(itemId, {
      sessionId,
      quantity,
      languageCode: i18n.language,
    }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cart', sessionId] })
    },
    onError: (error) => {
      message.error(getApiErrorMessage(error, t('cart.errors.update')))
    },
  })

  const removeMutation = useMutation({
    mutationFn: (itemId: string) => removeCartItem(itemId, sessionId, i18n.language),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cart', sessionId] })
      message.success(t('cart.removed'))
    },
    onError: (error) => {
      message.error(getApiErrorMessage(error, t('cart.errors.remove')))
    },
  })

  if (cartQuery.isLoading) {
    return (
      <section className="section-card">
        <Skeleton active paragraph={{ rows: 8 }} />
      </section>
    )
  }

  return (
    <div className="page-stack page-stack--dense">
      <section className="section-card cart-page__hero">
        <div>
          <span className="eyebrow">{t('cart.title')}</span>
          <h1 className="cart-page__title">{t('cart.heading')}</h1>
          <p>{t('cart.description')}</p>
        </div>
        <Button icon={<ShoppingOutlined />} onClick={() => navigate('/products')}>
          {t('common.exploreCatalog')}
        </Button>
      </section>

      {!cart || cart.items.length === 0 ? (
        <section className="section-card">
          <Empty description={t('cart.emptyDescription')}>
            <Button type="primary" onClick={() => navigate('/products')}>{t('cart.emptyAction')}</Button>
          </Empty>
        </section>
      ) : (
        <div className="cart-layout">
          <section className="cart-list">
            {cart.items.map((item) => (
              <article className="section-card cart-item" key={item.id}>
                <div className="cart-item__media">
                  {item.mainImageUrl ? (
                    <img src={item.mainImageUrl} alt={item.productName} />
                  ) : (
                    <div className="product-card__image-fallback">{item.productName.slice(0, 1)}</div>
                  )}
                </div>

                <div className="cart-item__content">
                  <div className="cart-item__header">
                    <div>
                      <strong>{item.productName}</strong>
                      <span>{item.sku}</span>
                    </div>
                    <strong>{formatCurrency(item.lineGrandTotal, i18n.language)}</strong>
                  </div>

                  {item.variantDescription ? <p>{item.variantDescription}</p> : null}

                  <div className="cart-item__controls">
                    <label>
                      <span>{t('cart.quantity')}</span>
                      <InputNumber
                        min={item.minOrderQuantity}
                        max={item.maxOrderQuantity ?? undefined}
                        value={item.quantity}
                        onChange={(value) => {
                          if (typeof value === 'number') {
                            quantityMutation.mutate({ itemId: item.id, quantity: value })
                          }
                        }}
                      />
                    </label>

                    <div className="cart-item__meta">
                      <span>{t('cart.unitPrice')}: {formatCurrency(item.unitPriceExclVat, i18n.language)}</span>
                      <span>{t('cart.vatRate')}: %{item.vatRate}</span>
                    </div>

                    <Button
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeMutation.mutate(item.id)}
                      loading={removeMutation.isPending}
                    >
                      {t('cart.remove')}
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <aside className="section-card cart-summary">
            <div className="section-heading">
              <span className="eyebrow">{t('cart.summary')}</span>
              <p>{t('cart.summaryDescription')}</p>
            </div>

            <div className="cart-summary__rows">
              <div className="cart-summary__row">
                <span>{t('cart.subtotal')}</span>
                <strong>{cartSummary.subtotal}</strong>
              </div>
              <div className="cart-summary__row">
                <span>{t('cart.vat')}</span>
                <strong>{cartSummary.vat}</strong>
              </div>
              <div className="cart-summary__row cart-summary__row--total">
                <span>{t('cart.total')}</span>
                <strong>{cartSummary.total}</strong>
              </div>
            </div>

            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Button type="primary" size="large" block onClick={() => navigate('/checkout')}>
                {t('cart.checkoutNext')}
              </Button>
              <span className="cart-summary__note">{t('cart.checkoutHint')}</span>
            </Space>
          </aside>
        </div>
      )}
    </div>
  )
}

export default CartPage