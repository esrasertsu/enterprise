import { Card, Col, Row } from 'antd'
import { useTranslation } from 'react-i18next'

interface CapabilityItem {
  title: string
  body: string
}

function CapabilitiesSection() {
  const { t } = useTranslation()
  const items = t('capabilities.items', { returnObjects: true }) as CapabilityItem[]

  return (
    <section className="section-card" id="custom-flow">
      <div className="section-heading">
        <span className="eyebrow">{t('sections.capabilities')}</span>
      </div>
      <Row gutter={[20, 20]}>
        {items.map((item) => (
          <Col xs={24} md={8} key={item.title}>
            <Card className="capability-card">
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </Card>
          </Col>
        ))}
      </Row>
    </section>
  )
}

export default CapabilitiesSection