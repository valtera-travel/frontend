import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import type { InquiryStatus, Tr } from '../types/staff'
import { ApiError } from '../services/http'

export const inputCls = 'w-full rounded-xl border border-ink/15 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-sea focus:ring-2 focus:ring-sea/20 disabled:bg-ink/5'
export const btnPrimary = 'rounded-xl bg-sea px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sea-dark disabled:opacity-60'
export const btnCoral = 'rounded-xl bg-coral px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-95 disabled:opacity-60'
export const btnGhost = 'rounded-xl border border-ink/15 bg-white px-3.5 py-2 text-sm font-semibold transition hover:bg-sand disabled:opacity-60'

export function errMsg(e: unknown, fallback: string) { return e instanceof ApiError && e.message ? e.message : fallback }

export function Modal({ title, onClose, children, wide = false }: { title: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  const { t } = useTranslation()
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [onClose])
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/60 p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()} className={`max-h-[92vh] w-full overflow-y-auto rounded-3xl bg-white p-6 md:p-8 ${wide ? 'max-w-4xl' : 'max-w-xl'}`}>
        <div className="mb-5 flex items-start justify-between gap-4">
          <h2 className="text-2xl font-semibold">{title}</h2>
          <button onClick={onClose} aria-label={t('dash.common.close')} className="grid h-9 w-9 place-items-center rounded-full bg-sand text-xl">×</button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink/55">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink/50">{hint}</span>}
    </label>
  )
}

const statusColor: Record<InquiryStatus, string> = {
  NEW: 'bg-coral/15 text-coral', CONTACTED: 'bg-sky-100 text-sky-800', OFFER_SENT: 'bg-amber-100 text-amber-800', CONVERTED: 'bg-emerald-100 text-emerald-800', CLOSED: 'bg-ink/10 text-ink/60',
}
export function StatusBadge({ s }: { s: InquiryStatus }) {
  const { t } = useTranslation()
  return <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${statusColor[s]}`}>{t(`status.${s}`)}</span>
}
export function ActiveBadge({ on }: { on: boolean }) {
  const { t } = useTranslation()
  return <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-bold ${on ? 'bg-emerald-100 text-emerald-800' : 'bg-ink/10 text-ink/60'}`}>{on ? t('dash.common.active') : t('dash.common.inactive')}</span>
}

export function Banner({ kind, children }: { kind: 'error' | 'ok'; children: React.ReactNode }) {
  return <p role={kind === 'error' ? 'alert' : 'status'} className={`rounded-xl px-4 py-3 text-sm font-medium ${kind === 'error' ? 'bg-coral/10 text-coral' : 'bg-emerald-100 text-emerald-800'}`}>{children}</p>
}

export const TableWrap = ({ children }: { children: React.ReactNode }) => <div className="overflow-x-auto rounded-3xl bg-white"><table className="w-full min-w-[640px] text-left text-sm">{children}</table></div>
export const Th = ({ children }: { children?: React.ReactNode }) => <th className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-ink/50">{children}</th>
export const Td = ({ children, className = '' }: { children?: React.ReactNode; className?: string }) => <td className={`border-t border-ink/10 px-4 py-3 align-middle ${className}`}>{children}</td>

// Dua bagian input: Bahasa Indonesia & English (SRS 11.2). Terjemahan tidak dilakukan otomatis.
export interface TrFieldDef { key: string; label: string; multiline?: boolean }
export function TrFields<T extends object>({ fields, value, onChange }: { fields: TrFieldDef[]; value: Tr<T>; onChange: (v: Tr<T>) => void }) {
  const { t } = useTranslation()
  const set = (l: 'id' | 'en', k: string, v: string) => onChange({ ...value, [l]: { ...value[l], [k]: v } } as Tr<T>)
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {(['id', 'en'] as const).map((l) => (
        <fieldset key={l} className="space-y-3 rounded-2xl border border-ink/10 p-4">
          <legend className="px-2 text-sm font-bold text-sea">{l === 'id' ? t('dash.common.langId') : t('dash.common.langEn')}</legend>
          {fields.map((f) => (
            <Field key={f.key} label={f.label}>
              {f.multiline
                ? <textarea rows={3} value={(value[l] as Record<string, string>)[f.key] ?? ''} onChange={(e) => set(l, f.key, e.target.value)} className={inputCls} />
                : <input value={(value[l] as Record<string, string>)[f.key] ?? ''} onChange={(e) => set(l, f.key, e.target.value)} className={inputCls} />}
            </Field>
          ))}
        </fieldset>
      ))}
    </div>
  )
}
