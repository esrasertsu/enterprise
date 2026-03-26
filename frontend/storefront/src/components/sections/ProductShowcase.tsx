import { useQuery } from '@tanstack/react-query'
import { ArrowRightOutlined } from '@ant-design/icons'
import { Button, Card, Col, Empty, Row, Skeleton, Space, Tag } from 'antd'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { fetchProducts } from '../../lib/api/products'
import { formatCurrency, formatProductType } from '../../lib/formatters'
import { openQuoteDrawer } from '../../lib/quoteDrawerStore'

function ProductShowcase() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  const productsQuery = useQuery({
    queryKey: ['products', 'home', i18n.language],
    queryFn: () => fetchProducts({ languageCode: i18n.language }),
  })

  const products = (productsQuery.data ?? []).slice(0, 6)

  return (
    <section className="section-card">
      <div className="section-heading section-heading--split">
        <div>
          <span className="eyebrow">{t('sections.featured')}</span>
          <p>{t('sections.featuredDescription')}</p>
        </div>
        <Button type="link" icon={<ArrowRightOutlined />} onClick={() => navigate('/products')}>
          {t('common.exploreCatalog')}
        </Button>
      </div>

      {productsQuery.isLoading ? (
        <Row gutter={[20, 20]}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Col xs={24} md={12} xl={8} key={index}>
              <Card><Skeleton active paragraph={{ rows: 5 }} /></Card>
            </Col>
          ))}
        </Row>
      ) : products.length === 0 ? (
        <Empty description={t('catalog.emptyDescription')} />
      ) : (
        <Row gutter={[20, 20]}>
          {products.map((product) => (
            <Col xs={24} md={12} xl={8} key={product.id}>
              <Card className="product-card" hoverable>
                <div className="product-card__image">
                  {product.mainImageUrl ? (
                    <img src={product.mainImageUrl} alt={product.name} />
                  ) : (
                    <div className="product-card__image-fallback">{product.name.slice(0, 1)}</div>
                  )}
                </div>
                <Space size={[8, 8]} wrap>
                  <Tag>{product.categoryName}</Tag>
                  <Tag>{formatProductType(product.productType, t)}</Tag>
                </Space>
                <h3>{product.name}</h3>
                <p>{product.shortDescription ?? t('common.noData')}</p>
                <div className="product-card__meta">
                  <span>{t('product.from')}</span>
                  <strong>{formatCurrency(product.minPriceExclVat, i18n.language) ?? '—'}</strong>
                </div>
                <div className="product-card__actions">
                  <Button type="primary" onClick={() => navigate(`/products/${product.slug}`)}>
                    {t('common.shopNow')}
                  </Button>
                  <Button onClick={() => openQuoteDrawer(product.name)}>{t('common.quote')}</Button>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </section>
  )
}

export default ProductShowcase