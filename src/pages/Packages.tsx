import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { api } from '../services/api'
import { useAsync } from '../hooks/useAsync'
import { useLang } from '../hooks/useLang'
import { monthName } from '../utils/format'
import type { PackageSort } from '../types/api'
import PackageCard from '../components/PackageCard'
import { Empty, ErrorState, Loading } from '../components/State'

const SORTS: PackageSort[] = ['inquiries_desc', 'price_asc', 'price_desc', 'name_asc']
const SIZE = 9

export default function Packages() {
  const { t } = useTranslation()
  const { lang } = useLang()
  const [sp, setSp] = useSearchParams()
  const get = (k: string) => sp.get(k) ?? ''
  const num = (k: string) => (sp.get(k) ? Number(sp.get(k)) : undefined)
  const page = num('page') ?? 0

  const [kw, setKw] = useState(get('keyword'))
  useEffect(() => setKw(get('keyword')), [sp.get('keyword')]) // eslint-disable-line react-hooks/exhaustive-deps

  const set = (k: string, v: string) => {
    const n = new URLSearchParams(sp)
    if (v) n.set(k, v); else n.delete(k)
    if (k !== 'page') n.delete('page')
    setSp(n, { replace: true })
  }

  const dests = useAsync(() => api.getDestinations(lang), [lang])
  const regions = [...new Set((dests.data ?? []).map((d) => d.region))]

  const sort = (SORTS.includes(get('sort') as PackageSort) ? get('sort') : 'inquiries_desc') as PackageSort
  const res = useAsync(
    () => api.getPackages({ lang, keyword: get('keyword') || undefined, region: get('region') || undefined, maxPrice: num('maxPrice'), month: num('month'), sort, page, size: SIZE }),
    [lang, sp.toString()], // eslint-disable-line react-hooks/exhaustive-deps
  )

  const field = 'mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-4 py-2.5 outline-none focus:border-sea focus:ring-2 focus:ring-sea/20'
  const lbl = 'text-xs font-semibold uppercase tracking-wider text-ink/50'

  return (
    <section className="mx-auto max-w-7xl px-5 py-12 md:py-16">
      <p className="text-sm font-semibold uppercase tracking-widest text-coral">{t('packages.kicker')}</p>
      <h1 className="mt-2 text-4xl font-semibold md:text-5xl">{t('packages.title')}</h1>

      <form onSubmit={(e) => { e.preventDefault(); set('keyword', kw.trim()) }} className="mt-8 grid gap-4 rounded-3xl bg-white p-5 md:grid-cols-5 md:items-end">
        <label className="block md:col-span-2"><span className={lbl}>{t('search.keyword')}</span>
          <input value={kw} onChange={(e) => setKw(e.target.value)} onBlur={() => set('keyword', kw.trim())} placeholder={t('search.keywordPlaceholder')} className={field} /></label>
        <label className="block"><span className={lbl}>{t('packages.region')}</span>
          <select value={get('region')} onChange={(e) => set('region', e.target.value)} className={field}>
            <option value="">{t('common.any')}</option>
            {regions.map((r) => <option key={r}>{r}</option>)}
          </select></label>
        <label className="block"><span className={lbl}>{t('packages.month')}</span>
          <select value={get('month')} onChange={(e) => set('month', e.target.value)} className={field}>
            <option value="">{t('common.flexible')}</option>
            {Array.from({ length: 12 }, (_, i) => <option key={i} value={i + 1}>{monthName(i + 1, lang)}</option>)}
          </select></label>
        <label className="block"><span className={lbl}>{t('packages.sort')}</span>
          <select value={sort} onChange={(e) => set('sort', e.target.value)} className={field}>
            {SORTS.map((s) => <option key={s} value={s}>{t(`packages.sortOptions.${s}`)}</option>)}
          </select></label>
      </form>

      <div className="mt-10">
        {res.loading ? <Loading /> : res.error ? <ErrorState message={res.error.message} onRetry={res.reload} /> : res.data!.content.length === 0 ? (
          <Empty title={t('packages.emptyTitle')} text={t('packages.emptyText')}
            action={<button onClick={() => { setKw(''); setSp({}, { replace: true }) }} className="rounded-full bg-sea px-6 py-2.5 font-semibold text-white">{t('common.reset')}</button>} />
        ) : (
          <>
            <p className="mb-6 text-sm text-ink/60">{t('packages.found', { count: res.data!.totalElements })}</p>
            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">{res.data!.content.map((p) => <PackageCard key={p.id} p={p} />)}</div>
            {res.data!.totalPages > 1 && (
              <div className="mt-12 flex items-center justify-center gap-4 text-sm font-semibold">
                <button disabled={page <= 0} onClick={() => set('page', String(page - 1))} className="rounded-full bg-white px-5 py-2.5 disabled:opacity-40">{t('common.prev')}</button>
                <span>{t('common.page', { page: page + 1, total: res.data!.totalPages })}</span>
                <button disabled={page + 1 >= res.data!.totalPages} onClick={() => set('page', String(page + 1))} className="rounded-full bg-white px-5 py-2.5 disabled:opacity-40">{t('common.next')}</button>
              </div>
            )}
          </>
        )}
      </div>
      <p className="mt-10 text-center"><Link to="/inquiry" className="font-semibold text-sea hover:underline">{t('home.ctaButton')} →</Link></p>
    </section>
  )
}
