import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AppstoreOutlined, ArrowLeftOutlined, CheckCircleOutlined, MessageOutlined, ShoppingCartOutlined } from '@ant-design/icons'
import { App, Button, Card, Col, Descriptions, Empty, Image, InputNumber, Row, Select, Skeleton, Space, Tag } from 'antd'
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
  const [selectedVariantId, setSelectedVariantId] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(1)

  const productQuery = useQuery({
    queryKey: ['product', slug, i18n.language],
    queryFn: () => fetchProductBySlug({ slug: slug ?? '', languageCode: i18n.language }),
    enabled: Boolean(slug),
  })

  const product = productQuery.data

  useEffect(() => {
    if (!product) {
      return
    }

    setSelectedVariantId((current) => {
      if (current && product.variants.some((variant) => variant.id === current)) {
        return current
      }

      return product.variants[0]?.id ?? ''
    })
    setQuantity(product.minOrderQuantity)
  }, [product])

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
            <Space wrap>
              <Tag>{product.categoryName}</Tag>
              <Tag>{formatProductType(product.productType, t)}</Tag>
            </Space>
            <h1 className="product-detail-title">{product.name}</h1>
            <p className="product-detail-summary">{product.shortDescription ?? product.description}</p>
            <div className="product-detail-price">{formatCurrency(firstPrice, i18n.language) ?? '—'}</div>
            <div className="product-purchase-panel">
              <label className="field product-purchase-panel__field">
                <span>{t('cart.variant')}</span>
                <Select
                  value={selectedVariantId}
                  onChange={setSelectedVariantId}
                  options={product.variants.map((variant) => ({
                    value: variant.id,
                    label: `${variant.sku} · ${formatCurrency(variant.priceExclVat, i18n.language) ?? '—'}`,
                  }))}
                />
              </label>

              <label className="field product-purchase-panel__field product-purchase-panel__field--quantity">
                <span>{t('cart.quantity')}</span>
                <InputNumber
                  min={product.minOrderQuantity}
                  max={product.maxOrderQuantity ?? undefined}
                  value={quantity}
                  onChange={(value) => {
                    if (typeof value === 'number') {
                      setQuantity(value)
                    }
                  }}
                />
              </label>
            </div>
            <Space wrap>
              <Button
                type="primary"
                icon={<ShoppingCartOutlined />}
                loading={addToCartMutation.isPending}
                onClick={() => addToCartMutation.mutate()}
                disabled={!selectedVariant}
              >
                {t('cart.addAction')}
              </Button>
              <Button type="primary" icon={<MessageOutlined />} onClick={() => openQuoteDrawer(product.name)}>
                {t('common.requestForProduct')}
              </Button>
              <Button onClick={() => navigate('/cart')}>{t('cart.viewAction')}</Button>
              <Button icon={<AppstoreOutlined />} onClick={() => navigate('/products')}>
                {t('common.exploreCatalog')}
              </Button>
            </Space>

            <Descriptions title={t('product.specifications')} column={1} className="product-specs">
              <Descriptions.Item label={t('product.minOrder')}>{product.minOrderQuantity}</Descriptions.Item>
              <Descriptions.Item label={t('product.leadTime')}>
                {formatLeadTime(product.leadTimeDays, i18n.language) ?? '—'}
              </Descriptions.Item>
              <Descriptions.Item label={t('product.customizable')}>
                {product.isCustomizable ? t('product.yes') : t('product.no')}
              </Descriptions.Item>
              <Descriptions.Item label={t('product.artwork')}>
                {product.requiresArtwork ? t('product.yes') : t('product.no')}
              </Descriptions.Item>
              <Descriptions.Item label={t('product.recyclable')}>
                {product.recyclable ? t('product.yes') : t('product.no')}
              </Descriptions.Item>
              <Descriptions.Item label={t('product.foodSafe')}>
                {product.foodSafe ? t('product.yes') : t('product.no')}
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </section>

      <Row gutter={[20, 20]}>
        <Col xs={24} lg={14}>
          <Card className="section-card section-card--flush">
            <h2>{t('product.details')}</h2>
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
                <Button onClick={() => setSelectedVariantId(variant.id)}>{t('cart.selectVariant')}</Button>
              </Card>
            </Col>
          ))}
        </Row>
      </section>
    </div>
  )
}

export default ProductDetailPage