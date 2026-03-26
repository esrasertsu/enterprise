import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChangeEvent, DragEvent, FormEvent } from 'react'
import type {
  AdminCategoryOption,
  AdminProductDetail,
  AdminProductImage,
  AdminProductListItem,
  CreatedProductResponse,
  ProductAttributeForm,
  ProductFormState,
  ProductTranslationForm,
  ProductVariantForm,
} from '../types/admin'

const productTypeOptions = [
  { value: '1', label: 'Standard' },
  { value: '2', label: 'Custom printed' },
]

function createEmptyTranslation(languageCode = 'en'): ProductTranslationForm {
  return {
    languageCode,
    name: '',
    shortDescription: '',
    description: '',
    seoTitle: '',
    seoDescription: '',
  }
}

function createEmptyVariant(sortOrder = 1): ProductVariantForm {
  return {
    sku: '',
    barcode: '',
    priceExclVat: '0',
    compareAtPriceExclVat: '',
    stockQuantity: '0',
    reservedStockQuantity: '0',
    isActive: true,
    sortOrder: String(sortOrder),
  }
}

function createEmptyAttribute(sortOrder = 1): ProductAttributeForm {
  return {
    attributeKey: '',
    attributeValue: '',
    languageCode: '',
    isFilterable: false,
    sortOrder: String(sortOrder),
  }
}

function createEmptyProductForm(): ProductFormState {
  return {
    categoryId: '',
    slug: '',
    skuRoot: '',
    productType: '2',
    isActive: true,
    isFeatured: false,
    isCustomizable: true,
    hasVariants: true,
    requiresArtwork: false,
    minOrderQuantity: '1',
    maxOrderQuantity: '',
    leadTimeDays: '',
    baseVatRate: '20',
    weightGrams: '',
    materialSummary: '',
    originCountry: '',
    recyclable: false,
    foodSafe: false,
    translations: [createEmptyTranslation('en'), createEmptyTranslation('tr')],
    variants: [createEmptyVariant(1)],
    attributes: [],
  }
}

function mapProductDetailToForm(product: AdminProductDetail): ProductFormState {
  return {
    categoryId: product.categoryId,
    slug: product.slug ?? '',
    skuRoot: product.skuRoot ?? '',
    productType: String(product.productType ?? 1),
    isActive: Boolean(product.isActive),
    isFeatured: Boolean(product.isFeatured),
    isCustomizable: Boolean(product.isCustomizable),
    hasVariants: Boolean(product.hasVariants),
    requiresArtwork: Boolean(product.requiresArtwork),
    minOrderQuantity: String(product.minOrderQuantity ?? 1),
    maxOrderQuantity: product.maxOrderQuantity == null ? '' : String(product.maxOrderQuantity),
    leadTimeDays: product.leadTimeDays == null ? '' : String(product.leadTimeDays),
    baseVatRate: String(product.baseVatRate ?? 0),
    weightGrams: product.weightGrams == null ? '' : String(product.weightGrams),
    materialSummary: product.materialSummary ?? '',
    originCountry: product.originCountry ?? '',
    recyclable: Boolean(product.recyclable),
    foodSafe: Boolean(product.foodSafe),
    translations: product.translations?.length
      ? product.translations.map((translation) => ({
          languageCode: translation.languageCode ?? '',
          name: translation.name ?? '',
          shortDescription: translation.shortDescription ?? '',
          description: translation.description ?? '',
          seoTitle: translation.seoTitle ?? '',
          seoDescription: translation.seoDescription ?? '',
        }))
      : [createEmptyTranslation('en')],
    variants: product.variants?.length
      ? product.variants.map((variant, index) => ({
          sku: variant.sku ?? '',
          barcode: variant.barcode ?? '',
          priceExclVat: String(variant.priceExclVat ?? 0),
          compareAtPriceExclVat: variant.compareAtPriceExclVat == null ? '' : String(variant.compareAtPriceExclVat),
          stockQuantity: String(variant.stockQuantity ?? 0),
          reservedStockQuantity: String(variant.reservedStockQuantity ?? 0),
          isActive: Boolean(variant.isActive),
          sortOrder: String(variant.sortOrder ?? index + 1),
        }))
      : [createEmptyVariant(1)],
    attributes: product.attributes?.map((attribute, index) => ({
      attributeKey: attribute.attributeKey ?? '',
      attributeValue: attribute.attributeValue ?? '',
      languageCode: attribute.languageCode ?? '',
      isFilterable: Boolean(attribute.isFilterable),
      sortOrder: String(attribute.sortOrder ?? index + 1),
    })) ?? [],
  }
}

