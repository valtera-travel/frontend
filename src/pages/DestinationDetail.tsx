import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { api } from '../services/api'
import { useAsync } from '../hooks/useAsync'
import { useLang } from '../hooks/useLang'
import PackageCard from '../components/PackageCard'
import { Empty, ErrorState, Loading } from '../components/State'

export default function DestinationDetailPage() {
  const { id } = useParams()
  const { t } = useTranslation()
  const { lang } = useLang()
  const dest = useAsync(() => api.getDestination(Number(id), lang), [id, lang])
  const pkgs = useAsync(() => api.getPackages({ lang, destinationId: Number(id), size: 50, sort: 'inquiries_desc' }), [id, lang])

  if (dest.loading) return <Loading />
  if (dest.error || !dest.data) return <div className="mx-auto max-w-3xl px-5 py-24"><ErrorState message={dest.error?.message || t('detail.notFound')} onRetry={dest.reload} /></div>
  const d = dest.data

  return (
    <>
      <section className="relative">
        <img src={d.imageUrl} alt={d.name} className="h-80 w-full object-cover md:h-96" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-ink/10" />
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-7xl px-5 pb-10 text-white">
          <p className="text-sm uppercase tracking-widest text-white/80">{d.region}</p>
          <h1 className="text-5xl font-semibold md:text-6xl">{d.name}</h1>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-5 py-12">
        <Link to="/destinations" className="text-sm font-semibold text-sea hover:underline">← {t('common.back')}</Link>
        <p className="mt-4 max-w-3xl text-lg text-ink/75">{d.description}</p>
        <h2 className="mt-12 text-3xl font-semibold">{t('detail.packagesInDestination')}</h2>
        <div className="mt-8">
          {pkgs.loading ? <Loading /> : pkgs.error ? <ErrorState onRetry={pkgs.reload} /> : pkgs.data!.content.length === 0 ? <Empty title={t('packages.emptyTitle')} /> : (
            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">{pkgs.data!.content.map((p) => <PackageCard key={p.id} p={p} />)}</div>
          )}
        </div>
      </section>
    </>
  )
}
