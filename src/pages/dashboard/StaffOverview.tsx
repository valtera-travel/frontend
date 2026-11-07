import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { staffApi } from '../../services/dash'
import { useAsync } from '../../hooks/useAsync'
import { STATUSES } from '../../types/staff'
import { StatusBadge, btnPrimary } from '../../components/ui'
import { ErrorState, Loading } from '../../components/State'

export default function StaffOverview() {
  const { t } = useTranslation()
  const { data, loading, error, reload } = useAsync(async () => {
    const pages = await Promise.all(STATUSES.map((s) => staffApi.listInquiries({ status: s, size: 1 })))
    return pages.map((p) => p.totalElements)
  }, [])
  if (loading) return <Loading />
  if (error || !data) return <ErrorState onRetry={reload} />
  const total = data.reduce((a, b) => a + b, 0)
  return (
    <div>
      <h1 className="text-3xl font-semibold">{t('dash.overview.title')}</h1>
      <p className="mt-1 text-ink/60">{t('dash.overview.subtitle')}</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-3xl bg-sea-dark p-6 text-white">
          <p className="text-sm text-white/70">{t('dash.overview.total')}</p>
          <p className="mt-2 text-5xl font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>{total}</p>
        </div>
        {STATUSES.map((s, i) => (
          <div key={s} className="rounded-3xl bg-white p-6">
            <StatusBadge s={s} />
            <p className="mt-3 text-4xl font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>{data[i]}</p>
          </div>
        ))}
      </div>
      <Link to="/staff/inquiries" className={`${btnPrimary} mt-8 inline-block`}>{t('dash.overview.goInquiries')}</Link>
    </div>
  )
}
