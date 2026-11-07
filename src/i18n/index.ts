import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import id from './locales/id/translation.json'
import en from './locales/en/translation.json'

export type Lang = 'id' | 'en'
export const SUPPORTED: Lang[] = ['id', 'en']
const KEY = 'valtera.lang'

// Pilihan bahasa disimpan di browser; jika tidak ada / tidak valid -> Bahasa Indonesia (SRS FR-06)
function initialLang(): Lang {
  try {
    const saved = localStorage.getItem(KEY)
    return SUPPORTED.includes(saved as Lang) ? (saved as Lang) : 'id'
  } catch {
    return 'id'
  }
}

i18n.use(initReactI18next).init({
  resources: { id: { translation: id }, en: { translation: en } },
  lng: initialLang(),
  fallbackLng: 'id',
  supportedLngs: SUPPORTED,
  returnObjects: true,
  interpolation: { escapeValue: false },
})

i18n.on('languageChanged', (lng) => {
  try { localStorage.setItem(KEY, lng) } catch { /* ignore */ }
  document.documentElement.lang = lng
})
document.documentElement.lang = i18n.language

export default i18n
