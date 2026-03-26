import http from './http'
import type { CheckoutPreview, CheckoutPreviewPayload, CreatedOrder } from '../../types/api'

export async function previewCheckout(payload: CheckoutPreviewPayload): Promise<CheckoutPreview> {
  const { data } = await http.post<CheckoutPreview>('/api/checkout/preview', payload)
  return data
}

export async function createOrder(payload: CheckoutPreviewPayload): Promise<CreatedOrder> {
  const { data } = await http.post<CreatedOrder>('/api/checkout/orders', payload)
  return data
}