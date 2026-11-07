import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { staffApi } from '../../services/dash'
import { useAsync } from '../../hooks/useAsync'
import { useLang } from '../../hooks/useLang'
import { formatDate, formatDateTime, formatPrice } from '../../utils/format'
import { STATUSES, type InquiryFilter, type InquiryStatus, type StaffInquiry } from '../../types/staff'
import { Banner, Field, Modal, StatusBadge, TableWrap, Td, Th, btnGhost, btnPrimary, errMsg, inputCls } from '../../components/ui'
import { ErrorState, Loading } from '../../components/State'

const SIZE = 10

export default function StaffInquiries() {
  const { t } = useTranslation()
  const { lang } = useLang()
  const [f, setF] = useState<InquiryFilter>({ page: 0 })
  const [selected, setSelected] = useState<StaffInquiry | null>(null)
  const [notes, setNotes] = useState('')
  const [msg, setMsg] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  const res = useAsync(() => staffApi.listInquiries({ ...f, size: SIZE }), [JSON.stringify(f), lang])
  const meta = useAsync(async () => {
    const [packages, staff] = await Promise.all([staffApi.listPackages(), staffApi.listStaff()])
    return { packages, staff }
  }, [])

  const set = (patch: Partial<InquiryFilter>) => setF((s) => ({ ...s, ...patch, page: patch.page ?? 0 }))
  const open = (i: StaffInquiry) => { setSelected(i); setNotes(i.followUpNotes ?? ''); setMsg(null) }

  const act = async (fn: () => Promise<StaffInquiry>) => {
    setBusy(true); setMsg(null)
    try { const u = await fn(); setSelected(u); setNotes(u.followUpNotes ?? ''); setMsg({ kind: 'ok', text: t('dash.inquiries.updated') }); res.reload() }
    catch (e) { setMsg({ kind: 'error', text: errMsg(e, t('dash.err.generic')) }) }
    finally { setBusy(false) }
  }

  const page = f.page ?? 0
  const contact = (i: StaffInquiry) => [i.email, i.phone].filter(Boolean).join(' · ')

  return (
    <div>
      <h1 className="text-3xl font-semibold">{t('dash.inquiries.title')}</h1>
      <p className="mt-1 text-sm text-ink/60">{t('dash.inquiries.originalNote')}</p>

      <div className="mt-6 grid gap-3 rounded-3xl bg-white p-5 sm:grid-cols-2 lg:grid-cols-6">
        <Field label={t('dash.inquiries.from')}><input type="date" value={f.from ?? ''} onChange={(e) => set({ from: e.target.value || undefined })} className={inputCls} /></Field>
        <Field label={t('dash.inquiries.to')}><input type="date" value={f.to ?? ''} onChange={(e) => set({ to: e.target.value || undefined })} className={inputCls} /></Field>
        <Field label={t('dash.common.status')}>
          <select value={f.status ?? ''} onChange={(e) => set({ status: e.target.value as InquiryStatus | '' })} className={inputCls}>
            <option value="">{t('dash.common.all')}</option>{STATUSES.map((s) => <option key={s} value={s}>{t(`status.${s}`)}</option>)}
          </select></Field>
        <Field label={t('dash.inquiries.package')}>
          <select value={f.packageId ?? ''} onChange={(e) => set({ packageId: e.target.value ? Number(e.target.value) : undefined })} className={inputCls}>
            <option value="">{t('dash.common.all')}</option>{meta.data?.packages.map((p) => <option key={p.id} value={p.id}>{p.translations[lang].name}</option>)}
          </select></Field>
        <Field label={t('dash.inquiries.assigned')}>
          <select value={f.assignedStaffId ?? ''} onChange={(e) => set({ assignedStaffId: e.target.value ? Number(e.target.value) : undefined })} className={inputCls}>
            <option value="">{t('dash.common.all')}</option>{meta.data?.staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select></Field>
        <Field label={t('dash.inquiries.language')}>
          <select value={f.language ?? ''} onChange={(e) => set({ language: e.target.value as 'id' | 'en' | '' })} className={inputCls}>
            <option value="">{t('dash.common.all')}</option><option value="id">ID</option><option value="en">EN</option>
          </select></Field>
      </div>

      <div className="mt-6">
        {res.loading ? <Loading /> : res.error ? <ErrorState message={res.error.message} onRetry={res.reload} /> : res.data!.content.length === 0 ? <p className="rounded-3xl bg-white p-10 text-center text-ink/60">{t('dash.common.empty')}</p> : (
          <>
            <TableWrap>
              <thead><tr><Th>{t('dash.inquiries.received')}</Th><Th>{t('dash.inquiries.customer')}</Th><Th>{t('dash.inquiries.package')}</Th><Th>{t('dash.inquiries.travelers')}</Th><Th>{t('dash.inquiries.language')}</Th><Th>{t('dash.common.status')}</Th><Th>{t('dash.inquiries.assigned')}</Th></tr></thead>
              <tbody>
                {res.data!.content.map((i) => (
                  <tr key={i.id} onClick={() => open(i)} className="cursor-pointer hover:bg-sand/60">
                    <Td className="whitespace-nowrap">{formatDateTime(i.createdAt, lang)}</Td>
                    <Td><p className="font-semibold">{i.customerName}</p><p className="text-xs text-ink/50">{contact(i)}</p></Td>
                    <Td>{i.packageName ?? <span className="text-ink/50">{i.requestedDestination} ({t('dash.inquiries.noPackage')})</span>}</Td>
                    <Td>{i.numTravelers}</Td><Td className="uppercase">{i.submissionLanguage}</Td>
                    <Td><StatusBadge s={i.status} /></Td>
                    <Td>{i.assignedStaffName ?? <span className="text-ink/40">{t('dash.inquiries.unassigned')}</span>}</Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
            <div className="mt-6 flex items-center justify-center gap-4 text-sm font-semibold">
              <button disabled={page <= 0} onClick={() => set({ page: page - 1 })} className={btnGhost}>{t('common.prev')}</button>
              <span>{t('common.page', { page: page + 1, total: res.data!.totalPages })}</span>
              <button disabled={page + 1 >= res.data!.totalPages} onClick={() => set({ page: page + 1 })} className={btnGhost}>{t('common.next')}</button>
            </div>
          </>
        )}
      </div>

      {selected && (
        <Modal wide title={`${t('dash.inquiries.detail')} #${selected.id}`} onClose={() => setSelected(null)}>
          <div className="grid gap-6 md:grid-cols-2">
            <dl className="space-y-3 text-sm">
              {([
                [t('dash.inquiries.customer'), selected.customerName], [t('dash.inquiries.contact'), contact(selected) || '—'],
                [t('dash.inquiries.package'), selected.packageName ?? '—'], [t('dash.inquiries.destination'), selected.requestedDestination ?? '—'],
                [t('dash.inquiries.travelers'), t('travelers', { count: selected.numTravelers })], [t('dash.inquiries.departure'), formatDate(selected.preferredDeparture, lang)],
                [t('dash.inquiries.budget'), selected.estimatedBudget == null ? '—' : formatPrice(selected.estimatedBudget, lang)],
                [t('dash.inquiries.language'), selected.submissionLanguage.toUpperCase()], [t('dash.inquiries.received'), formatDateTime(selected.createdAt, lang)],
              ] as [string, string][]).map(([k, v]) => (<div key={k}><dt className="text-xs font-semibold uppercase tracking-wider text-ink/50">{k}</dt><dd>{v}</dd></div>))}
              <div><dt className="text-xs font-semibold uppercase tracking-wider text-ink/50">{t('dash.inquiries.message')}</dt><dd className="whitespace-pre-wrap rounded-xl bg-sand p-3">{selected.message || '—'}</dd></div>
            </dl>
            <div className="space-y-4">
              <Field label={t('dash.common.status')}>
                <select disabled={busy} value={selected.status} onChange={(e) => act(() => staffApi.updateInquiryStatus(selected.id, e.target.value as InquiryStatus))} className={inputCls}>
                  {STATUSES.map((s) => <option key={s} value={s}>{t(`status.${s}`)}</option>)}
                </select></Field>
              <Field label={t('dash.inquiries.assigned')}>
                <select disabled={busy} value={selected.assignedStaffId ?? ''} onChange={(e) => act(() => staffApi.assignInquiry(selected.id, e.target.value ? Number(e.target.value) : null))} className={inputCls}>
                  <option value="">{t('dash.inquiries.unassigned')}</option>{meta.data?.staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select></Field>
              <Field label={t('dash.inquiries.notes')}><textarea rows={5} value={notes} onChange={(e) => setNotes(e.target.value)} className={inputCls} /></Field>
              <button disabled={busy} onClick={() => act(() => staffApi.updateInquiryNotes(selected.id, notes))} className={btnPrimary}>{t('dash.inquiries.saveNotes')}</button>
              {msg && <Banner kind={msg.kind}>{msg.text}</Banner>}
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
