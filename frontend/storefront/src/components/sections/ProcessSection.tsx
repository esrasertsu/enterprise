import { Col, Row, Steps } from 'antd'
import { useTranslation } from 'react-i18next'

interface ProcessStepItem {
  title: string
  description: string
}

function ProcessSection() {
  const { t } = useTranslation()
  const steps = t('process.steps', { returnObjects: true }) as ProcessStepItem[]

  return (
    <section className="section-card process-section" id="process">
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={9}>
          <div className="section-heading">
            <span className="eyebrow">{t('sections.process')}</span>
          </div>
        </Col>
        <Col xs={24} lg={15}>
          <Steps
            direction="vertical"
            items={steps.map((step) => ({
              title: step.title,
              description: step.description,
            }))}
          />
        </Col>
      </Row>
    </section>
  )
}

export default ProcessSection