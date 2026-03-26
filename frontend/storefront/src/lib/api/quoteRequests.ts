import http from './http'
import type { QuoteRequestPayload } from '../../types/api'

export async function submitQuoteRequest(payload: QuoteRequestPayload): Promise<{ id: string; message: string }> {
  const { data } = await http.post<{ id: string; message: string }>('/api/quote-requests', payload)
  return data
}