import { Button, Space } from 'antd'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

function CategoryRail() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const items = t('categories.items', { returnObjects: true }) as string[]

  return (
    <section className="category-rail section-card">
      <div className="section-heading">
        <span className="eyebrow">{t('categories.title')}</span>
      </div>
      <Space wrap size="middle">
        {items.map((item) => (
          <Button key={item} shape="round" onClick={() => navigate('/products')}>
            {item}
          </Button>
        ))}
      </Space>
    </section>
  )
}

export default CategoryRail