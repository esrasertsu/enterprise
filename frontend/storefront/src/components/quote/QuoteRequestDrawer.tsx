import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { App, Button, Drawer, Form, Input, InputNumber } from 'antd'
import { useTranslation } from 'react-i18next'
import { submitQuoteRequest } from '../../lib/api/quoteRequests'
import { closeQuoteDrawer, subscribeQuoteDrawer } from '../../lib/quoteDrawerStore'
import type { QuoteDrawerState, QuoteRequestPayload } from '../../types/api'

function QuoteRequestDrawer() {
  const { t } = useTranslation()
  const { message } = App.useApp()
  const [form] = Form.useForm<QuoteRequestPayload>()
  const [drawerState, setDrawerState] = useState<QuoteDrawerState>({ open: false, productName: '' })

  useEffect(() => subscribeQuoteDrawer(setDrawerState), [])

  useEffect(() => {
    form.setFieldsValue({ productName: drawerState.productName })
  }, [drawerState.productName, form])

  const quoteMutation = useMutation({
    mutationFn: submitQuoteRequest,
    onSuccess: () => {
      message.success(t('common.quoteSubmitted'))
      form.resetFields()
      closeQuoteDrawer()
    },
    onError: () => {
      message.error(t('common.quoteError'))
    },
  })

  return (
    <Drawer
      title={t('quote.title')}
      placement="right"
      open={drawerState.open}
      onClose={() => closeQuoteDrawer()}
      width={460}
      destroyOnHidden
    >
      <p className="quote-drawer__description">{t('quote.description')}</p>
      <Form<QuoteRequestPayload>
        form={form}
        layout="vertical"
        onFinish={(values) => quoteMutation.mutate(values)}
        initialValues={{
          productName: drawerState.productName,
        }}
      >
        <Form.Item label={t('quote.fullName')} name="fullName" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item label={t('quote.email')} name="email" rules={[{ required: true, type: 'email' }]}>
          <Input />
        </Form.Item>
        <Form.Item label={t('quote.phone')} name="phone">
          <Input />
        </Form.Item>
        <Form.Item label={t('quote.companyName')} name="companyName">
          <Input />
        </Form.Item>
        <Form.Item label={t('quote.productName')} name="productName">
          <Input />
        </Form.Item>
        <Form.Item label={t('quote.quantity')} name="quantity">
          <InputNumber min={1} style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item label={t('quote.notes')} name="notes">
          <Input.TextArea rows={5} />
        </Form.Item>
        <Button type="primary" htmlType="submit" block loading={quoteMutation.isPending}>
          {t('quote.submit')}
        </Button>
      </Form>
    </Drawer>
  )
}

export default QuoteRequestDrawer