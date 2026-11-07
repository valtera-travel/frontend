import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { managerApi } from '../../services/dash'
import { useAsync } from '../../hooks/useAsync'
import { useLang } from '../../hooks/useLang'
import { downloadBlob } from '../../utils/download'
import { formatMonth } from '../../utils/format'
import { STATUSES } from '../../types/staff'
import { Banner, Field, StatusBadge, btnCoral, errMsg, inputCls } from '../../components/ui'
import { ErrorState, Loading } from '../../components/State'

function Bars({ rows }: { rows: { label: string; count: number }[] }) {
  const max = Math.max(1, ...rows.map((r) => r.count))
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.label}>
          <div className="flex justify-between text-sm"><span>{r.label}</span><b>{r.count}</b></div>
          <div className="mt-1 h-2 rounded-full bg-ink/10"><div className="h-2 rounded-full bg-sea" style={{ width: `${(r.count / max) * 100}%` }} /></div>
        </li>
      ))}
    </ul>
  )
}
const Card = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="rounded-3xl bg-white p-6"><h2 className="mb-4 text-xl font-semibold">{title}</h2>{children}</section>
)

export default function ManagerDashboard() {
  const { t } = useTranslation()
  const { lang } = useLang()
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [exporting, setExporting] = useState(false)
  const [exportErr, setExportErr] = useState('')

  const q = { from: from || undefined, to: to || undefined, lang }
  const { data, loading, error, reload } = useAsync(() => managerApi.report(q), [from, to, lang])

  const doExport = async () => {
    setExporting(true); setExportErr('')
    try { downloadBlob(await managerApi.exportCsv(q), `inquiries_${lang}_${from || 'all'}_${to || 'all'}.csv`) }
    catch (e) { setExportErr(errMsg(e, t('dash.err.generic'))) }
    finally { setExporting(false) }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="text-3xl font-semibold">{t('dash.manager.title')}</h1><p className="mt-1 text-sm text-ink/60">{t('dash.manager.readOnly')} {t('dash.manager.note')}</p></div>
        <button onClick={doExport} disabled={exporting} className={btnCoral}>{exporting ? t('dash.manager.exporting') : `↓ ${t('dash.manager.export')}`}</button>
      </div>
      <div className="mt-6 grid max-w-md gap-3 sm:grid-cols-2">
        <Field label={t('dash.manager.from')}><input type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} className={inputCls} /></Field>
        <Field label={t('dash.manager.to')}><input type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.target.value)} className={inputCls} /></Field>
      </div>
      {exportErr && <div className="mt-4"><Banner kind="error">{exportErr}</Banner></div>}

      <div className="mt-8">
        {loading ? <Loading /> : error || !data ? <ErrorState message={error?.message} onRetry={reload} /> : data.total === 0 ? <p className="rounded-3xl bg-white p-10 text-center text-ink/60">{t('dash.manager.noData')}</p> : (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
              <div className="rounded-3xl bg-sea-dark p-5 text-white lg:col-span-1"><p className="text-sm text-white/70">{t('dash.manager.total')}</p><p className="mt-2 text-4xl font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>{data.total}</p></div>
              {STATUSES.map((s) => (<div key={s} className="rounded-3xl bg-white p-5"><StatusBadge s={s} /><p className="mt-3 text-3xl font-semibold" style={{ fontFamily: 'var(--font-serif)' }}>{data.byStatus[s]}</p></div>))}
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <Card title={t('dash.manager.topPackages')}>{data.topPackages.length ? <Bars rows={data.topPackages.map((p) => ({ label: p.name, count: p.count }))} /> : <p className="text-ink/60">{t('dash.manager.noData')}</p>}</Card>
              <Card title={t('dash.manager.topDestinations')}>{data.topDestinations.length ? <Bars rows={data.topDestinations.map((d) => ({ label: d.name, count: d.count }))} /> : <p className="text-ink/60">{t('dash.manager.noData')}</p>}</Card>
              <Card title={t('dash.manager.byLanguage')}><Bars rows={[{ label: t('dash.common.langId'), count: data.byLanguage.id }, { label: t('dash.common.langEn'), count: data.byLanguage.en }]} /></Card>
              <Card title={t('dash.manager.byPeriod')}><Bars rows={data.byPeriod.map((p) => ({ label: formatMonth(p.period, lang), count: p.count }))} /></Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
