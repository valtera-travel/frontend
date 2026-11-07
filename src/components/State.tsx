import { useTranslation } from 'react-i18next'

export function Loading() {
  const { t } = useTranslation()
  return <div role="status" className="py-24 text-center text-ink/60">{t('common.loading')}</div>
}

export function ErrorState({ message, onRetry }: { message?: string; onRetry?: () => void }) {
  const { t } = useTranslation()
  return (
    <div role="alert" className="rounded-3xl bg-white p-12 text-center">
      <p className="font-semibold">{message || t('common.error')}</p>
      {onRetry && <button onClick={onRetry} className="mt-4 rounded-full bg-sea px-6 py-2.5 font-semibold text-white">{t('common.retry')}</button>}
    </div>
  )
}

export function Empty({ title, text, action }: { title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-3xl bg-white p-14 text-center">
      <p className="text-lg font-semibold">{title}</p>
      {text && <p className="mt-1 text-ink/60">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}
