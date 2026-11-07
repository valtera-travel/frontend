import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { api } from '../services/api'
import { ApiError } from '../services/http'
import { useAsync } from '../hooks/useAsync'
import { useLang } from '../hooks/useLang'
import type { InquiryRequest } from '../types/api'

const today = () => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10) }
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Form = { customerName: string; email: string; phone: string; packageId: string; destinationId: string; requestedDestination: string; numTravelers: string; preferredDeparture: string; estimatedBudget: string; message: string }
type Errs = Partial<Record<'customerName' | 'contact' | 'email' | 'requestedDestination' | 'numTravelers' | 'preferredDeparture' | 'estimatedBudget', string>>

export default function InquiryForm() {
  const { t } = useTranslation()
  const { lang } = useLang()
  const nav = useNavigate()
  const [sp] = useSearchParams()
  const [f, setF] = useState<Form>({ customerName: '', email: '', phone: '', packageId: sp.get('packageId') ?? '', destinationId: '', requestedDestination: '', numTravelers: '1', preferredDeparture: '', estimatedBudget: '', message: '' })
  const [errs, setErrs] = useState<Errs>({})
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  const pkgs = useAsync(() => api.getPackages({ lang, size: 100, sort: 'name_asc' }), [lang])
  const dests = useAsync(() => api.getDestinations(lang), [lang])
  const set = (k: keyof Form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setF((s) => ({ ...s, [k]: e.target.value }))

  // Validasi sisi klien hanya untuk UX; backend tetap memvalidasi ulang (SRS Bab IV)
  const validate = (): Errs => {
    const e: Errs = {}
    const k = 'inquiry.errors.'
    if (!f.customerName.trim()) e.customerName = t(k + 'customerName')
    if (!f.email.trim() && !f.phone.trim()) e.contact = t(k + 'contact')
    if (f.email.trim() && !EMAIL.test(f.email.trim())) e.email = t(k + 'email')
    if (!f.packageId && (!f.destinationId || (f.destinationId === 'other' && !f.requestedDestination.trim()))) e.requestedDestination = t(k + 'destination')
    if (!(Number(f.numTravelers) >= 1)) e.numTravelers = t(k + 'numTravelers')
    if (!f.preferredDeparture) e.preferredDeparture = t(k + 'preferredDeparture')
    else if (f.preferredDeparture < today()) e.preferredDeparture = t(k + 'pastDate')
    if (f.estimatedBudget && Number(f.estimatedBudget) < 0) e.estimatedBudget = t(k + 'budget')
    return e
  }

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault()
    setServerError('')
    const e = validate()
    setErrs(e)
    if (Object.keys(e).length) return
    const body: InquiryRequest = {
      customerName: f.customerName.trim(), email: f.email.trim() || null, phone: f.phone.trim() || null,
      packageId: f.packageId ? Number(f.packageId) : null,
      destinationId: !f.packageId && f.destinationId && f.destinationId !== 'other' ? Number(f.destinationId) : null,
      requestedDestination: !f.packageId && f.destinationId === 'other' ? f.requestedDestination.trim() : null,
      numTravelers: Number(f.numTravelers), preferredDeparture: f.preferredDeparture,
      estimatedBudget: f.estimatedBudget ? Number(f.estimatedBudget) : null,
      message: f.message.trim() || null,
      submissionLanguage: lang, // diisi otomatis dari bahasa yang sedang dipilih
    }
    setSubmitting(true)
    try {
      const r = await api.submitInquiry(body)
      nav('/inquiry/success', { state: { inquiryId: r.inquiryId } })
    } catch (err) {
      setServerError(err instanceof ApiError && err.message ? err.message : t('inquiry.errors.submit'))
      setSubmitting(false)
    }
  }

  const input = (bad?: string) => `mt-1.5 w-full rounded-xl border bg-white px-4 py-3 outline-none focus:ring-2 ${bad ? 'border-coral focus:ring-coral/20' : 'border-ink/15 focus:border-sea focus:ring-sea/20'}`
  const lbl = 'text-sm font-semibold'
  const Err = ({ m }: { m?: string }) => (m ? <p role="alert" className="mt-1 text-sm text-coral">{m}</p> : null)

  return (
    <section className="mx-auto max-w-3xl px-5 py-12 md:py-16">
      <h1 className="text-4xl font-semibold md:text-5xl">{t('inquiry.title')}</h1>
      <p className="mt-3 text-ink/70">{t('inquiry.subtitle')}</p>

      <form onSubmit={onSubmit} noValidate className="mt-10 grid gap-5 rounded-3xl bg-white p-6 shadow-xl shadow-ink/5 md:p-10">
        <label className="block"><span className={lbl}>{t('inquiry.customerName')} *</span>
          <input value={f.customerName} onChange={set('customerName')} autoComplete="name" className={input(errs.customerName)} /><Err m={errs.customerName} /></label>

        <div>
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block"><span className={lbl}>{t('inquiry.email')}</span>
              <input type="email" value={f.email} onChange={set('email')} autoComplete="email" className={input(errs.email || errs.contact)} /><Err m={errs.email} /></label>
            <label className="block"><span className={lbl}>{t('inquiry.phone')}</span>
              <input type="tel" value={f.phone} onChange={set('phone')} autoComplete="tel" className={input(errs.contact)} /></label>
          </div>
          <p className="mt-2 text-xs text-ink/50">{t('inquiry.contactHint')}</p>
          <Err m={errs.contact} />
        </div>

        <label className="block"><span className={lbl}>{t('inquiry.package')}</span>
          <select value={f.packageId} onChange={set('packageId')} className={input()}>
            <option value="">{t('inquiry.noPackage')}</option>
            {pkgs.data?.content.map((p) => <option key={p.id} value={p.id}>{p.name} — {p.destinationName}</option>)}
          </select></label>

        {!f.packageId && (
          <div className="space-y-3">
            <label className="block"><span className={lbl}>{t('inquiry.destination')} *</span>
              <select value={f.destinationId} onChange={set('destinationId')} className={input(errs.requestedDestination)}>
                <option value="">{t('inquiry.destinationSelect')}</option>
                {dests.data?.map((d) => <option key={d.id} value={d.id}>{d.name}, {d.region}</option>)}
                <option value="other">{t('inquiry.destinationOther')}</option>
              </select></label>
            {f.destinationId === 'other' && (
              <input value={f.requestedDestination} onChange={set('requestedDestination')} placeholder={t('inquiry.destinationPlaceholder')} className={input(errs.requestedDestination)} />
            )}
            <Err m={errs.requestedDestination} />
          </div>
        )}

        <div className="grid gap-5 md:grid-cols-2">
          <label className="block"><span className={lbl}>{t('inquiry.numTravelers')} *</span>
            <input type="number" min={1} value={f.numTravelers} onChange={set('numTravelers')} className={input(errs.numTravelers)} /><Err m={errs.numTravelers} /></label>
          <label className="block"><span className={lbl}>{t('inquiry.preferredDeparture')} *</span>
            <input type="date" min={today()} value={f.preferredDeparture} onChange={set('preferredDeparture')} className={input(errs.preferredDeparture)} /><Err m={errs.preferredDeparture} /></label>
        </div>

        <label className="block"><span className={lbl}>{t('inquiry.budget')}</span>
          <input type="number" min={0} step={100000} value={f.estimatedBudget} onChange={set('estimatedBudget')} className={input(errs.estimatedBudget)} /><Err m={errs.estimatedBudget} /></label>

        <label className="block"><span className={lbl}>{t('inquiry.message')}</span>
          <textarea rows={4} value={f.message} onChange={set('message')} placeholder={t('inquiry.messagePlaceholder')} className={input()} /></label>

        {serverError && <p role="alert" className="rounded-xl bg-coral/10 px-4 py-3 text-sm font-medium text-coral">{serverError}</p>}

        <button disabled={submitting} className="rounded-xl bg-coral py-3.5 font-semibold text-white transition hover:brightness-95 disabled:opacity-60">
          {submitting ? t('inquiry.submitting') : t('inquiry.submit')}
        </button>
      </form>
    </section>
  )
}
