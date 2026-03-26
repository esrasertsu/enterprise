import type { QuoteDrawerState } from '../types/api'

type Listener = (state: QuoteDrawerState) => void

let listeners: Listener[] = []
let state: QuoteDrawerState = {
  open: false,
  productName: '',
}

function emit() {
  listeners.forEach((listener) => listener(state))
}

export function openQuoteDrawer(productName = ''): void {
  state = {
    open: true,
    productName,
  }
  emit()
}

export function closeQuoteDrawer(): void {
  state = {
    ...state,
    open: false,
  }
  emit()
}

export function subscribeQuoteDrawer(listener: Listener): () => void {
  listeners = [...listeners, listener]
  listener(state)

  return () => {
    listeners = listeners.filter((item) => item !== listener)
  }
}