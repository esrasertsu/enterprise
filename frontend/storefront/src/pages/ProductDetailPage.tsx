import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  AppstoreOutlined,
  ArrowLeftOutlined,
  BgColorsOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  MessageOutlined,
  SafetyCertificateOutlined,
  ShoppingCartOutlined,
  SkinOutlined,
  TagsOutlined,
  UnorderedListOutlined,
  EnvironmentOutlined,
} from '@ant-design/icons'
import { App, Button, Card, Col, Empty, Image, InputNumber, Row, Select, Skeleton, Space, Tag } from 'antd'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { addCartItem } from '../lib/api/cart'
import { getApiErrorMessage } from '../lib/api/http'
import { getOrCreateCartSessionId } from '../lib/cartSession'
import { fetchProductBySlug } from '../lib/api/products'
import { formatCurrency, formatLeadTime, formatProductType } from '../lib/formatters'
import { openQuoteDrawer } from '../lib/quoteDrawerStore'

function ProductDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { message } = App.useApp()
  const sessionId = getOrCreateCartSessionId()
  const [selectedVariantOverride, setSelectedVariantOverride] = useState<string | null>(null)
  const [quantityOverride, setQuantityOverride] = useState<number | null>(null)

  const productQuery = useQuery({
    queryKey: ['product', slug, i18n.language],
    queryFn: () => fetchProductBySlug({ slug: slug ?? '', languageCode: i18n.language }),
    enabled: Boolean(slug),
  })

  const product = productQuery.data
  const selectedVariantId =
    product && selectedVariantOverride && product.variants.some((variant) => variant.id === selectedVariantOverride)
      ? selectedVariantOverride
      : product?.variants[0]?.id ?? ''
  const quantity = product ? Math.max(quantityOverride ?? product.minOrderQuantity, product.minOrderQuantity) : 1

  const addToCartMutation = useMutation({
    mutationFn: () => addCartItem({
      sessionId,
      productId: product?.id ?? '',
      productVariantId: selectedVariantId,
      quantity,
      languageCode: i18n.language,
    }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['cart', sessionId] })
      message.success(t('cart.added'))
    },
    onError: (error) => {
      message.error(getApiErrorMessage(error, t('cart.errors.add')))
    },
  })

  if (productQuery.isLoading) {
    return (
      <section className="section-card">
        <Skeleton active paragraph={{ rows: 12 }} />
      </section>
    )
  }

  if (!product) {
    return (
      <section className="section-card">
        <Empty description={t('catalog.emptyDescription')}>
          <Button onClick={() => navigate('/')}>{t('common.backToHome')}</Button>
        </Empty>
      </section>
    )
  }

  const mainImage = product.images.find((image) => image.isMain) ?? product.images[0]
  const firstPrice = product.variants[0]?.priceExclVat
  const selectedVariant = product.variants.find((variant) => variant.id === selectedVariantId) ?? product.variants[0]
  const selectedUnitPrice = selectedVariant?.priceExclVat ?? firstPrice
  const selectedTotal = selectedVariant ? selectedVariant.priceExclVat * quantity : null
  const factItems = [
    {
      key: 'price',
      icon: <TagsOutlined />,
      label: t('product.from'),
      value: formatCurrency(selectedUnitPrice, i18n.language) ?? '—',
    },
    {
      key: 'min-order',
      icon: <ShoppingCartOutlined />,
      label: t('product.minOrder'),
      value: String(product.minOrderQuantity),
    },
    {
      key: 'lead-time',
      icon: <ClockCircleOutlined />,
      label: t('product.leadTime'),
      value: formatLeadTime(product.leadTimeDays, i18n.language) ?? '—',
    },
    {
      key: 'vat-rate',
      icon: <UnorderedListOutlined />,
      label: t('cart.vatRate'),
      value: `${product.baseVatRate}%`,
    },
  ]
  const signalItems = [
    { key: 'customizable', label: t('product.customizable'), enabled: product.isCustomizable, icon: <SkinOutlined /> },
    { key: 'artwork', label: t('product.artwork'), enabled: product.requiresArtwork, icon: <BgColorsOutlined /> },
    { key: 'recyclable', label: t('product.recyclable'), enabled: product.recyclable, icon: <EnvironmentOutlined /> },
    { key: 'food-safe', label: t('product.foodSafe'), enabled: product.foodSafe, icon: <SafetyCertificateOutlined /> },
  ]

  return (
    <div className="page-stack page-stack--dense">
      <Button icon={<ArrowLeftOutlined />} type="text" onClick={() => navigate(-1)}>
        {t('common.backToHome')}
      </Button>

      <section className="section-card product-detail-hero">
        <Row gutter={[28, 28]}>
          <Col xs={24} lg={12}>
            <div className="product-detail-media">
              {mainImage ? (
                <Image src={mainImage.url} alt={product.name} className="product-detail-media__main" />
              ) : (
                <div className="product-card__image-fallback product-card__image-fallback--large">{product.name.slice(0, 1)}</div>
              )}
              <div className="product-detail-media__gallery">
                {product.images.slice(0, 4).map((image) => (
                  <Image key={image.id} src={image.url} alt={image.altText ?? product.name} width={92} height={92} />
                ))}
              </div>
            </div>
          </Col>
          <Col xs={24} lg={12}>
            <div className="product-detail-panel">
              <div className="product-detail-panel__header">
                <Space wrap>
                  <Tag>{product.categoryName}</Tag>
                  <Tag>{formatProductType(product.productType, t)}</Tag>
                </Space>
                <h1 className="product-detail-title">{product.name}</h1>
                <p className="product-detail-summary">{product.shortDescription ?? product.description}</p>
              </div>

              <div className="product-detail-facts">
                {factItems.map((item) => (
                  <div className="product-detail-fact" key={item.key}>
                    <span className="product-detail-fact__icon">{item.icon}</span>
                    <div>
                      <small>{item.label}</small>
                      <strong>{item.value}</strong>
                    </div>
                  </div>
                ))}
              </div>

              <div className="product-order-card">
                <div className="product-order-card__top">
                  <div>
                    <span className="eyebrow">{t('cart.addAction')}</span>
                    <div className="product-detail-price-row">
                      <span className="product-detail-price">{formatCurrency(selectedUnitPrice, i18n.language) ?? '—'}</span>
                      {selectedVariant?.compareAtPriceExclVat ? (
                        <span className="product-detail-price-compare">
                          {formatCurrency(selectedVariant.compareAtPriceExclVat, i18n.language)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="product-order-card__total">
                    <span>{t('cart.total')}</span>
                    <strong>{formatCurrency(selectedTotal, i18n.language) ?? '—'}</strong>
                  </div>
                </div>

                <div className="product-order-card__controls">
                  <label className="field product-order-card__field">
                    <span>{t('cart.variant')}</span>
                    <Select
                      value={selectedVariantId}
                      onChange={setSelectedVariantOverride}
                      options={product.variants.map((variant) => ({
                        value: variant.id,
                        label: `${variant.sku} · ${formatCurrency(variant.priceExclVat, i18n.language) ?? '—'}`,
                      }))}
                    />
                  </label>

                  <label className="field product-order-card__field product-order-card__field--quantity">
                    <span>{t('cart.quantity')}</span>
                    <InputNumber
                      min={product.minOrderQuantity}
                      max={product.maxOrderQuantity ?? undefined}
                      value={quantity}
                      onChange={(value) => {
                        if (typeof value === 'number') {
                          setQuantityOverride(value)
                        }
                      }}
                    />
                  </label>
                </div>

                <div className="product-order-card__meta">
                  <div className="product-order-card__meta-row">
                    <Tag bordered={false}>{selectedVariant?.sku ?? '—'}</Tag>
                    {selectedVariant?.barcode ? <Tag bordered={false}>{selectedVariant.barcode}</Tag> : null}
                  </div>
                  {product.maxOrderQuantity ? (
                    <span className="product-order-card__limit">{`${product.minOrderQuantity} - ${product.maxOrderQuantity}`}</span>
                  ) : (
                    <span className="product-order-card__limit">{`${product.minOrderQuantity}+`}</span>
                  )}
                </div>

                <div className="product-order-card__actions">
                  <Button
                    type="primary"
                    size="large"
                    icon={<ShoppingCartOutlined />}
                    loading={addToCartMutation.isPending}
                    onClick={() => addToCartMutation.mutate()}
                    disabled={!selectedVariant}
                    block
                  >
                    {t('cart.addAction')}
                  </Button>
                  <div className="product-order-card__actions-secondary">
                    <Button type="default" size="large" icon={<MessageOutlined />} onClick={() => openQuoteDrawer(product.name)}>
                      {t('common.requestForProduct')}
                    </Button>
                    <Button size="large" onClick={() => navigate('/cart')}>
                      {t('cart.viewAction')}
                    </Button>
                  </div>
                  <Button icon={<AppstoreOutlined />} size="large" onClick={() => navigate('/products')}>
                    {t('common.exploreCatalog')}
                  </Button>
                </div>
              </div>

            </div>
          </Col>
        </Row>
      </section>

      <Row gutter={[20, 20]}>
        <Col xs={24} lg={14}>
          <Card className="section-card section-card--flush">
            <h2>{t('product.details')}</h2>
            <div className="product-detail-feature-strip">
              {signalItems.map((item) => (
                <div className={`product-detail-feature${item.enabled ? ' product-detail-feature--active' : ''}`} key={item.key}>
                  <span className="product-detail-feature__icon">{item.icon}</span>
                  <div>
                    <strong>{item.label}</strong>
                    <small>{item.enabled ? t('product.yes') : t('product.no')}</small>
                  </div>
                </div>
              ))}
            </div>
            <p>{product.description ?? product.shortDescription ?? t('common.noData')}</p>
          </Card>
        </Col>
        <Col xs={24} lg={10}>
          <Card className="section-card section-card--flush">
            <h2>{t('product.attributes')}</h2>
            <div className="attribute-list">
              {product.attributes.length === 0 ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('common.noData')} />
              ) : (
                product.attributes.map((attribute) => (
                  <div className="attribute-row" key={attribute.id}>
                    <span>{attribute.attributeKey}</span>
                    <strong>{attribute.attributeValue}</strong>
                  </div>
                ))
              )}
            </div>
          </Card>
        </Col>
      </Row>

      <section className="section-card">
        <div className="section-heading section-heading--split">
          <div>
            <span className="eyebrow">{t('product.variants')}</span>
          </div>
        </div>
        <Row gutter={[16, 16]}>
          {product.variants.map((variant) => (
            <Col xs={24} md={12} xl={8} key={variant.id}>
              <Card className={`variant-card${variant.id === selectedVariantId ? ' variant-card--selected' : ''}`}>
                <Space align="center">
                  <CheckCircleOutlined />
                  <strong>{variant.sku}</strong>
                </Space>
                <p>{variant.barcode ?? '—'}</p>
                <div className="product-card__meta">
                  <span>{t('product.from')}</span>
                  <strong>{formatCurrency(variant.priceExclVat, i18n.language)}</strong>
                </div>
                <Button onClick={() => setSelectedVariantOverride(variant.id)}>{t('cart.selectVariant')}</Button>
              </Card>
            </Col>
          ))}
        </Row>
      </section>
    </div>
  )
}

export default ProductDetailPage