import http from './http'
import type { CategoryTreeNode } from '../../types/api'

interface FetchCategoriesParams {
  languageCode: string
}

export async function fetchCategories({ languageCode }: FetchCategoriesParams): Promise<CategoryTreeNode[]> {
  const { data } = await http.get<CategoryTreeNode[]>('/api/categories', {
    params: {
      languageCode,
    },
  })

  return data
}