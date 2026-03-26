import type { ReactNode } from 'react'

export const translationLanguageOptions = [
  { value: 'en', label: 'English (EN)' },
  { value: 'tr', label: 'Turkish (TR)' },
  { value: 'fr', label: 'French (FR)' },
  { value: 'de', label: 'German (DE)' },
  { value: 'lb', label: 'Luxembourgish (LB)' },
] as const

export function getLanguageLabel(languageCode: string): string {
  return translationLanguageOptions.find((option) => option.value === languageCode)?.label ?? languageCode.toUpperCase()
}

export function getNextTranslationLanguageCode<T extends { languageCode: string }>(translations: T[]): string {
  return translationLanguageOptions.find((option) => !translations.some((translation) => translation.languageCode === option.value))?.value ?? ''
}

export function renderLanguageOptions(currentValue: string, usedLanguageCodes: Set<string>, allowBlank = false): ReactNode {
  const normalizedCurrentValue = currentValue.trim().toLowerCase()

  return (
    <>
      {allowBlank ? <option value="">Generic / no locale</option> : <option value="">Choose language</option>}
      {translationLanguageOptions.map((option) => {
        const isUsedByAnotherTranslation = option.value !== normalizedCurrentValue && usedLanguageCodes.has(option.value)

        return (
          <option key={option.value} value={option.value} disabled={!allowBlank && isUsedByAnotherTranslation}>
            {option.label}
          </option>
        )
      })}
      {normalizedCurrentValue && !translationLanguageOptions.some((option) => option.value === normalizedCurrentValue) ? (
        <option value={normalizedCurrentValue}>{normalizedCurrentValue.toUpperCase()} (custom)</option>
      ) : null}
    </>
  )
}