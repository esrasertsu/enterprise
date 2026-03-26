import { useEffect, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { useAdminI18n } from '../lib/adminI18n'
import { getLanguageLabel, getNextTranslationLanguageCode, renderLanguageOptions, translationLanguageOptions } from '../lib/translationLanguages'
import type {
  AdminCategoryDetail,
  AdminCategoryOption,
  AdminCategoryTranslation,
  CategoryFormState,
  CategoryTranslationForm,
  CreatedCategoryResponse,
} from '../types/admin'

function createEmptyTranslation(languageCode = 'en'): CategoryTranslationForm {
  return {
    languageCode,
    name: '',
    description: '',
    seoTitle: '',
    seoDescription: '',
  }
}

function createDefaultTranslations(): CategoryTranslationForm[] {
  return translationLanguageOptions.map((option) => createEmptyTranslation(option.value))
}

function mergeTranslationsWithDefaults(translations: AdminCategoryTranslation[] | undefined): CategoryTranslationForm[] {
  const existingTranslations = translations ?? []
  const existingByLanguageCode = new Map(
    existingTranslations.map((translation) => [translation.languageCode.trim().toLowerCase(), translation]),
  )

  const mergedTranslations = translationLanguageOptions.map((option) => {
    const existingTranslation = existingByLanguageCode.get(option.value)

    return {
      languageCode: option.value,
      name: existingTranslation?.name ?? '',
      description: existingTranslation?.description ?? '',
      seoTitle: existingTranslation?.seoTitle ?? '',
      seoDescription: existingTranslation?.seoDescription ?? '',
    }
  })

  const customTranslations = existingTranslations
    .filter((translation) => !translationLanguageOptions.some((option) => option.value === translation.languageCode.trim().toLowerCase()))
    .map((translation) => ({
      languageCode: translation.languageCode ?? '',
      name: translation.name ?? '',
      description: translation.description ?? '',
      seoTitle: translation.seoTitle ?? '',
      seoDescription: translation.seoDescription ?? '',
    }))

  return [...mergedTranslations, ...customTranslations]
}

function createEmptyCategoryForm(): CategoryFormState {
  return {
    parentCategoryId: '',
    slug: '',
    isActive: true,
    sortOrder: '0',
    imageUrl: '',
    translations: createDefaultTranslations(),
  }
}

function mapCategoryDetailToForm(category: AdminCategoryDetail): CategoryFormState {
  return {
    parentCategoryId: category.parentCategoryId ?? '',
    slug: category.slug ?? '',
    isActive: Boolean(category.isActive),
    sortOrder: String(category.sortOrder ?? 0),
    imageUrl: category.imageUrl ?? '',
    translations: mergeTranslationsWithDefaults(category.translations),
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

function buildCategoryPayload(form: CategoryFormState) {
  return {
    parentCategoryId: normalizeOptionalString(form.parentCategoryId),
    slug: form.slug.trim(),
    isActive: form.isActive,
    sortOrder: parseInteger(form.sortOrder, 0),
    imageUrl: normalizeOptionalString(form.imageUrl),
    translations: form.translations.map((translation) => ({
      languageCode: translation.languageCode.trim(),
      name: translation.name.trim(),
      description: normalizeOptionalString(translation.description),
      seoTitle: normalizeOptionalString(translation.seoTitle),
      seoDescription: normalizeOptionalString(translation.seoDescription),
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

function CategoriesPage() {
  const { t } = useAdminI18n()
  const [categories, setCategories] = useState<AdminCategoryOption[]>([])
  const [selectedCategoryId, setSelectedCategoryId] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<AdminCategoryDetail | null>(null)
  const [categoryForm, setCategoryForm] = useState<CategoryFormState>(createEmptyCategoryForm)
  const [isLoadingCategories, setIsLoadingCategories] = useState(true)
  const [isSavingCategory, setIsSavingCategory] = useState(false)
  const [isDeletingCategory, setIsDeletingCategory] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isDeletingImage, setIsDeletingImage] = useState(false)
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const imageInputRef = useRef<HTMLInputElement | null>(null)

  const isCreateMode = !selectedCategoryId

  useEffect(() => {
    void loadCategories()
  }, [])

  useEffect(() => {
    if (!selectedCategoryId) {
      setSelectedCategory(null)
      setCategoryForm(createEmptyCategoryForm())
      return
    }

    async function loadCategoryDetail() {
      setError('')

      try {
        const response = await fetch(`/api/admin/categories/${selectedCategoryId}`)
        if (!response.ok) {
          throw new Error('Category detail could not be loaded.')
        }

        const data = (await response.json()) as AdminCategoryDetail
        setSelectedCategory(data)
        setCategoryForm(mapCategoryDetailToForm(data))
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Unexpected error while loading category detail.')
      }
    }

    void loadCategoryDetail()
  }, [selectedCategoryId])

  async function loadCategories(preferredCategoryId: string | null = null): Promise<AdminCategoryOption[]> {
    setIsLoadingCategories(true)

    try {
      const response = await fetch('/api/admin/categories')
      if (!response.ok) {
        throw new Error('Categories could not be loaded.')
      }

      const data = (await response.json()) as AdminCategoryOption[]
      setCategories(data)

      if (preferredCategoryId) {
        setSelectedCategoryId(preferredCategoryId)
      }

      return data
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unexpected error while loading categories.')
      return []
    } finally {
      setIsLoadingCategories(false)
    }
  }

  async function refreshCategoryDetail(categoryId: string) {
    const response = await fetch(`/api/admin/categories/${categoryId}`)
    if (!response.ok) {
      throw new Error('Category detail could not be loaded.')
    }

    const data = (await response.json()) as AdminCategoryDetail
    setSelectedCategory(data)
    setCategoryForm(mapCategoryDetailToForm(data))
  }

  function updateCategoryField<K extends keyof CategoryFormState>(fieldName: K, value: CategoryFormState[K]) {
    setCategoryForm((current) => ({
      ...current,
      [fieldName]: value,
    }))
  }

  function updateTranslation(index: number, fieldName: keyof CategoryTranslationForm, value: string) {
    setCategoryForm((current) => ({
      ...current,
      translations: current.translations.map((translation, translationIndex) => (
        translationIndex === index ? { ...translation, [fieldName]: value } : translation
      )),
    }))
  }

  function addTranslation() {
    setCategoryForm((current) => ({
      ...current,
      translations: [...current.translations, createEmptyTranslation(getNextTranslationLanguageCode(current.translations))],
    }))
  }

  function removeTranslation(index: number) {
    setCategoryForm((current) => ({
      ...current,
      translations: current.translations.filter((_, translationIndex) => translationIndex !== index),
    }))
  }

  function startCreateCategory() {
    setSelectedCategoryId('')
    setSelectedCategory(null)
    setCategoryForm(createEmptyCategoryForm())
    setSelectedImageFile(null)
    setMessage('')
    setError('')
  }

  async function handleSaveCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')
    setIsSavingCategory(true)

    try {
      const payload = buildCategoryPayload(categoryForm)
      const isUpdating = Boolean(selectedCategoryId)
      const response = await fetch(isUpdating ? `/api/admin/categories/${selectedCategoryId}` : '/api/admin/categories', {
        method: isUpdating ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, 'Category could not be saved.'))
      }

      if (isUpdating) {
        await Promise.all([refreshCategoryDetail(selectedCategoryId), loadCategories(selectedCategoryId)])
        setMessage('Category updated.')
      } else {
        const created = (await response.json()) as CreatedCategoryResponse
        await loadCategories(created.id)
        setMessage('Category created.')
      }
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unexpected save error.')
    } finally {
      setIsSavingCategory(false)
    }
  }

  async function handleDeleteCategory() {
    if (!selectedCategoryId || !window.confirm(t('categories.deleteConfirm'))) {
      return
    }

    setError('')
    setMessage('')
    setIsDeletingCategory(true)

    try {
      const response = await fetch(`/api/admin/categories/${selectedCategoryId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, 'Category could not be deleted.'))
      }

      setSelectedCategoryId('')
      setSelectedCategory(null)
      setCategoryForm(createEmptyCategoryForm())
      setSelectedImageFile(null)
      if (imageInputRef.current) {
        imageInputRef.current.value = ''
      }
      await loadCategories()
      setMessage('Category deleted.')
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unexpected delete error.')
    } finally {
      setIsDeletingCategory(false)
    }
  }

  async function handleUploadImage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!selectedCategoryId) {
      setError('Save the category first, then upload an image.')
      return
    }

    if (!selectedImageFile) {
      setError('Choose an image file to upload.')
      return
    }

    setIsUploadingImage(true)

    try {
      const formData = new FormData()
      formData.append('file', selectedImageFile)

      const response = await fetch(`/api/admin/categories/${selectedCategoryId}/image`, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, 'Image could not be uploaded.'))
      }

      await Promise.all([refreshCategoryDetail(selectedCategoryId), loadCategories(selectedCategoryId)])
      setSelectedImageFile(null)
      if (imageInputRef.current) {
        imageInputRef.current.value = ''
      }
      setMessage('Category image uploaded.')
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Unexpected upload error.')
    } finally {
      setIsUploadingImage(false)
    }
  }

  async function handleDeleteImage() {
    if (!selectedCategoryId) {
      return
    }

    setError('')
    setMessage('')
    setIsDeletingImage(true)

    try {
      const response = await fetch(`/api/admin/categories/${selectedCategoryId}/image`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, 'Image could not be deleted.'))
      }

      await Promise.all([refreshCategoryDetail(selectedCategoryId), loadCategories(selectedCategoryId)])
      setMessage('Category image removed.')
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : 'Unexpected delete error.')
    } finally {
      setIsDeletingImage(false)
    }
  }

  const usedTranslationLanguages = new Set(
    categoryForm.translations
      .map((translation) => translation.languageCode.trim().toLowerCase())
      .filter(Boolean),
  )

  return (
    <main className="admin-shell">
      <section className="admin-hero">
        <span className="admin-hero__eyebrow">{t('categories.heroEyebrow')}</span>
        <h1>{t('categories.heroTitle')}</h1>
        <p>{t('categories.heroDescription')}</p>
      </section>

      <section className="admin-layout">
        <aside className="panel product-sidebar">
          <div className="panel__header panel__header--stacked">
            <div>
              <h2>{t('categories.listTitle')}</h2>
              <span>{categories.length} total</span>
            </div>
            <button type="button" className="primary-button" onClick={startCreateCategory}>{t('categories.new')}</button>
          </div>

          {isLoadingCategories ? <p>Loading categories...</p> : null}

          <label className="field">
            <span>{t('categories.select')}</span>
            <select value={selectedCategoryId} onChange={(event) => setSelectedCategoryId(event.target.value)}>
              <option value="">{t('categories.create')}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.displayName}</option>
              ))}
            </select>
          </label>

          <div className="product-list">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                className={`product-list__item${selectedCategoryId === category.id ? ' product-list__item--active' : ''}`}
                onClick={() => setSelectedCategoryId(category.id)}
              >
                <strong>{category.displayName}</strong>
                <span>{category.slug}</span>
                <small>{category.isActive ? 'Active' : 'Inactive'}</small>
              </button>
            ))}
          </div>
        </aside>

        <div className="editor-stack">
          <section className="panel">
            <div className="panel__header">
              <div>
                <h2>{isCreateMode ? t('categories.create') : t('categories.edit')}</h2>
                <span>{isCreateMode ? t('categories.createSubtitle') : selectedCategory?.slug}</span>
              </div>
              {!isCreateMode ? (
                <button type="button" className="danger-button" onClick={handleDeleteCategory} disabled={isSavingCategory || isDeletingCategory}>
                  {isDeletingCategory ? 'Deleting...' : t('categories.delete')}
                </button>
              ) : null}
            </div>

            <form className="product-form" onSubmit={handleSaveCategory}>
              <div className="form-section">
                <div className="form-section__header">
                  <h3>{t('categories.general')}</h3>
                </div>
                <div className="form-grid form-grid--general">
                  <label className="field">
                    <span>Parent category</span>
                    <select value={categoryForm.parentCategoryId} onChange={(event) => updateCategoryField('parentCategoryId', event.target.value)}>
                      <option value="">Root category</option>
                      {categories
                        .filter((category) => category.id !== selectedCategoryId)
                        .map((category) => (
                          <option key={category.id} value={category.id}>{category.displayName}</option>
                        ))}
                    </select>
                  </label>

                  <label className="field">
                    <span>Slug</span>
                    <input value={categoryForm.slug} onChange={(event) => updateCategoryField('slug', event.target.value)} placeholder="burger-boxes" />
                  </label>

                  <label className="field">
                    <span>Sort order</span>
                    <input value={categoryForm.sortOrder} onChange={(event) => updateCategoryField('sortOrder', event.target.value)} inputMode="numeric" />
                  </label>
                </div>

                <div className="toggle-grid">
                  <label className="checkbox-tile">
                    <input type="checkbox" checked={categoryForm.isActive} onChange={(event) => updateCategoryField('isActive', event.target.checked)} />
                    <span>Active</span>
                  </label>
                </div>
              </div>

              <div className="form-section">
                <div className="form-section__header">
                  <h3>{t('categories.translations')}</h3>
                  <button type="button" className="secondary-button" onClick={addTranslation}>{t('categories.addTranslation')}</button>
                </div>
                <div className="stack-list">
                  {categoryForm.translations.map((translation, index) => (
                    <div key={`${translation.languageCode}-${index}`} className="subform-card">
                      <div className="subform-card__header">
                        <strong>{translation.languageCode ? getLanguageLabel(translation.languageCode.trim().toLowerCase()) : `Translation #${index + 1}`}</strong>
                        {categoryForm.translations.length > 1 ? (
                          <button type="button" className="ghost-button" onClick={() => removeTranslation(index)}>Remove</button>
                        ) : null}
                      </div>
                      <div className="form-grid">
                        <label className="field">
                          <span>Language code</span>
                          <select value={translation.languageCode} onChange={(event) => updateTranslation(index, 'languageCode', event.target.value)}>
                            {renderLanguageOptions(translation.languageCode, usedTranslationLanguages)}
                          </select>
                        </label>
                        <label className="field">
                          <span>Name</span>
                          <input value={translation.name} onChange={(event) => updateTranslation(index, 'name', event.target.value)} placeholder="Burger boxes" />
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

              <div className="form-actions">
                <button type="submit" className="primary-button" disabled={isSavingCategory || isDeletingCategory || isLoadingCategories}>
                  {isSavingCategory ? 'Saving...' : isCreateMode ? t('categories.createAction') : t('categories.updateAction')}
                </button>
              </div>
            </form>

            {message ? <p className="message message--success">{message}</p> : null}
            {error ? <p className="message message--error">{error}</p> : null}
          </section>

          <section className="panel">
            <div className="panel__header">
              <div>
                <h2>{t('categories.images')}</h2>
                <span>{selectedCategoryId ? (categoryForm.imageUrl ? '1 file' : '0 files') : 'Save the category first'}</span>
              </div>
            </div>

            {!selectedCategoryId ? (
              <div className="empty-state">
                <p>{t('categories.emptyImage')}</p>
                <span>{t('categories.emptyImageHint')}</span>
              </div>
            ) : (
              <>
                <form className="upload-form" onSubmit={handleUploadImage}>
                  <label className="field">
                    <span>{t('categories.images')}</span>
                    <input
                      ref={imageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(event: ChangeEvent<HTMLInputElement>) => setSelectedImageFile(event.target.files?.[0] ?? null)}
                    />
                    <small className="field-hint">{selectedImageFile ? selectedImageFile.name : t('categories.emptyImageHint')}</small>
                  </label>

                  <button className="primary-button" type="submit" disabled={isUploadingImage}>
                    {isUploadingImage ? 'Uploading...' : categoryForm.imageUrl ? t('categories.replaceImage') : t('categories.upload')}
                  </button>
                </form>

                {categoryForm.imageUrl ? (
                  <div className="image-grid image-grid--single">
                    <article className="image-card image-card--single">
                      <img src={categoryForm.imageUrl} alt={selectedCategory?.slug ?? 'Category image'} />
                      <div className="image-card__meta">
                        <div className="image-card__heading">
                          <strong>{selectedCategory?.slug ?? 'Category image'}</strong>
                        </div>
                        <span>{categoryForm.imageUrl}</span>
                        <button type="button" className="ghost-button" onClick={handleDeleteImage} disabled={isDeletingImage}>
                          {isDeletingImage ? 'Removing...' : t('categories.removeImage')}
                        </button>
                      </div>
                    </article>
                  </div>
                ) : (
                  <div className="empty-state empty-state--compact">
                    <p>{t('categories.emptyImage')}</p>
                    <span>{t('categories.emptyImageHint')}</span>
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

export default CategoriesPage