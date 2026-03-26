export interface AdminCategoryOption {
  id: string
  slug: string
  displayName: string
  isActive: boolean
}

export interface AdminCategoryTranslation {
  languageCode: string
  name: string
  description: string | null
  seoTitle: string | null
  seoDescription: string | null
}

export interface AdminCategoryDetail {
  id: string
  parentCategoryId: string | null
  parentCategoryName: string | null
  slug: string
  isActive: boolean
  sortOrder: number
  imageUrl: string | null
  translations: AdminCategoryTranslation[]
  createdAt: string
  updatedAt: string
}

export interface CategoryTranslationForm {
  languageCode: string
  name: string
  description: string
  seoTitle: string
  seoDescription: string
}

export interface CategoryFormState {
  parentCategoryId: string
  slug: string
  isActive: boolean
  sortOrder: string
  imageUrl: string
  translations: CategoryTranslationForm[]
}

export interface CreatedCategoryResponse {
  id: string
}

export interface AdminProductListItem {
  id: string
  slug: string
  skuRoot: string
  displayName: string
  categoryName: string
  isActive: boolean
  isFeatured: boolean
  productType: number
  createdAt: string
}

export interface AdminProductTranslation {
  languageCode: string
  name: string
  shortDescription: string | null
  description: string | null
  seoTitle: string | null
  seoDescription: string | null
}

export interface AdminProductVariant {
  sku: string
  barcode: string | null
  priceExclVat: number
  compareAtPriceExclVat: number | null
  stockQuantity: number
  reservedStockQuantity: number
  isActive: boolean
  sortOrder: number
}

export interface AdminProductAttribute {
  attributeKey: string
  attributeValue: string
  languageCode: string | null
  isFilterable: boolean
  sortOrder: number
}

export interface AdminProductImage {
  id: string
  url: string
  altText: string | null
  isMain: boolean
  sortOrder: number
  createdAt: string
}

export interface AdminProductDetail {
  id: string
  categoryId: string
  categorySlug: string
  slug: string
  skuRoot: string
  productType: number
  isActive: boolean
  isFeatured: boolean
  isCustomizable: boolean
  hasVariants: boolean
  requiresArtwork: boolean
  minOrderQuantity: number
  maxOrderQuantity: number | null
  leadTimeDays: number | null
  baseVatRate: number
  weightGrams: number | null
  materialSummary: string | null
  originCountry: string | null
  recyclable: boolean
  foodSafe: boolean
  translations: AdminProductTranslation[]
  variants: AdminProductVariant[]
  images: AdminProductImage[]
  attributes: AdminProductAttribute[]
  createdAt: string
  updatedAt: string
}

export interface ProductTranslationForm {
  languageCode: string
  name: string
  shortDescription: string
  description: string
  seoTitle: string
  seoDescription: string
}

export interface ProductVariantForm {
  sku: string
  barcode: string
  priceExclVat: string
  compareAtPriceExclVat: string
  stockQuantity: string
  reservedStockQuantity: string
  isActive: boolean
  sortOrder: string
}

export interface ProductAttributeForm {
  attributeKey: string
  attributeValue: string
  languageCode: string
  isFilterable: boolean
  sortOrder: string
}

export interface ProductFormState {
  categoryId: string
  slug: string
  skuRoot: string
  productType: string
  isActive: boolean
  isFeatured: boolean
  isCustomizable: boolean
  hasVariants: boolean
  requiresArtwork: boolean
  minOrderQuantity: string
  maxOrderQuantity: string
  leadTimeDays: string
  baseVatRate: string
  weightGrams: string
  materialSummary: string
  originCountry: string
  recyclable: boolean
  foodSafe: boolean
  translations: ProductTranslationForm[]
  variants: ProductVariantForm[]
  attributes: ProductAttributeForm[]
}

export interface CreatedProductResponse {
  id: string
}

export interface AdminOrderListItem {
  id: string
  orderNumber: string
  customerName: string
  customerEmail: string
  itemCount: number
  grandTotal: number
  currencyCode: string
  orderStatus: number
  paymentStatus: number
  fulfillmentStatus: number
  needsDesignSupport: boolean
  createdAt: string
}