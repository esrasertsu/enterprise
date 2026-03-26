import { useDeferredValue, useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button, Card, Col, Empty, Input, Row, Select, Skeleton, Space, Tag } from 'antd'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { fetchCategories } from '../lib/api/categories'
import { fetchProducts } from '../lib/api/products'
import { formatCurrency, formatProductType } from '../lib/formatters'
import { openQuoteDrawer } from '../lib/quoteDrawerStore'
import type { CategoryTreeNode, ProductListItem } from '../types/api'

interface CategoryOption {
  value: string
  label: string
}

function flattenCategories(categories: CategoryTreeNode[], depth = 0): CategoryOption[] {
  return categories.flatMap((category) => [
    {
      value: category.slug,
      label: `${depth > 0 ? `${'· '.repeat(depth)}` : ''}${category.name}`,
    },
    ...flattenCategories(category.children, depth + 1),
  ])
}

function CatalogPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchValue, setSearchValue] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') ?? 'all')
  const deferredSearch = useDeferredValue(searchValue)

  useEffect(() => {
    setSelectedCategory(searchParams.get('category') ?? 'all')
  }, [searchParams])

  const categoriesQuery = useQuery({
    queryKey: ['categories', 'catalog', i18n.language],
    queryFn: () => fetchCategories({ languageCode: i18n.language }),
  })

  const productsQuery = useQuery({
    queryKey: ['products', 'catalog', i18n.language, selectedCategory],
    queryFn: () => fetchProducts({
      languageCode: i18n.language,
      categorySlug: selectedCategory === 'all' ? undefined : selectedCategory,
    }),
  })

  const products = productsQuery.data ?? []

  const categories = useMemo(() => {
    const options = flattenCategories(categoriesQuery.data ?? [])

    return [{ value: 'all', label: t('catalog.categoryAll') }, ...options]
  }, [categoriesQuery.data, t])

  function handleSelectCategory(nextCategory: string) {
    setSelectedCategory(nextCategory)

    if (nextCategory === 'all') {
      setSearchParams((current) => {
        const nextParams = new URLSearchParams(current)
        nextParams.delete('category')
        return nextParams
      })
      return
    }

    setSearchParams((current) => {
      const nextParams = new URLSearchParams(current)
      nextParams.set('category', nextCategory)
      return nextParams
    })
  }

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
          <Select value={selectedCategory} options={categories} onChange={handleSelectCategory} />
        </div>
      </section>

      {(categoriesQuery.data ?? []).length > 0 ? (
        <section className="section-card category-tree-panel">
          <div className="section-heading">
            <span className="eyebrow">{t('categories.title')}</span>
            <p>{t('catalog.description')}</p>
          </div>

          <div className="catalog-category-tree">
            <button
              type="button"
              className={`catalog-category-pill${selectedCategory === 'all' ? ' catalog-category-pill--active' : ''}`}
              onClick={() => handleSelectCategory('all')}
            >
              <strong>{t('catalog.categoryAll')}</strong>
            </button>

            {(categoriesQuery.data ?? []).map((category) => (
              <article key={category.id} className="catalog-category-group">
                <button
                  type="button"
                  className={`catalog-category-pill${selectedCategory === category.slug ? ' catalog-category-pill--active' : ''}`}
                  onClick={() => handleSelectCategory(category.slug)}
                >
                  <strong>{category.name}</strong>
                  <span>{`${category.productCount} ${t('common.productCount')}`}</span>
                </button>
                {category.children.length > 0 ? (
                  <div className="catalog-category-children">
                    {category.children.map((child) => (
                      <button
                        key={child.id}
                        type="button"
                        className={`catalog-category-child${selectedCategory === child.slug ? ' catalog-category-child--active' : ''}`}
                        onClick={() => handleSelectCategory(child.slug)}
                      >
                        <span>{child.name}</span>
                        <small>{`${child.productCount} ${t('common.productCount')}`}</small>
                      </button>
                    ))}
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

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