import axios from 'axios'

const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '',
  headers: {
    'Content-Type': 'application/json',
  },
})

export function getApiErrorMessage(error: unknown, fallbackMessage: string): string {
  if (axios.isAxiosError(error)) {
    const title = error.response?.data && typeof error.response.data === 'object' && 'title' in error.response.data
      ? String(error.response.data.title ?? '')
      : ''

    const detail = error.response?.data && typeof error.response.data === 'object' && 'detail' in error.response.data
      ? String(error.response.data.detail ?? '')
      : ''

    return title || detail || error.message || fallbackMessage
  }

  return error instanceof Error ? error.message : fallbackMessage
}

export default http