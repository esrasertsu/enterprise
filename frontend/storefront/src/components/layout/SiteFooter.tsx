import { Button, Divider, Space, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import { openQuoteDrawer } from '../../lib/quoteDrawerStore'

function SiteFooter() {
  const { t } = useTranslation()

  return (
    <footer className="site-footer">
      <div className="site-footer__top">
        <div>
          <Typography.Title level={2}>Ambalaj Pro</Typography.Title>
          <Typography.Paragraph>{t('footer.note')}</Typography.Paragraph>
        </div>
        <Space size="middle" wrap>
          <Button type="primary" onClick={() => openQuoteDrawer('')}>
            {t('common.quote')}
          </Button>
          <Button href="/products">{t('common.exploreCatalog')}</Button>
        </Space>
      </div>
      <Divider />
      <div className="site-footer__bottom">
        <span>© 2026 Ambalaj Pro</span>
        <span>.NET API + React storefront</span>
      </div>
    </footer>
  )
}

export default SiteFooter