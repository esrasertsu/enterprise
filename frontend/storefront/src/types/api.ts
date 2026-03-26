export interface ProductListItem {
  id: string
  slug: string
  name: string
  shortDescription: string | null
  categorySlug: string
  categoryName: string
  mainImageUrl: string | null
  minPriceExclVat: number | null
  maxPriceExclVat: number | null
  productType: number | string
  isCustomizable: boolean
  requiresArtwork: boolean
  minOrderQuantity: number
}

export interface ProductImage {
  id: string
  url: string
  altText: string | null
  sortOrder: number
  isMain: boolean
}

export interface ProductAttribute {
  id: string
  attributeKey: string
  attributeValue: string
  languageCode: string | null
  isFilterable: boolean
  sortOrder: number
}

export interface ProductVariant {
  id: string
  sku: string
  barcode: string | null
  priceExclVat: number
  compareAtPriceExclVat: number | null
  isActive: boolean
  sortOrder: number
}

export interface ProductDetail {
  id: string
  slug: string
  name: string
  shortDescription: string | null
  description: string | null
  categorySlug: string
  categoryName: string
  materialSummary: string | null
  originCountry: string | null
  productType: number | string
  isCustomizable: boolean
  hasVariants: boolean
  requiresArtwork: boolean
  recyclable: boolean
  foodSafe: boolean
  minOrderQuantity: number
  maxOrderQuantity: number | null
  leadTimeDays: number | null
  baseVatRate: number
  weightGrams: number | null
  variants: ProductVariant[]
  images: ProductImage[]
  attributes: ProductAttribute[]
}

export interface CategoryTreeNode {
  id: string
  slug: string
  name: string
  description: string | null
  imageUrl: string | null
  productCount: number
  children: CategoryTreeNode[]
}

export interface QuoteRequestPayload {
  fullName: string
  email: string
  phone?: string
  companyName?: string
  productName?: string
  quantity?: number
  notes?: string
}

export interface QuoteDrawerState {
  open: boolean
  productName: string
}

export interface CartItem {
  id: string
  productId: string
  productVariantId: string
  productSlug: string
  productName: string
  mainImageUrl: string | null
  sku: string
  variantDescription: string | null
  quantity: number
  unitPriceExclVat: number
  vatRate: number
  lineTotalExclVat: number
  lineVatTotal: number
  lineGrandTotal: number
  minOrderQuantity: number
  maxOrderQuantity: number | null
}

export interface Cart {
  id: string | null
  sessionId: string
  currencyCode: string
  itemCount: number
  subtotalExclVat: number
  discountExclVat: number
  vatTotal: number
  grandTotal: number
  items: CartItem[]
}

export interface AddCartItemPayload {
  sessionId: string
  productId: string
  productVariantId: string
  quantity: number
  languageCode: string
}

export interface UpdateCartItemPayload {
  sessionId: string
  quantity: number
  languageCode: string
}

export interface CheckoutAddressInput {
  contactName: string
  companyName?: string | null
  line1: string
  line2?: string | null
  postalCode: string
  city: string
  state?: string | null
  countryCode: string
  phone?: string | null
}

export interface CheckoutPreviewPayload {
  sessionId: string
  email: string
  billingAddress: CheckoutAddressInput
  shippingAddress?: CheckoutAddressInput | null
  useBillingAsShippingAddress: boolean
  vatNumber?: string | null
  needsDesignSupport: boolean
  customerNote?: string | null
}

export interface CheckoutPreviewItem {
  cartItemId: string
  productId: string
  productVariantId: string
  productSlug: string
  productName: string
  sku: string
  variantDescription: string | null
  quantity: number
  unitPriceExclVat: number
  vatRate: number
  lineTotalExclVat: number
  lineVatTotal: number
  lineGrandTotal: number
}

export interface CheckoutPreview {
  cartId: string
  sessionId: string
  email: string
  currencyCode: string
  itemCount: number
  subtotalExclVat: number
  discountExclVat: number
  shippingExclVat: number
  vatTotal: number
  grandTotal: number
  couponCode: string | null
  needsDesignSupport: boolean
  items: CheckoutPreviewItem[]
}

export interface CreatedOrder {
  id: string
  orderNumber: string
  currencyCode: string
  subtotalExclVat: number
  discountExclVat: number
  shippingExclVat: number
  vatTotal: number
  grandTotal: number
  orderStatus: number
  paymentStatus: number
  fulfillmentStatus: number
  createdAt: string
}