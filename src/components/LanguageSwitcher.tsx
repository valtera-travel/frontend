import { useTranslation } from 'react-i18next'
import { useLang } from '../hooks/useLang'

export default function LanguageSwitcher({ dark = false }: { dark?: boolean }) {
  const { t } = useTranslation()
  const { lang, setLang } = useLang()
  return (
    <div role="group" aria-label={t('language')} className={`inline-flex rounded-full p-1 text-xs font-bold ${dark ? 'bg-white/15' : 'bg-ink/5'}`}>
      {(['id', 'en'] as const).map((l) => (
        <button key={l} type="button" aria-pressed={lang === l} onClick={() => setLang(l)}
          className={`rounded-full px-3 py-1.5 uppercase transition ${lang === l ? 'bg-white text-ink shadow-sm' : dark ? 'text-white/80 hover:text-white' : 'text-ink/60 hover:text-ink'}`}>
          {l}
        </button>
      ))}
    </div>
  )
}
