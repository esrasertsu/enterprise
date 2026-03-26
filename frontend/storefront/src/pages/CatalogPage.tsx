import { useDeferredValue, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button, Card, Col, Empty, Input, Row, Select, Skeleton, Space, Tag } from 'antd'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { fetchProducts } from '../lib/api/products'
import { formatCurrency, formatProductType } from '../lib/formatters'
import { openQuoteDrawer } from '../lib/quoteDrawerStore'
import type { ProductListItem } from '../types/api'

function CatalogPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [searchValue, setSearchValue] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const deferredSearch = useDeferredValue(searchValue)

  const productsQuery = useQuery({
    queryKey: ['products', 'catalog', i18n.language],
    queryFn: () => fetchProducts({ languageCode: i18n.language }),
  })

  const products = productsQuery.data ?? []

  const categories = useMemo(() => {
    const options = products.reduce<Array<{ value: string; label: string }>>((accumulator, product) => {
      if (!accumulator.some((item) => item.value === product.categorySlug)) {
        accumulator.push({
          value: product.categorySlug,
          label: product.categoryName,
        })
      }
      return accumulator
    }, [])

    return [{ value: 'all', label: t('catalog.categoryAll') }, ...options]
  }, [products, t])

  const filteredProducts = useMemo(() => {
    const normalizedSearch = deferredSearch.trim().toLowerCase()

    return products.filter((product: ProductListItem) => {
      const matchesCategory = selectedCategory === 'all' || product.categorySlug === selectedCategory
      const haystack = [product.name, product.shortDescription, product.categoryName]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      const matchesSearch = !normalizedSearch || haystack.includes(normalizedSearch)
      return matchesCategory && matchesSearch
    })
  }, [deferredSearch, products, selectedCategory])

  return (
    <div className="page-stack page-stack--dense">
      <section className="catalog-hero section-card">
        <div className="section-heading section-heading--split">
          <div>
            <span className="eyebrow">{t('catalog.title')}</span>
            <p>{t('catalog.description')}</p>
          </div>
          <Tag>{`${filteredProducts.length} ${t('common.productCount')}`}</Tag>
        </div>
        <div className="catalog-controls">
          <Input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder={t('catalog.searchPlaceholder')}
          />
          <Select value={selectedCategory} options={categories} onChange={setSelectedCategory} />
        </div>
      </section>

      {productsQuery.isLoading ? (
        <Row gutter={[20, 20]}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Col xs={24} md={12} xl={8} key={index}>
              <Card><Skeleton active paragraph={{ rows: 5 }} /></Card>
            </Col>
          ))}
        </Row>
      ) : filteredProducts.length === 0 ? (
        <section className="section-card">
          <Empty description={t('catalog.emptyDescription')} />
        </section>
      ) : (
        <Row gutter={[20, 20]}>
          {filteredProducts.map((product) => (
            <Col xs={24} md={12} xl={8} key={product.id}>
              <Card className="product-card" hoverable>
                <div className="product-card__image">
                  {product.mainImageUrl ? (
                    <img src={product.mainImageUrl} alt={product.name} />
                  ) : (
                    <div className="product-card__image-fallback">{product.name.slice(0, 1)}</div>
                  )}
                </div>
                <Space wrap>
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
    </div>
  )
}

export default CatalogPage