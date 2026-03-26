import http from './http'
import type { ProductDetail, ProductListItem } from '../../types/api'

interface FetchProductsParams {
  languageCode: string
  categorySlug?: string
}

interface FetchProductBySlugParams {
  slug: string
  languageCode: string
}

export async function fetchProducts({ languageCode, categorySlug }: FetchProductsParams): Promise<ProductListItem[]> {
  const { data } = await http.get<ProductListItem[]>('/api/products', {
    params: {
      languageCode,
      categorySlug: categorySlug || undefined,
    },
  })

  return data
}

export async function fetchProductBySlug({ slug, languageCode }: FetchProductBySlugParams): Promise<ProductDetail> {
  const { data } = await http.get<ProductDetail>(`/api/products/${slug}`, {
    params: {
      languageCode,
    },
  })

  return data
}