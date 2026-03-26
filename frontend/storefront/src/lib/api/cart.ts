import http from './http'
import type { AddCartItemPayload, Cart, UpdateCartItemPayload } from '../../types/api'

interface FetchCartParams {
  sessionId: string
  languageCode: string
}

export async function fetchCart({ sessionId, languageCode }: FetchCartParams): Promise<Cart> {
  const { data } = await http.get<Cart>('/api/cart', {
    params: {
      sessionId,
      languageCode,
    },
  })

  return data
}

export async function addCartItem(payload: AddCartItemPayload): Promise<Cart> {
  const { data } = await http.post<Cart>('/api/cart/items', payload)
  return data
}

export async function updateCartItem(itemId: string, payload: UpdateCartItemPayload): Promise<Cart> {
  const { data } = await http.patch<Cart>(`/api/cart/items/${itemId}`, payload)
  return data
}

export async function removeCartItem(itemId: string, sessionId: string, languageCode: string): Promise<Cart> {
  const { data } = await http.delete<Cart>(`/api/cart/items/${itemId}`, {
    params: {
      sessionId,
      languageCode,
    },
  })

  return data
}