function normalizeOptionalString(value: string): string | null {
  const trimmedValue = value.trim()
  return trimmedValue ? trimmedValue : null
}

function parseInteger(value: string, fallbackValue = 0): number {
  const parsedValue = Number.parseInt(value, 10)
  return Number.isNaN(parsedValue) ? fallbackValue : parsedValue
}

function parseDecimal(value: string, fallbackValue = 0): number {
  const parsedValue = Number.parseFloat(value)
  return Number.isNaN(parsedValue) ? fallbackValue : parsedValue
}

function buildProductPayload(form: ProductFormState, selectedProduct: AdminProductDetail | null) {
  return {
    categoryId: form.categoryId,
    slug: form.slug.trim(),
    skuRoot: form.skuRoot.trim(),
    productType: parseInteger(form.productType, 1),
    isActive: form.isActive,
    isFeatured: form.isFeatured,
    isCustomizable: form.isCustomizable,
    hasVariants: form.hasVariants,
    requiresArtwork: form.requiresArtwork,
    minOrderQuantity: parseInteger(form.minOrderQuantity, 1),
    maxOrderQuantity: normalizeOptionalString(form.maxOrderQuantity) ? parseInteger(form.maxOrderQuantity) : null,
    leadTimeDays: normalizeOptionalString(form.leadTimeDays) ? parseInteger(form.leadTimeDays) : null,
    baseVatRate: parseDecimal(form.baseVatRate, 0),
    weightGrams: normalizeOptionalString(form.weightGrams) ? parseDecimal(form.weightGrams) : null,
    materialSummary: normalizeOptionalString(form.materialSummary),
    originCountry: normalizeOptionalString(form.originCountry),
    recyclable: form.recyclable,
    foodSafe: form.foodSafe,
    translations: form.translations.map((translation) => ({
      languageCode: translation.languageCode.trim(),
      name: translation.name.trim(),
      shortDescription: normalizeOptionalString(translation.shortDescription),
      description: normalizeOptionalString(translation.description),
      seoTitle: normalizeOptionalString(translation.seoTitle),
      seoDescription: normalizeOptionalString(translation.seoDescription),
    })),
    variants: form.variants.map((variant, index) => ({
      sku: variant.sku.trim(),
      barcode: normalizeOptionalString(variant.barcode),
      priceExclVat: parseDecimal(variant.priceExclVat, 0),
      compareAtPriceExclVat: normalizeOptionalString(variant.compareAtPriceExclVat) ? parseDecimal(variant.compareAtPriceExclVat) : null,
      stockQuantity: parseInteger(variant.stockQuantity, 0),
      reservedStockQuantity: parseInteger(variant.reservedStockQuantity, 0),
      isActive: variant.isActive,
      sortOrder: parseInteger(variant.sortOrder, index + 1),
    })),
    images: selectedProduct?.images?.map((image, index) => ({
      url: image.url,
      altText: image.altText,
      sortOrder: image.sortOrder ?? index + 1,
      isMain: image.isMain,
    })) ?? [],
    attributes: form.attributes
      .filter((attribute) => attribute.attributeKey.trim() || attribute.attributeValue.trim())
      .map((attribute, index) => ({
        attributeKey: attribute.attributeKey.trim(),
        attributeValue: attribute.attributeValue.trim(),
        languageCode: normalizeOptionalString(attribute.languageCode),
        isFilterable: attribute.isFilterable,
        sortOrder: parseInteger(attribute.sortOrder, index + 1),
      })),
  }
}

async function readErrorMessage(response: Response, fallbackMessage: string): Promise<string> {
  const responseText = await response.text()
  if (!responseText) {
    return fallbackMessage
  }

  try {
    const responseJson = JSON.parse(responseText) as {
      title?: string
      detail?: string
      errors?: Record<string, string[]>
    }

    if (responseJson.errors) {
      return Object.entries(responseJson.errors)
        .map(([fieldName, messages]) => `${fieldName}: ${messages.join(', ')}`)
        .join(' | ')
    }

    return responseJson.title || responseJson.detail || fallbackMessage
  } catch {
    return responseText
  }
}

