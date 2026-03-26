import { ArrowRightOutlined, MessageOutlined } from '@ant-design/icons'
import { Button, Col, Row, Space, Tag } from 'antd'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { openQuoteDrawer } from '../../lib/quoteDrawerStore'

function HeroSection() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <section className="hero-section">
      <div className="hero-section__backdrop hero-section__backdrop--left" />
      <div className="hero-section__backdrop hero-section__backdrop--right" />

      <Row gutter={[32, 32]} align="middle">
        <Col xs={24} lg={13}>
          <div className="hero-copy">
            <span className="eyebrow">{t('hero.eyebrow')}</span>
            <h1>{t('hero.title')}</h1>
            <p>{t('hero.description')}</p>
            <Space size="middle" wrap>
              <Button type="primary" size="large" icon={<ArrowRightOutlined />} onClick={() => navigate('/products')}>
                {t('hero.primary')}
              </Button>
              <Button size="large" icon={<MessageOutlined />} onClick={() => openQuoteDrawer('')}>
                {t('hero.secondary')}
              </Button>
            </Space>
            <div className="hero-stats">
              <Tag>{t('hero.stats.lead')}</Tag>
              <Tag>{t('hero.stats.support')}</Tag>
              <Tag>{t('hero.stats.b2b')}</Tag>
            </div>
          </div>
        </Col>
        <Col xs={24} lg={11}>
          <div className="hero-visual">
            <div className="hero-visual__panel hero-visual__panel--main">
              <span className="hero-visual__kicker">Brand system</span>
              <strong>Pizza boxes, burger boxes, bowls, bags</strong>
              <p>One storefront for direct buy and quote-led custom packaging.</p>
            </div>
            <div className="hero-visual__panel hero-visual__panel--card">
              <span>MOQ-aware cards</span>
              <strong>Localized product data</strong>
            </div>
            <div className="hero-visual__panel hero-visual__panel--accent">
              <span>API-driven quote flow</span>
              <strong>Admin email notifications active</strong>
            </div>
          </div>
        </Col>
      </Row>
    </section>
  )
}

export default HeroSection