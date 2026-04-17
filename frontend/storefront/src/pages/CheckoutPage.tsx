import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { App, Button, Checkbox, Empty, Form, Input, Select, Skeleton, Space, Switch } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { fetchCart } from '../lib/api/cart'
import { createOrder, previewCheckout } from '../lib/api/checkout'
import { getApiErrorMessage } from '../lib/api/http'
import { getOrCreateCartSessionId } from '../lib/cartSession'
import { formatCurrency } from '../lib/formatters'
import type { CheckoutAddressInput, CheckoutPreviewPayload } from '../types/api'

interface CheckoutFormValues {
  email: string
  vatNumber?: string
  needsDesignSupport: boolean
  customerNote?: string
  useBillingAsShippingAddress: boolean
  billingAddress: CheckoutAddressInput
  shippingAddress: CheckoutAddressInput
}

const LUXEMBOURG_COUNTRY_CODE = 'LU'
const LUXEMBOURG_COUNTRY_LABEL = 'Luxembourg'

function withLuxembourgCountry(address: CheckoutAddressInput): CheckoutAddressInput {
  return {
    ...address,
    countryCode: LUXEMBOURG_COUNTRY_CODE,
  }
}

function CheckoutPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { message } = App.useApp()
  const [form] = Form.useForm<CheckoutFormValues>()
  const [previewData, setPreviewData] = useState<Awaited<ReturnType<typeof previewCheckout>> | null>(null)
  const sessionId = getOrCreateCartSessionId()

  const cartQuery = useQuery({
    queryKey: ['cart', sessionId, i18n.language],
    queryFn: () => fetchCart({ sessionId, languageCode: i18n.language }),
  })

  const cart = cartQuery.data
  const useBillingAsShippingAddress = Form.useWatch('useBillingAsShippingAddress', form) ?? true

  const previewMutation = useMutation({
    mutationFn: (payload: CheckoutPreviewPayload) => previewCheckout(payload),
    onSuccess: (data) => {
      setPreviewData(data)
      message.success(t('checkout.previewReady'))
    },
    onError: (error) => {
      message.error(getApiErrorMessage(error, t('checkout.errors.preview')))
    },
  })

  const createOrderMutation = useMutation({
    mutationFn: (payload: CheckoutPreviewPayload) => createOrder(payload),
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({ queryKey: ['cart', sessionId] })
      setPreviewData(null)
      const params = new URLSearchParams({
        orderNumber: data.orderNumber,
        total: String(data.grandTotal),
        currencyCode: data.currencyCode,
        createdAt: data.createdAt,
      })
      navigate(`/checkout/success?${params.toString()}`, { state: data })
    },
    onError: (error) => {
      message.error(getApiErrorMessage(error, t('checkout.errors.create')))
    },
  })

  const fallbackSummary = useMemo(() => {
    return {
      subtotal: formatCurrency(cart?.subtotalExclVat, i18n.language) ?? '—',
      vat: formatCurrency(cart?.vatTotal, i18n.language) ?? '—',
      total: formatCurrency(cart?.grandTotal, i18n.language) ?? '—',
    }
  }, [cart?.grandTotal, cart?.subtotalExclVat, cart?.vatTotal, i18n.language])

  const previewSummary = useMemo(() => {
    return {
      subtotal: formatCurrency(previewData?.subtotalExclVat, i18n.language) ?? fallbackSummary.subtotal,
      vat: formatCurrency(previewData?.vatTotal, i18n.language) ?? fallbackSummary.vat,
      shipping: formatCurrency(previewData?.shippingExclVat, i18n.language) ?? formatCurrency(0, i18n.language) ?? '—',
      total: formatCurrency(previewData?.grandTotal, i18n.language) ?? fallbackSummary.total,
    }
  }, [fallbackSummary.subtotal, fallbackSummary.total, fallbackSummary.vat, i18n.language, previewData?.grandTotal, previewData?.shippingExclVat, previewData?.subtotalExclVat, previewData?.vatTotal])

  function buildPayload(values: CheckoutFormValues): CheckoutPreviewPayload {
    return {
      sessionId,
      email: values.email.trim(),
      billingAddress: withLuxembourgCountry(values.billingAddress),
      shippingAddress: values.useBillingAsShippingAddress ? null : withLuxembourgCountry(values.shippingAddress),
      useBillingAsShippingAddress: values.useBillingAsShippingAddress,
      vatNumber: values.vatNumber?.trim() || null,
      needsDesignSupport: values.needsDesignSupport,
      customerNote: values.customerNote?.trim() || null,
    }
  }

  async function handlePreview() {
    const values = await form.validateFields()
    previewMutation.mutate(buildPayload(values))
  }

  async function handleCreateOrder() {
    const values = await form.validateFields()
    createOrderMutation.mutate(buildPayload(values))
  }

  if (cartQuery.isLoading) {
    return (
      <section className="section-card">
        <Skeleton active paragraph={{ rows: 10 }} />
      </section>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <section className="section-card">
        <Empty description={t('checkout.emptyDescription')}>
          <Button type="primary" onClick={() => navigate('/products')}>{t('checkout.emptyAction')}</Button>
        </Empty>
      </section>
    )
  }

  return (
    <div className="page-stack page-stack--dense">
      <section className="section-card checkout-hero">
        <div>
          <span className="eyebrow">{t('checkout.title')}</span>
          <h1 className="cart-page__title">{t('checkout.heading')}</h1>
          <p>{t('checkout.description')}</p>
        </div>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/cart')}>
          {t('checkout.backToCart')}
        </Button>
      </section>

      <div className="checkout-layout">
        <section className="section-card checkout-form-wrap">
          <Form<CheckoutFormValues>
            form={form}
            layout="vertical"
            initialValues={{
              email: '',
              vatNumber: '',
              needsDesignSupport: false,
              customerNote: '',
              useBillingAsShippingAddress: true,
              billingAddress: {
                contactName: '',
                companyName: '',
                line1: '',
                line2: '',
                postalCode: '',
                city: '',
                state: '',
                countryCode: LUXEMBOURG_COUNTRY_CODE,
                phone: '',
              },
              shippingAddress: {
                contactName: '',
                companyName: '',
                line1: '',
                line2: '',
                postalCode: '',
                city: '',
                state: '',
                countryCode: LUXEMBOURG_COUNTRY_CODE,
                phone: '',
              },
            }}
          >
            <div className="section-heading">
              <span className="eyebrow">{t('checkout.contact')}</span>
            </div>

            <div className="checkout-grid">
              <Form.Item label={t('checkout.email')} name="email" rules={[{ required: true, type: 'email' }]}>
                <Input />
              </Form.Item>
              <Form.Item label={t('checkout.vatNumber')} name="vatNumber">
                <Input />
              </Form.Item>
            </div>

            <Form.Item label={t('checkout.designSupport')} name="needsDesignSupport" valuePropName="checked">
              <Switch />
            </Form.Item>

            <Form.Item label={t('checkout.customerNote')} name="customerNote">
              <Input.TextArea rows={4} />
            </Form.Item>

            <div className="section-heading">
              <span className="eyebrow">{t('checkout.billingAddress')}</span>
            </div>

            <div className="checkout-grid">
              <Form.Item label={t('checkout.contactName')} name={['billingAddress', 'contactName']} rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item label={t('checkout.companyName')} name={['billingAddress', 'companyName']}>
                <Input />
              </Form.Item>
              <Form.Item label={t('checkout.line1')} name={['billingAddress', 'line1']} rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item label={t('checkout.line2')} name={['billingAddress', 'line2']}>
                <Input />
              </Form.Item>
              <Form.Item label={t('checkout.postalCode')} name={['billingAddress', 'postalCode']} rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item label={t('checkout.city')} name={['billingAddress', 'city']} rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item label={t('checkout.state')} name={['billingAddress', 'state']}>
                <Input />
              </Form.Item>
              <Form.Item label={t('checkout.country')} name={['billingAddress', 'countryCode']} rules={[{ required: true }]}>
                <Select
                  disabled
                  options={[{ value: LUXEMBOURG_COUNTRY_CODE, label: LUXEMBOURG_COUNTRY_LABEL }]}
                />
              </Form.Item>
              <Form.Item label={t('checkout.phone')} name={['billingAddress', 'phone']}>
                <Input />
              </Form.Item>
            </div>

            <Form.Item name="useBillingAsShippingAddress" valuePropName="checked" extra={t('checkout.shippingCountryLockedNote')}>
              <Checkbox>{t('checkout.useBillingAsShippingAddress')}</Checkbox>
            </Form.Item>

            {!useBillingAsShippingAddress ? (
              <>
                <div className="section-heading">
                  <span className="eyebrow">{t('checkout.shippingAddress')}</span>
                </div>

                <div className="checkout-grid">
                  <Form.Item label={t('checkout.contactName')} name={['shippingAddress', 'contactName']} rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                  <Form.Item label={t('checkout.companyName')} name={['shippingAddress', 'companyName']}>
                    <Input />
                  </Form.Item>
                  <Form.Item label={t('checkout.line1')} name={['shippingAddress', 'line1']} rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                  <Form.Item label={t('checkout.line2')} name={['shippingAddress', 'line2']}>
                    <Input />
                  </Form.Item>
                  <Form.Item label={t('checkout.postalCode')} name={['shippingAddress', 'postalCode']} rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                  <Form.Item label={t('checkout.city')} name={['shippingAddress', 'city']} rules={[{ required: true }]}>
                    <Input />
                  </Form.Item>
                  <Form.Item label={t('checkout.state')} name={['shippingAddress', 'state']}>
                    <Input />
                  </Form.Item>
                  <Form.Item label={t('checkout.country')} name={['shippingAddress', 'countryCode']} rules={[{ required: true }]}>
                    <Select
                      disabled
                      options={[{ value: LUXEMBOURG_COUNTRY_CODE, label: LUXEMBOURG_COUNTRY_LABEL }]}
                    />
                  </Form.Item>
                  <Form.Item label={t('checkout.phone')} name={['shippingAddress', 'phone']}>
                    <Input />
                  </Form.Item>
                </div>
              </>
            ) : null}
          </Form>
        </section>

        <aside className="section-card checkout-summary">
          <div className="section-heading">
            <span className="eyebrow">{t('checkout.summary')}</span>
            <p>{t('checkout.summaryDescription')}</p>
          </div>

          <div className="checkout-summary__items">
            {cart.items.map((item) => (
              <div className="checkout-summary__item" key={item.id}>
                <div>
                  <strong>{item.productName}</strong>
                  <span>{item.quantity} x {formatCurrency(item.unitPriceExclVat, i18n.language)}</span>
                </div>
                <strong>{formatCurrency(item.lineGrandTotal, i18n.language)}</strong>
              </div>
            ))}
          </div>

          <div className="cart-summary__rows">
            <div className="cart-summary__row">
              <span>{t('checkout.subtotal')}</span>
              <strong>{previewSummary.subtotal}</strong>
            </div>
            <div className="cart-summary__row">
              <span>{t('checkout.shipping')}</span>
              <strong>{previewSummary.shipping}</strong>
            </div>
            <div className="cart-summary__row">
              <span>{t('checkout.vat')}</span>
              <strong>{previewSummary.vat}</strong>
            </div>
            <div className="cart-summary__row cart-summary__row--total">
              <span>{t('checkout.total')}</span>
              <strong>{previewSummary.total}</strong>
            </div>
          </div>

          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Button type="default" size="large" block onClick={() => void handlePreview()} loading={previewMutation.isPending}>
              {t('checkout.previewAction')}
            </Button>
            <Button type="primary" size="large" block onClick={() => void handleCreateOrder()} loading={createOrderMutation.isPending}>
              {t('checkout.placeOrderAction')}
            </Button>
            <span className="cart-summary__note">{previewData ? t('checkout.previewReadyNote') : t('checkout.previewHint')}</span>
          </Space>
        </aside>
      </div>
    </div>
  )
}

export default CheckoutPage