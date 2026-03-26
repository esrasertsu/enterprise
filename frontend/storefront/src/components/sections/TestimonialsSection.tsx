import { Card, Col, Row } from 'antd'
import { useTranslation } from 'react-i18next'

interface TestimonialCard {
  quote: string
  author: string
}

function TestimonialsSection() {
  const { t } = useTranslation()
  const cards = t('testimonials.cards', { returnObjects: true }) as TestimonialCard[]

  return (
    <section className="section-card" id="reviews">
      <div className="section-heading">
        <span className="eyebrow">{t('sections.testimonials')}</span>
      </div>
      <Row gutter={[20, 20]}>
        {cards.map((card) => (
          <Col xs={24} md={8} key={card.author}>
            <Card className="testimonial-card">
              <p>“{card.quote}”</p>
              <strong>{card.author}</strong>
            </Card>
          </Col>
        ))}
      </Row>
    </section>
  )
}

export default TestimonialsSection