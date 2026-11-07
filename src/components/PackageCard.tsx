import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import type { PackageSummary } from '../types/api'
import { useLang } from '../hooks/useLang'
import { formatPrice } from '../utils/format'

export default function PackageCard({ p }: { p: PackageSummary }) {
  const { t } = useTranslation()
  const { lang } = useLang()
  return (
    <article className="group overflow-hidden rounded-3xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <Link to={`/packages/${p.id}`} className="relative block aspect-[4/3] overflow-hidden">
        <img src={p.imageUrl} alt={p.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-bold">{t('duration', { count: p.durationDays })}</span>
      </Link>
      <div className="p-6">
        <p className="text-sm text-ink/60">{p.destinationName}, {p.region}</p>
        <h3 className="mt-2 text-2xl font-semibold">{p.name}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-ink/60">{p.highlights}</p>
        <div className="mt-6 flex items-end justify-between border-t border-ink/10 pt-5">
          <div>
            <p className="text-xs text-ink/50">{t('common.perPerson')}</p>
            <p className="text-xl font-bold text-sea">{formatPrice(p.pricePerPerson, lang)}</p>
          </div>
          <Link to={`/packages/${p.id}`} className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-sea">{t('common.viewDetail')}</Link>
        </div>
      </div>
    </article>
  )
}
