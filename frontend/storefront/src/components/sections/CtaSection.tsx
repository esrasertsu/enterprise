import { ArrowRightOutlined, MessageOutlined } from '@ant-design/icons'
import { Button, Space } from 'antd'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { openQuoteDrawer } from '../../lib/quoteDrawerStore'

function CtaSection() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <section className="cta-section">
      <div>
        <span className="eyebrow">Storefront MVP</span>
        <h2>{t('sections.cta')}</h2>
      </div>
      <Space wrap>
        <Button type="primary" size="large" icon={<ArrowRightOutlined />} onClick={() => navigate('/products')}>
          {t('common.exploreCatalog')}
        </Button>
        <Button size="large" icon={<MessageOutlined />} onClick={() => openQuoteDrawer('')}>
          {t('common.contactTeam')}
        </Button>
      </Space>
    </section>
  )
}

export default CtaSection