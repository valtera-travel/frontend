import { useTranslation } from 'react-i18next'
import { api } from '../services/api'
import { useAsync } from '../hooks/useAsync'
import { useLang } from '../hooks/useLang'
import DestinationCard from '../components/DestinationCard'
import { Empty, ErrorState, Loading } from '../components/State'

export default function Destinations() {
  const { t } = useTranslation()
  const { lang } = useLang()
  const { data, loading, error, reload } = useAsync(() => api.getDestinations(lang), [lang])
  return (
    <section className="mx-auto max-w-7xl px-5 py-12 md:py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-coral">{t('destinations.kicker')}</p>
      <h1 className="mt-2 text-4xl font-semibold md:text-5xl">{t('destinations.title')}</h1>
      <div className="mt-10">
        {loading ? <Loading /> : error ? <ErrorState message={error.message} onRetry={reload} /> : data!.length === 0 ? <Empty title={t('destinations.empty')} /> : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{data!.map((d) => <DestinationCard key={d.id} d={d} />)}</div>
        )}
      </div>
    </section>
  )
}
