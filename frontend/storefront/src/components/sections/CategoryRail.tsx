import { useQuery } from '@tanstack/react-query'
import { Button, Empty, Skeleton } from 'antd'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { fetchCategories } from '../../lib/api/categories'
import type { CategoryTreeNode } from '../../types/api'

function CategoryCard({ category, onNavigate, productCountLabel }: { category: CategoryTreeNode; onNavigate: (slug: string) => void; productCountLabel: string }) {
  return (
    <article className="category-tree-card">
      <button type="button" className="category-tree-card__header" onClick={() => onNavigate(category.slug)}>
        <div className="category-tree-card__media">
          {category.imageUrl ? (
            <img src={category.imageUrl} alt={category.name} />
          ) : (
            <span>{category.name.slice(0, 1)}</span>
          )}
        </div>
        <div>
          <strong>{category.name}</strong>
          <span>{category.productCount} {productCountLabel}</span>
        </div>
      </button>

      {category.description ? <p>{category.description}</p> : null}

      {category.children.length > 0 ? (
        <div className="category-tree-card__children">
          {category.children.map((child) => (
            <Button key={child.id} shape="round" onClick={() => onNavigate(child.slug)}>
              {child.name}
            </Button>
          ))}
        </div>
      ) : null}
    </article>
  )
}

function CategoryRail() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  const categoriesQuery = useQuery({
    queryKey: ['categories', 'home', i18n.language],
    queryFn: () => fetchCategories({ languageCode: i18n.language }),
  })

  function handleNavigate(slug: string) {
    navigate(`/products?category=${slug}`)
  }

  return (
    <section className="category-rail section-card">
      <div className="section-heading">
        <span className="eyebrow">{t('categories.title')}</span>
      </div>

      {categoriesQuery.isLoading ? (
        <div className="category-tree-grid">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="category-tree-card"><Skeleton active paragraph={{ rows: 3 }} /></div>
          ))}
        </div>
      ) : (categoriesQuery.data ?? []).length === 0 ? (
        <Empty description={t('catalog.emptyDescription')} />
      ) : (
        <div className="category-tree-grid">
          {(categoriesQuery.data ?? []).map((category) => (
            <CategoryCard key={category.id} category={category} onNavigate={handleNavigate} productCountLabel={t('common.productCount')} />
          ))}
        </div>
      )}
    </section>
  )
}

export default CategoryRail