function ProductsPage() {
  const [products, setProducts] = useState<AdminProductListItem[]>([])
  const [categories, setCategories] = useState<AdminCategoryOption[]>([])
  const [selectedProductId, setSelectedProductId] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<AdminProductDetail | null>(null)
  const [productForm, setProductForm] = useState<ProductFormState>(createEmptyProductForm)
  const [files, setFiles] = useState<File[]>([])
  const [altText, setAltText] = useState('')
  const [isMain, setIsMain] = useState(false)
  const [sortOrder, setSortOrder] = useState('')
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [isSavingProduct, setIsSavingProduct] = useState(false)
  const [isDeletingProduct, setIsDeletingProduct] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [activeImageId, setActiveImageId] = useState('')
  const [draggedImageId, setDraggedImageId] = useState('')
  const [dragOverImageId, setDragOverImageId] = useState('')
  const [imageAltTexts, setImageAltTexts] = useState<Record<string, string>>({})
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const isCreateMode = !selectedProductId

  useEffect(() => {
    async function loadInitialData() {
      await Promise.all([loadProducts(), loadCategories()])
    }

    void loadInitialData()
  }, [])

  useEffect(() => {
    if (!selectedProductId) {
      setSelectedProduct(null)
      setProductForm(createEmptyProductForm())
      return
    }

    async function loadProductDetail() {
      setError('')

      try {
        const response = await fetch(`/api/admin/products/${selectedProductId}`)
        if (!response.ok) {
          throw new Error('Product detail could not be loaded.')
        }

        const data = (await response.json()) as AdminProductDetail
        setSelectedProduct(data)
        setProductForm(mapProductDetailToForm(data))
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unexpected error while loading product detail.')
      }
    }

    void loadProductDetail()
  }, [selectedProductId])

  useEffect(() => {
    if (!selectedProduct?.images) {
      setImageAltTexts({})
      return
    }

    setImageAltTexts(Object.fromEntries(selectedProduct.images.map((image) => [image.id, image.altText || ''])))
  }, [selectedProduct])

  const sortedImages = useMemo<AdminProductImage[]>(() => {
    if (!selectedProduct?.images) {
      return []
    }

    return [...selectedProduct.images].sort((left, right) => {
      if (left.isMain === right.isMain) {
        return left.sortOrder - right.sortOrder
      }

      return left.isMain ? -1 : 1
    })
  }, [selectedProduct])

  async function loadProducts(preferredProductId: string | null = null): Promise<AdminProductListItem[]> {
    setIsLoadingProducts(true)

    try {
      const response = await fetch('/api/admin/products')
      if (!response.ok) {
        throw new Error('Products could not be loaded.')
      }

      const data = (await response.json()) as AdminProductListItem[]
      setProducts(data)

      if (preferredProductId) {
        setSelectedProductId(preferredProductId)
      } else if (!selectedProductId && data.length > 0) {
        setSelectedProductId(data[0].id)
      }

      return data
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unexpected error while loading products.')
      return []
    } finally {
      setIsLoadingProducts(false)
    }
  }

  async function loadCategories() {
    setIsLoadingCategories(true)

    try {
      const response = await fetch('/api/admin/categories')
      if (!response.ok) {
        throw new Error('Categories could not be loaded.')
      }

      const data = (await response.json()) as AdminCategoryOption[]
      setCategories(data)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unexpected error while loading categories.')
    } finally {
      setIsLoadingCategories(false)
    }
  }

  async function refreshProductDetail(productId: string) {
    const response = await fetch(`/api/admin/products/${productId}`)
    if (!response.ok) {
      throw new Error('Product detail could not be loaded.')
    }

    const data = (await response.json()) as AdminProductDetail
    setSelectedProduct(data)
    setProductForm(mapProductDetailToForm(data))
  }

  function updateProductField<K extends keyof ProductFormState>(fieldName: K, value: ProductFormState[K]) {
    setProductForm((current) => ({
      ...current,
      [fieldName]: value,
    }))
  }

  function updateTranslation(index: number, fieldName: keyof ProductTranslationForm, value: string) {
    setProductForm((current) => ({
      ...current,
      translations: current.translations.map((translation, translationIndex) => (
        translationIndex === index ? { ...translation, [fieldName]: value } : translation
      )),
    }))
  }

  function addTranslation() {
    setProductForm((current) => ({
      ...current,
      translations: [...current.translations, createEmptyTranslation()],
    }))
  }

  function removeTranslation(index: number) {
    setProductForm((current) => ({
      ...current,
      translations: current.translations.filter((_, translationIndex) => translationIndex !== index),
    }))
  }

  function updateVariant(index: number, fieldName: keyof ProductVariantForm, value: string | boolean) {
    setProductForm((current) => ({
      ...current,
      variants: current.variants.map((variant, variantIndex) => (
        variantIndex === index ? { ...variant, [fieldName]: value } : variant
      )),
    }))
  }

  function addVariant() {
    setProductForm((current) => ({
      ...current,
      variants: [...current.variants, createEmptyVariant(current.variants.length + 1)],
    }))
  }

  function removeVariant(index: number) {
    setProductForm((current) => ({
      ...current,
      variants: current.variants.filter((_, variantIndex) => variantIndex !== index),
    }))
  }

  function updateAttribute(index: number, fieldName: keyof ProductAttributeForm, value: string | boolean) {
    setProductForm((current) => ({
      ...current,
      attributes: current.attributes.map((attribute, attributeIndex) => (
        attributeIndex === index ? { ...attribute, [fieldName]: value } : attribute
      )),
    }))
  }

  function addAttribute() {
    setProductForm((current) => ({
      ...current,
      attributes: [...current.attributes, createEmptyAttribute(current.attributes.length + 1)],
    }))
  }

  function removeAttribute(index: number) {
    setProductForm((current) => ({
      ...current,
      attributes: current.attributes.filter((_, attributeIndex) => attributeIndex !== index),
    }))
  }

  function startCreateProduct() {
    setSelectedProductId('')
    setSelectedProduct(null)
    setProductForm(createEmptyProductForm())
    setMessage('')
    setError('')
  }

  async function handleSaveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')
    setIsSavingProduct(true)

    try {
      const payload = buildProductPayload(productForm, selectedProduct)
      const isUpdating = Boolean(selectedProductId)
      const response = await fetch(isUpdating ? `/api/admin/products/${selectedProductId}` : '/api/admin/products', {
        method: isUpdating ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, 'Product could not be saved.'))
      }

      if (isUpdating) {
        await Promise.all([refreshProductDetail(selectedProductId), loadProducts(selectedProductId)])
        setMessage('Product updated.')
      } else {
        const created = (await response.json()) as CreatedProductResponse
        await loadProducts(created.id)
        setMessage('Product created. You can now upload images below.')
      }
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unexpected save error.')
    } finally {
      setIsSavingProduct(false)
    }
  }

  async function handleDeleteProduct() {
    if (!selectedProductId || !window.confirm('Delete this product?')) {
      return
    }

    setError('')
    setMessage('')
    setIsDeletingProduct(true)

    try {
      const response = await fetch(`/api/admin/products/${selectedProductId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, 'Product could not be deleted.'))
      }

      setSelectedProductId('')
      setSelectedProduct(null)
      setProductForm(createEmptyProductForm())
      await loadProducts()
      setMessage('Product deleted.')
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unexpected delete error.')
    } finally {
      setIsDeletingProduct(false)
    }
  }

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!selectedProductId) {
      setError('Save the product first, then upload images.')
      return
    }

    if (files.length === 0) {
      setError('Please choose at least one image file.')
      return
    }

    setIsUploading(true)

    try {
      const parsedSortOrder = Number.parseInt(sortOrder.trim(), 10)
      const hasCustomSortOrder = !Number.isNaN(parsedSortOrder)

      for (const [index, file] of files.entries()) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('altText', altText)
        formData.append('isMain', isMain && index === 0 ? 'true' : 'false')

        if (hasCustomSortOrder) {
          formData.append('sortOrder', String(parsedSortOrder + index))
        }

        const response = await fetch(`/api/admin/products/${selectedProductId}/images`, {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          throw new Error(await readErrorMessage(response, 'Upload failed.'))
        }
      }

      setMessage(files.length === 1 ? 'Image uploaded successfully.' : `${files.length} images uploaded successfully.`)
      setFiles([])
      setAltText('')
      setIsMain(false)
      setSortOrder('')
      await refreshProductDetail(selectedProductId)
      await loadProducts(selectedProductId)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Unexpected upload error.')
    } finally {
      setIsUploading(false)
    }
  }

  async function handleSetMain(imageId: string) {
    setError('')
    setMessage('')
    setActiveImageId(imageId)

    try {
      const response = await fetch(`/api/admin/products/${selectedProductId}/images/${imageId}/set-main`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, 'Main image could not be updated.'))
      }

      await refreshProductDetail(selectedProductId)
      setMessage('Main image updated.')
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Unexpected action error.')
    } finally {
      setActiveImageId('')
    }
  }

  async function handleDeleteImage(imageId: string) {
    setError('')
    setMessage('')
    setActiveImageId(imageId)

    try {
      const response = await fetch(`/api/admin/products/${selectedProductId}/images/${imageId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, 'Image could not be deleted.'))
      }

      await refreshProductDetail(selectedProductId)
      setMessage('Image deleted.')
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Unexpected action error.')
    } finally {
      setActiveImageId('')
    }
  }

  async function handleSaveAltText(imageId: string) {
    setError('')
    setMessage('')
    setActiveImageId(imageId)

    try {
      const response = await fetch(`/api/admin/products/${selectedProductId}/images/${imageId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ altText: imageAltTexts[imageId] ?? '' }),
      })

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, 'Alt text could not be updated.'))
      }

      await refreshProductDetail(selectedProductId)
      setMessage('Alt text updated.')
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Unexpected action error.')
    } finally {
      setActiveImageId('')
    }
  }

  async function handleReorderImages(nextImageIds: string[]) {
    setError('')
    setMessage('')
    setActiveImageId('reorder')

    try {
      const response = await fetch(`/api/admin/products/${selectedProductId}/images/reorder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageIds: nextImageIds }),
      })

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, 'Image order could not be updated.'))
      }

      await refreshProductDetail(selectedProductId)
      setMessage('Image order updated.')
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : 'Unexpected action error.')
    } finally {
      setActiveImageId('')
      setDraggedImageId('')
      setDragOverImageId('')
    }
  }

  function handleImageAltTextChange(imageId: string, value: string) {
    setImageAltTexts((current) => ({
      ...current,
      [imageId]: value,
    }))
  }

  function handleDragStart(imageId: string) {
    setDraggedImageId(imageId)
  }

  function handleDragOver(event: DragEvent<HTMLElement>, imageId: string) {
    event.preventDefault()

    if (!draggedImageId || draggedImageId === imageId) {
      return
    }

    setDragOverImageId(imageId)
  }

  async function handleDrop(imageId: string) {
    if (!draggedImageId || draggedImageId === imageId) {
      setDraggedImageId('')
      setDragOverImageId('')
      return
    }

    const currentImageIds = sortedImages.map((image) => image.id)
    const draggedIndex = currentImageIds.indexOf(draggedImageId)
    const targetIndex = currentImageIds.indexOf(imageId)

    if (draggedIndex < 0 || targetIndex < 0) {
      setDraggedImageId('')
      setDragOverImageId('')
      return
    }

    const nextImageIds = [...currentImageIds]
    const [movedImageId] = nextImageIds.splice(draggedIndex, 1)
    nextImageIds.splice(targetIndex, 0, movedImageId)

    await handleReorderImages(nextImageIds)
  }

  return (
    <main className="admin-shell">
      <section className="admin-hero">
        <span className="admin-hero__eyebrow">Admin Catalog</span>
        <h1>Product Editor</h1>
        <p>Admin panelinden urun olustur, guncelle, varyantlarini duzenle, teknik alanlarini doldur ve kaydettikten sonra resimlerini yonet.</p>
      </section>

      <section className="admin-layout">
        <aside className="panel product-sidebar">
          <div className="panel__header panel__header--stacked">
            <div>
              <h2>Products</h2>
              <span>{products.length} total</span>
            </div>
            <button type="button" className="primary-button" onClick={startCreateProduct}>New product</button>
          </div>

          {isLoadingProducts ? <p>Loading products...</p> : null}

          <label className="field">
            <span>Select product</span>
            <select value={selectedProductId} onChange={(event) => setSelectedProductId(event.target.value)}>
              <option value="">Create new product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>{product.displayName}</option>
              ))}
            </select>
          </label>

          <div className="product-list">
            {products.map((product) => (
              <button
                key={product.id}
                type="button"
                className={`product-list__item${selectedProductId === product.id ? ' product-list__item--active' : ''}`}
                onClick={() => setSelectedProductId(product.id)}
              >
                <strong>{product.displayName}</strong>
                <span>{product.slug}</span>
                <small>{product.categoryName}</small>
              </button>
            ))}
          </div>
        </aside>

        <div className="editor-stack">
          <section className="panel">
            <div className="panel__header">
              <div>
                <h2>{isCreateMode ? 'Create product' : 'Edit product'}</h2>
                <span>{isCreateMode ? 'Yeni urun tanimi' : selectedProduct?.slug}</span>
              </div>
              {!isCreateMode ? (
                <button type="button" className="danger-button" onClick={handleDeleteProduct} disabled={isDeletingProduct || isSavingProduct}>
                  {isDeletingProduct ? 'Deleting...' : 'Delete product'}
                </button>
              ) : null}
            </div>

            <form className="product-form" onSubmit={handleSaveProduct}>
              <div className="form-section">
                <div className="form-section__header">
                  <h3>General</h3>
                </div>
                <div className="form-grid form-grid--general">
                  <label className="field">
                    <span>Category</span>
                    <select value={productForm.categoryId} onChange={(event) => updateProductField('categoryId', event.target.value)} disabled={isLoadingCategories}>
                      <option value="">Choose category</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>{category.displayName}</option>
                      ))}
                    </select>
                  </label>

                  <label className="field">
                    <span>Slug</span>
                    <input value={productForm.slug} onChange={(event) => updateProductField('slug', event.target.value)} placeholder="hamburger-box-with-logo" />
                  </label>

                  <label className="field">
                    <span>SKU root</span>
                    <input value={productForm.skuRoot} onChange={(event) => updateProductField('skuRoot', event.target.value)} placeholder="BURGER-LOGO" />
                  </label>

                  <label className="field">
                    <span>Product type</span>
                    <select value={productForm.productType} onChange={(event) => updateProductField('productType', event.target.value)}>
                      {productTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </label>

                  <label className="field">
                    <span>Min order quantity</span>
                    <input value={productForm.minOrderQuantity} onChange={(event) => updateProductField('minOrderQuantity', event.target.value)} inputMode="numeric" />
                  </label>

                  <label className="field">
                    <span>Max order quantity</span>
                    <input value={productForm.maxOrderQuantity} onChange={(event) => updateProductField('maxOrderQuantity', event.target.value)} inputMode="numeric" placeholder="Optional" />
                  </label>

                  <label className="field">
                    <span>Lead time days</span>
                    <input value={productForm.leadTimeDays} onChange={(event) => updateProductField('leadTimeDays', event.target.value)} inputMode="numeric" placeholder="Optional" />
                  </label>

                  <label className="field">
                    <span>Base VAT rate</span>
                    <input value={productForm.baseVatRate} onChange={(event) => updateProductField('baseVatRate', event.target.value)} inputMode="decimal" />
                  </label>

                  <label className="field">
                    <span>Weight grams</span>
                    <input value={productForm.weightGrams} onChange={(event) => updateProductField('weightGrams', event.target.value)} inputMode="decimal" placeholder="Optional" />
                  </label>

                  <label className="field">
                    <span>Origin country</span>
                    <input value={productForm.originCountry} onChange={(event) => updateProductField('originCountry', event.target.value)} maxLength={2} placeholder="TR" />
                  </label>

                  <label className="field field--full">
                    <span>Material summary</span>
                    <textarea value={productForm.materialSummary} onChange={(event) => updateProductField('materialSummary', event.target.value)} rows={3} placeholder="Corrugated kraft board, food-safe inner layer..." />
                  </label>
                </div>

                <div className="toggle-grid">
                  {[
                    ['isActive', 'Active'],
                    ['isFeatured', 'Featured'],
                    ['isCustomizable', 'Customizable'],
                    ['hasVariants', 'Has variants'],
                    ['requiresArtwork', 'Requires artwork'],
                    ['recyclable', 'Recyclable'],
                    ['foodSafe', 'Food safe'],
                  ].map(([fieldName, label]) => (
                    <label key={fieldName} className="checkbox-tile">
                      <input type="checkbox" checked={productForm[fieldName as keyof ProductFormState] as boolean} onChange={(event) => updateProductField(fieldName as keyof ProductFormState, event.target.checked as never)} />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-section">
                <div className="form-section__header">
                  <h3>Translations</h3>
                  <button type="button" className="secondary-button" onClick={addTranslation}>Add translation</button>
                </div>
                <div className="stack-list">
                  {productForm.translations.map((translation, index) => (
                    <div key={`${translation.languageCode}-${index}`} className="subform-card">
                      <div className="subform-card__header">
                        <strong>Translation #{index + 1}</strong>
                        {productForm.translations.length > 1 ? (
                          <button type="button" className="ghost-button" onClick={() => removeTranslation(index)}>Remove</button>
                        ) : null}
                      </div>
                      <div className="form-grid">
                        <label className="field">
                          <span>Language code</span>
                          <input value={translation.languageCode} onChange={(event) => updateTranslation(index, 'languageCode', event.target.value)} placeholder="en" />
                        </label>
                        <label className="field">
                          <span>Name</span>
                          <input value={translation.name} onChange={(event) => updateTranslation(index, 'name', event.target.value)} placeholder="Hamburger box" />
                        </label>
                        <label className="field field--full">
                          <span>Short description</span>
                          <textarea value={translation.shortDescription} onChange={(event) => updateTranslation(index, 'shortDescription', event.target.value)} rows={2} />
                        </label>
                        <label className="field field--full">
                          <span>Description</span>
                          <textarea value={translation.description} onChange={(event) => updateTranslation(index, 'description', event.target.value)} rows={4} />
                        </label>
                        <label className="field">
                          <span>SEO title</span>
                          <input value={translation.seoTitle} onChange={(event) => updateTranslation(index, 'seoTitle', event.target.value)} />
                        </label>
                        <label className="field">
                          <span>SEO description</span>
                          <input value={translation.seoDescription} onChange={(event) => updateTranslation(index, 'seoDescription', event.target.value)} />
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-section">
                <div className="form-section__header">
                  <h3>Variants</h3>
                  <button type="button" className="secondary-button" onClick={addVariant}>Add variant</button>
                </div>
                <div className="stack-list">
                  {productForm.variants.map((variant, index) => (
                    <div key={`${variant.sku}-${index}`} className="subform-card">
                      <div className="subform-card__header">
                        <strong>Variant #{index + 1}</strong>
                        {productForm.variants.length > 1 ? (
                          <button type="button" className="ghost-button" onClick={() => removeVariant(index)}>Remove</button>
                        ) : null}
                      </div>
                      <div className="form-grid">
                        <label className="field">
                          <span>SKU</span>
                          <input value={variant.sku} onChange={(event) => updateVariant(index, 'sku', event.target.value)} />
                        </label>
                        <label className="field">
                          <span>Barcode</span>
                          <input value={variant.barcode} onChange={(event) => updateVariant(index, 'barcode', event.target.value)} />
                        </label>
                        <label className="field">
                          <span>Price excl VAT</span>
                          <input value={variant.priceExclVat} onChange={(event) => updateVariant(index, 'priceExclVat', event.target.value)} inputMode="decimal" />
                        </label>
                        <label className="field">
                          <span>Compare at price</span>
                          <input value={variant.compareAtPriceExclVat} onChange={(event) => updateVariant(index, 'compareAtPriceExclVat', event.target.value)} inputMode="decimal" placeholder="Optional" />
                        </label>
                        <label className="field">
                          <span>Stock quantity</span>
                          <input value={variant.stockQuantity} onChange={(event) => updateVariant(index, 'stockQuantity', event.target.value)} inputMode="numeric" />
                        </label>
                        <label className="field">
                          <span>Reserved stock</span>
                          <input value={variant.reservedStockQuantity} onChange={(event) => updateVariant(index, 'reservedStockQuantity', event.target.value)} inputMode="numeric" />
                        </label>
                        <label className="field">
                          <span>Sort order</span>
                          <input value={variant.sortOrder} onChange={(event) => updateVariant(index, 'sortOrder', event.target.value)} inputMode="numeric" />
                        </label>
                        <label className="checkbox-field checkbox-field--compact">
                          <input type="checkbox" checked={variant.isActive} onChange={(event) => updateVariant(index, 'isActive', event.target.checked)} />
                          <span>Variant active</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-section">
                <div className="form-section__header">
                  <h3>Attributes</h3>
                  <button type="button" className="secondary-button" onClick={addAttribute}>Add attribute</button>
                </div>
                <div className="stack-list">
                  {productForm.attributes.length === 0 ? (
                    <div className="empty-state empty-state--compact">
                      <p>No attributes yet.</p>
                      <span>Add sector-specific technical or filter fields here.</span>
                    </div>
                  ) : null}

                  {productForm.attributes.map((attribute, index) => (
                    <div key={`${attribute.attributeKey}-${index}`} className="subform-card">
                      <div className="subform-card__header">
                        <strong>Attribute #{index + 1}</strong>
                        <button type="button" className="ghost-button" onClick={() => removeAttribute(index)}>Remove</button>
                      </div>
                      <div className="form-grid">
                        <label className="field">
                          <span>Key</span>
                          <input value={attribute.attributeKey} onChange={(event) => updateAttribute(index, 'attributeKey', event.target.value)} placeholder="size" />
                        </label>
                        <label className="field">
                          <span>Value</span>
                          <input value={attribute.attributeValue} onChange={(event) => updateAttribute(index, 'attributeValue', event.target.value)} placeholder="12 x 12 x 10 cm" />
                        </label>
                        <label className="field">
                          <span>Language code</span>
                          <input value={attribute.languageCode} onChange={(event) => updateAttribute(index, 'languageCode', event.target.value)} placeholder="en" />
                        </label>
                        <label className="field">
                          <span>Sort order</span>
                          <input value={attribute.sortOrder} onChange={(event) => updateAttribute(index, 'sortOrder', event.target.value)} inputMode="numeric" />
                        </label>
                        <label className="checkbox-field checkbox-field--compact">
                          <input type="checkbox" checked={attribute.isFilterable} onChange={(event) => updateAttribute(index, 'isFilterable', event.target.checked)} />
                          <span>Filterable</span>
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="primary-button" disabled={isSavingProduct || isDeletingProduct || isLoadingCategories}>
                  {isSavingProduct ? 'Saving...' : isCreateMode ? 'Create product' : 'Update product'}
                </button>
              </div>
            </form>

            {message ? <p className="message message--success">{message}</p> : null}
            {error ? <p className="message message--error">{error}</p> : null}
          </section>

          <section className="panel">
            <div className="panel__header">
              <div>
                <h2>Images</h2>
                <span>{selectedProductId ? `${sortedImages.length} files` : 'Save the product first'}</span>
              </div>
            </div>

            {!selectedProductId ? (
              <div className="empty-state">
                <p>Product has not been created yet.</p>
                <span>Once you save the product, image upload and ordering becomes available here.</span>
              </div>
            ) : (
              <>
                <form className="upload-form" onSubmit={handleUpload}>
                  <label className="field">
                    <span>Image files</span>
                    <input
                      ref={fileInputRef}
                      id="product-image-file"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(event: ChangeEvent<HTMLInputElement>) => setFiles(Array.from(event.target.files ?? []))}
                    />
                    <small className="field-hint">You can select multiple files. Shared alt text below will be applied to each upload and can be edited later per image.</small>
                  </label>

                  <label className="field">
                    <span>Shared alt text</span>
                    <input value={altText} onChange={(event) => setAltText(event.target.value)} placeholder="Printed hamburger box" />
                  </label>

                  <label className="field">
                    <span>Start sort order</span>
                    <input value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} inputMode="numeric" placeholder="Auto" />
                  </label>

                  <label className="checkbox-field">
                    <input type="checkbox" checked={isMain} onChange={(event) => setIsMain(event.target.checked)} />
                    <span>Use first uploaded file as main image</span>
                  </label>

                  <button className="primary-button" type="submit" disabled={isUploading}>
                    {isUploading ? 'Uploading...' : files.length > 1 ? `Upload ${files.length} images` : 'Upload image'}
                  </button>
                </form>

                {sortedImages.length === 0 ? (
                  <div className="empty-state empty-state--compact">
                    <p>No images uploaded yet.</p>
                    <span>The first uploaded image can become the main image automatically.</span>
                  </div>
                ) : (
                  <div className="image-grid">
                    {sortedImages.map((image) => (
                      <article
                        className={`image-card${draggedImageId === image.id ? ' image-card--dragging' : ''}${dragOverImageId === image.id ? ' image-card--drag-over' : ''}`}
                        key={image.id}
                        draggable
                        onDragStart={() => handleDragStart(image.id)}
                        onDragOver={(event) => handleDragOver(event, image.id)}
                        onDrop={() => void handleDrop(image.id)}
                        onDragEnd={() => {
                          setDraggedImageId('')
                          setDragOverImageId('')
                        }}
                      >
                        <img src={image.url} alt={image.altText || 'Product image'} />
                        <div className="image-card__meta">
                          <div className="image-card__heading">
                            <strong>{image.altText || 'No alt text'}</strong>
                            <span className="drag-label">Drag to reorder</span>
                          </div>
                          <span>Sort: {image.sortOrder}</span>
                          {image.isMain ? <span className="badge">Main</span> : null}
                          <label className="field image-card__field">
                            <span>Alt text</span>
                            <input
                              value={imageAltTexts[image.id] ?? ''}
                              onChange={(event) => handleImageAltTextChange(image.id, event.target.value)}
                              placeholder="Describe the image"
                            />
                          </label>
                          <div className="image-card__actions">
                            <button type="button" className="secondary-button" onClick={() => void handleSaveAltText(image.id)} disabled={activeImageId === image.id || activeImageId === 'reorder'}>
                              Save alt text
                            </button>
                            {!image.isMain ? (
                              <button type="button" className="secondary-button" onClick={() => void handleSetMain(image.id)} disabled={activeImageId === image.id || activeImageId === 'reorder'}>
                                Set as main
                              </button>
                            ) : null}
                            <button type="button" className="danger-button" onClick={() => void handleDeleteImage(image.id)} disabled={activeImageId === image.id || activeImageId === 'reorder'}>
                              Delete
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </section>
    </main>
  )
}

export default ProductsPage