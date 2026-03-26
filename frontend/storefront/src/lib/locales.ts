export const storefrontLanguageOptions = [
  {
    value: 'en',
    shortLabel: 'EN',
    label: 'English',
    numberLocale: 'en-GB',
    dateLocale: 'en-GB',
    leadTimeLabel: 'days',
  },
  {
    value: 'tr',
    shortLabel: 'TR',
    label: 'Turkce',
    numberLocale: 'tr-TR',
    dateLocale: 'tr-TR',
    leadTimeLabel: 'gun',
  },
  {
    value: 'fr',
    shortLabel: 'FR',
    label: 'Francais',
    numberLocale: 'fr-FR',
    dateLocale: 'fr-FR',
    leadTimeLabel: 'jours',
  },
  {
    value: 'de',
    shortLabel: 'DE',
    label: 'Deutsch',
    numberLocale: 'de-DE',
    dateLocale: 'de-DE',
    leadTimeLabel: 'Tage',
  },
  {
    value: 'lb',
    shortLabel: 'LB',
    label: 'Lebuergesch',
    numberLocale: 'lb-LU',
    dateLocale: 'lb-LU',
    leadTimeLabel: 'Deeg',
  },
] as const

export type StorefrontLanguageCode = (typeof storefrontLanguageOptions)[number]['value']

const storefrontLocaleMap = Object.fromEntries(
  storefrontLanguageOptions.map((option) => [option.value, option]),
) as Record<StorefrontLanguageCode, (typeof storefrontLanguageOptions)[number]>

export function isSupportedStorefrontLanguageCode(languageCode: string | null | undefined): languageCode is StorefrontLanguageCode {
  return Object.prototype.hasOwnProperty.call(storefrontLocaleMap, languageCode ?? '')
}

export function normalizeStorefrontLanguageCode(languageCode: string | null | undefined): StorefrontLanguageCode {
  const normalizedLanguageCode = languageCode?.trim().toLowerCase().split('-')[0]

  return isSupportedStorefrontLanguageCode(normalizedLanguageCode) ? normalizedLanguageCode : 'en'
}

export function resolveNumberLocale(languageCode: string): string {
  return storefrontLocaleMap[normalizeStorefrontLanguageCode(languageCode)].numberLocale
}

export function resolveDateLocale(languageCode: string): string {
  return storefrontLocaleMap[normalizeStorefrontLanguageCode(languageCode)].dateLocale
}

export function resolveLeadTimeLabel(languageCode: string): string {
  return storefrontLocaleMap[normalizeStorefrontLanguageCode(languageCode)].leadTimeLabel
}