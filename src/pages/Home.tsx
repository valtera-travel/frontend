import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { api } from '../services/api'
import { useAsync } from '../hooks/useAsync'
import { useLang } from '../hooks/useLang'
import { formatPrice, monthName } from '../utils/format'
import PackageCard from '../components/PackageCard'
import DestinationCard from '../components/DestinationCard'
import { ErrorState, Loading } from '../components/State'

const HERO = 'https://images.unsplash.com/photo-1555400038-63f5ba517a47?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1800'
const MAX = 35000000

type Item = { t: string; d: string }
type Faq = { q: string; a: string }

export default function Home() {
  const { t } = useTranslation()
  const { lang } = useLang()
  const nav = useNavigate()
  const [keyword, setKeyword] = useState('')
  const [month, setMonth] = useState('')
  const [maxPrice, setMaxPrice] = useState(MAX)
  const [open, setOpen] = useState<number | null>(0)

  const feat = useAsync(() => api.getPackages({ lang, size: 3, sort: 'inquiries_desc' }), [lang])
  const dests = useAsync(() => api.getDestinations(lang), [lang])

  const why = t('home.why', { returnObjects: true }) as unknown as Item[]
  const steps = t('home.steps', { returnObjects: true }) as unknown as Item[]
  const faq = t('home.faq', { returnObjects: true }) as unknown as Faq[]
  const points = t('hero.points', { returnObjects: true }) as unknown as string[]

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const p = new URLSearchParams()
    if (keyword.trim()) p.set('keyword', keyword.trim())
    if (month) p.set('month', month)
    if (maxPrice < MAX) p.set('maxPrice', String(maxPrice))
    nav(`/packages?${p.toString()}`)
  }
  const field = 'mt-1.5 w-full rounded-xl border border-ink/15 bg-white px-4 py-3 outline-none focus:border-sea focus:ring-2 focus:ring-sea/20'
  const lbl = 'text-xs font-semibold uppercase tracking-wider text-ink/50'

  return (
    <>
      <section className="relative">
        <div className="absolute inset-0">
          <img src={HERO} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/70 via-ink/40 to-ink/80" />
        </div>
        <div className="relative mx-auto max-w-7xl px-5 pb-40 pt-36 text-white md:pb-44 md:pt-44">
          <p className="mb-4 inline-block rounded-full border border-white/30 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest backdrop-blur">{t('hero.badge')}</p>
          <h1 className="max-w-3xl text-5xl leading-[1.05] font-semibold md:text-7xl">{t('hero.title')}</h1>
          <p className="mt-6 max-w-xl text-lg text-white/85">{t('hero.subtitle')}</p>
          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm font-medium">
            {points.map((p) => (
              <span key={p} className="flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f4a261" strokeWidth="3"><path d="M5 13l4 4L19 7" /></svg>{p}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="relative z-10 mx-auto -mt-28 max-w-6xl px-5">
        <form onSubmit={onSearch} className="rounded-3xl bg-white p-5 shadow-2xl shadow-ink/20 md:p-7">
          <div className="grid gap-4 md:grid-cols-[1.4fr_1fr_1.2fr_auto] md:items-end">
            <label className="block"><span className={lbl}>{t('search.keyword')}</span>
              <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder={t('search.keywordPlaceholder')} className={field} /></label>
            <label className="block"><span className={lbl}>{t('search.month')}</span>
              <select value={month} onChange={(e) => setMonth(e.target.value)} className={field}>
                <option value="">{t('common.flexible')}</option>
                {Array.from({ length: 12 }, (_, i) => <option key={i} value={i + 1}>{monthName(i + 1, lang)}</option>)}
              </select></label>
            <label className="block">
              <span className={`flex justify-between ${lbl}`}><span>{t('search.maxPrice')}</span><span className="text-sea">{formatPrice(maxPrice, lang)}</span></span>
              <input type="range" min={2000000} max={MAX} step={500000} value={maxPrice} onChange={(e) => setMaxPrice(+e.target.value)} className="mt-4 w-full accent-[#0f6b6e]" />
            </label>
            <button className="rounded-xl bg-coral px-8 py-3.5 font-semibold text-white transition hover:brightness-95">{t('search.submit')}</button>
          </div>
        </form>
      </div>

      <section className="mx-auto max-w-7xl px-5 py-24">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-coral">{t('home.featuredKicker')}</p>
            <h2 className="mt-2 text-4xl font-semibold md:text-5xl">{t('home.featuredTitle')}</h2>
          </div>
          <Link to="/packages" className="font-semibold text-sea hover:underline">{t('common.viewAll')} →</Link>
        </div>
        <div className="mt-12">
          {feat.loading ? <Loading /> : feat.error ? <ErrorState onRetry={feat.reload} /> : (
            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">{feat.data!.content.map((p) => <PackageCard key={p.id} p={p} />)}</div>
          )}
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-5">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-sm font-semibold uppercase tracking-widest text-coral">{t('home.destKicker')}</p>
              <h2 className="mt-2 text-4xl font-semibold md:text-5xl">{t('home.destTitle')}</h2>
            </div>
            <Link to="/destinations" className="font-semibold text-sea hover:underline">{t('common.viewAll')} →</Link>
          </div>
          <div className="mt-12">
            {dests.loading ? <Loading /> : dests.error ? <ErrorState onRetry={dests.reload} /> : (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{dests.data!.map((d) => <DestinationCard key={d.id} d={d} />)}</div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-sea-dark py-20 text-white">
        <div className="mx-auto max-w-7xl px-5">
          <h2 className="max-w-xl text-4xl font-semibold md:text-5xl">{t('home.whyTitle')}</h2>
          <div className="mt-12 grid gap-10 md:grid-cols-3">
            {why.map((w) => (<div key={w.t}><h3 className="text-2xl font-semibold">{w.t}</h3><p className="mt-2 text-white/70">{w.d}</p></div>))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="mx-auto max-w-7xl px-5">
          <h2 className="max-w-xl text-4xl font-semibold md:text-5xl">{t('home.stepsTitle')}</h2>
          <div className="mt-14 grid gap-8 md:grid-cols-4">
            {steps.map((s, i) => (
              <div key={s.t}>
                <div className="grid h-12 w-12 place-items-center rounded-full bg-white text-lg font-bold text-sea" style={{ fontFamily: 'var(--font-serif)' }}>{i + 1}</div>
                <h3 className="mt-5 text-xl font-semibold">{s.t}</h3>
                <p className="mt-2 text-ink/65">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 pb-24">
        <h2 className="text-center text-4xl font-semibold md:text-5xl">{t('home.faqTitle')}</h2>
        <div className="mt-10 divide-y divide-ink/10 rounded-3xl bg-white px-6">
          {faq.map((f, i) => (
            <div key={f.q}>
              <button aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center justify-between py-5 text-left font-semibold">
                {f.q}<span className={`ml-4 text-2xl text-sea transition ${open === i ? 'rotate-45' : ''}`}>+</span>
              </button>
              {open === i && <p className="pb-5 text-ink/70">{f.a}</p>}
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-24">
        <div className="rounded-3xl bg-sea-dark p-10 text-center text-white md:p-16">
          <h2 className="text-4xl font-semibold">{t('home.ctaTitle')}</h2>
          <p className="mx-auto mt-3 max-w-lg text-white/85">{t('home.ctaText')}</p>
          <Link to="/inquiry" className="mt-8 inline-block rounded-full bg-coral px-8 py-3.5 font-semibold text-white hover:brightness-95">{t('home.ctaButton')}</Link>
        </div>
      </section>
    </>
  )
}
