import { useTranslation } from 'react-i18next'
import type { Lang } from '../types/api'

export function useLang() {
  const { i18n } = useTranslation()
  const lang: Lang = i18n.language === 'en' ? 'en' : 'id'
  return { lang, setLang: (l: Lang) => { void i18n.changeLanguage(l) } }
}
