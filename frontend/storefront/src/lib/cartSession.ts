const CART_SESSION_STORAGE_KEY = 'storefront-cart-session-id'

function createSessionId(): string {
  if (typeof window !== 'undefined' && window.crypto?.randomUUID) {
    return window.crypto.randomUUID()
  }

  return `cart-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

export function getOrCreateCartSessionId(): string {
  const existingSessionId = window.localStorage.getItem(CART_SESSION_STORAGE_KEY)

  if (existingSessionId) {
    return existingSessionId
  }

  const nextSessionId = createSessionId()
  window.localStorage.setItem(CART_SESSION_STORAGE_KEY, nextSessionId)
  return nextSessionId
}