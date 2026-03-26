import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { normalizeStorefrontLanguageCode } from './locales'
import { deTranslation, enTranslation, frTranslation, lbTranslation, trTranslation } from './translations'

const resources = {
  de: {
    translation: deTranslation,
  },
  en: {
    translation: enTranslation,
  },
  fr: {
    translation: frTranslation,
  },
  lb: {
    translation: lbTranslation,
  },
  tr: {
    translation: trTranslation,
  },
} as const

const savedLanguage = normalizeStorefrontLanguageCode(window.localStorage.getItem('storefront-language'))

void i18n.use(initReactI18next).init({
  resources,
  lng: savedLanguage,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
})

i18n.on('languageChanged', (language) => {
  const normalizedLanguage = normalizeStorefrontLanguageCode(language)

  window.localStorage.setItem('storefront-language', normalizedLanguage)
  document.documentElement.lang = normalizedLanguage
})

document.documentElement.lang = savedLanguage

export default i18n