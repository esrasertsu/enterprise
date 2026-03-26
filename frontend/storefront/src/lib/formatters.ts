type Translate = (key: string) => string

export function formatCurrency(value: number | null | undefined, languageCode: string): string | null {
  if (value === null || value === undefined) {
    return null
  }

  const locale = languageCode === 'tr' ? 'tr-TR' : 'en-GB'

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatLeadTime(days: number | null | undefined, languageCode: string): string | null {
  if (!days) {
    return null
  }

  return languageCode === 'tr' ? `${days} gun` : `${days} days`
}

export function formatProductType(productType: number | string, t: Translate): string {
  if (productType === 2 || productType === 'CustomPrinted') {
    return t('product.customPrinted')
  }

  return t('product.standard')
}