import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { api } from '../services/api'
import { useAsync } from '../hooks/useAsync'
import { useLang } from '../hooks/useLang'
import { formatDate, formatPrice } from '../utils/format'
import { ErrorState, Loading } from '../components/State'

export default function PackageDetailPage() {
  const { id } = useParams()
  const { t } = useTranslation()
  const { lang } = useLang()
  const { data: p, loading, error, reload } = useAsync(() => api.getPackage(Number(id), lang), [id, lang])

  if (loading) return <Loading />
  if (error || !p) return <div className="mx-auto max-w-3xl px-5 py-24"><ErrorState message={error?.message || t('detail.notFound')} onRetry={reload} /></div>

  return (
    <article className="mx-auto max-w-7xl px-5 py-10 md:py-14">
      <Link to="/packages" className="text-sm font-semibold text-sea hover:underline">← {t('common.back')}</Link>
      <div className="mt-6 grid gap-10 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <img src={p.imageUrl} alt={p.name} className="aspect-[16/10] w-full rounded-3xl object-cover" />
          <p className="mt-8 text-sm text-ink/60">
            <Link to={`/destinations/${p.destinationId}`} className="hover:underline">{p.destinationName}, {p.region}</Link> · {t('duration', { count: p.durationDays })}
          </p>
          <h1 className="mt-1 text-4xl font-semibold md:text-5xl">{p.name}</h1>

          <h2 className="mt-8 text-2xl font-semibold">{t('detail.about')}</h2>
          <p className="mt-2 text-ink/75">{p.description}</p>
          <h2 className="mt-8 text-2xl font-semibold">{t('detail.highlights')}</h2>
          <p className="mt-2 text-ink/75">{p.highlights}</p>

          <h2 className="mt-8 text-2xl font-semibold">{t('detail.inclusions')}</h2>
          {p.inclusions.length === 0 ? <p className="mt-2 text-ink/60">{t('detail.noInclusions')}</p> : (
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {p.inclusions.map((i) => (
                <li key={i.id} className="flex gap-3 rounded-2xl bg-white p-4">
                  <svg className="mt-1 shrink-0" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0f6b6e" strokeWidth="3"><path d="M5 13l4 4L19 7" /></svg>
                  <div><p className="font-semibold">{i.itemName}</p>{i.description && <p className="text-sm text-ink/60">{i.description}</p>}</div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <aside className="h-fit rounded-3xl bg-white p-8 shadow-xl shadow-ink/5 lg:sticky lg:top-6">
          <p className="text-xs text-ink/50">{t('common.pricePerPerson')}</p>
          <p className="text-3xl font-bold text-sea">{formatPrice(p.pricePerPerson, lang)}</p>
          <Link to={`/inquiry?packageId=${p.id}`} className="mt-6 block rounded-xl bg-coral py-3.5 text-center font-semibold text-white hover:brightness-95">{t('detail.inquire')}</Link>

          <h2 className="mt-8 text-xl font-semibold">{t('detail.schedules')}</h2>
          {p.schedules.length === 0 ? <p className="mt-2 text-sm text-ink/60">{t('detail.noSchedules')}</p> : (
            <ul className="mt-3 divide-y divide-ink/10">
              {p.schedules.map((s) => (
                <li key={s.id} className="py-3 text-sm">
                  <p><span className="text-ink/50">{t('detail.departure')}:</span> <b>{formatDate(s.departureDate, lang)}</b></p>
                  <p><span className="text-ink/50">{t('detail.return')}:</span> {formatDate(s.returnDate, lang)}</p>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>
    </article>
  )
}
