import { Link, Navigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

export default function InquirySuccess() {
  const { t } = useTranslation()
  const { state } = useLocation() as { state: { inquiryId?: number } | null }
  if (!state?.inquiryId) return <Navigate to="/inquiry" replace />
  return (
    <section className="mx-auto max-w-xl px-5 py-24 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-sea">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M5 13l4 4L19 7" /></svg>
      </div>
      <h1 className="mt-6 text-4xl font-semibold">{t('inquiry.successTitle')}</h1>
      <p className="mt-3 text-ink/70">{t('inquiry.successText')}</p>
      <p className="mt-6 inline-block rounded-full bg-white px-5 py-2 text-sm">{t('inquiry.successRef')}: <b>#{state.inquiryId}</b></p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link to="/" className="rounded-full bg-ink px-6 py-3 font-semibold text-white hover:bg-sea">{t('inquiry.successHome')}</Link>
        <Link to="/packages" className="rounded-full bg-white px-6 py-3 font-semibold">{t('inquiry.successMore')}</Link>
      </div>
    </section>
  )
}
