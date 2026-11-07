import { useTranslation } from 'react-i18next'
import { USE_MOCK } from '../services/dash'

// Penanda jelas bahwa data berasal dari mock di browser, bukan dari PostgreSQL.
export default function DemoBanner() {
  const { t } = useTranslation()
  if (!USE_MOCK) return null
  return <div role="note" className="fixed bottom-3 left-3 z-[60] rounded-full bg-ink/90 px-3 py-1.5 text-xs font-semibold text-white shadow-lg">{t('demoBanner')}</div>
}
