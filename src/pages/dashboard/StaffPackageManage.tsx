import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { staffApi } from '../../services/dash'
import { useAsync } from '../../hooks/useAsync'
import { useLang } from '../../hooks/useLang'
import { formatDate } from '../../utils/format'
import type { InclusionInput, StaffInclusion, StaffSchedule } from '../../types/staff'
import { ActiveBadge, Banner, Field, Modal, TableWrap, Td, Th, TrFields, btnGhost, btnPrimary, errMsg, inputCls } from '../../components/ui'
import { ErrorState, Loading } from '../../components/State'

type SchedForm = { id: number | null; departureDate: string; returnDate: string }
type IncForm = { id: number | null; displayOrder: string; translations: InclusionInput['translations'] }

export default function StaffPackageManage() {
  const pid = Number(useParams().id)
  const { t } = useTranslation()
  const { lang } = useLang()
  const pkg = useAsync(async () => (await staffApi.listPackages()).find((p) => p.id === pid) ?? null, [pid])
  const sch = useAsync(() => staffApi.listSchedules(pid), [pid])
  const inc = useAsync(() => staffApi.listInclusions(pid), [pid])
  const [sf, setSf] = useState<SchedForm | null>(null)
  const [inf, setInf] = useState<IncForm | null>(null)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  const run = async (fn: () => Promise<unknown>, done: () => void) => {
    setBusy(true); setErr('')
    try { await fn(); done() } catch (e) { setErr(errMsg(e, t('dash.err.generic'))) } finally { setBusy(false) }
  }

  if (pkg.loading) return <Loading />
  if (pkg.error || !pkg.data) return <ErrorState onRetry={pkg.reload} />

  return (
    <div className="space-y-12">
      <div>
        <Link to="/staff/packages" className="text-sm font-semibold text-sea hover:underline">← {t('dash.manage.back')}</Link>
        <h1 className="mt-2 text-3xl font-semibold">{pkg.data.translations[lang].name || `#${pid}`}</h1>
      </div>

      <section>
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold">{t('dash.manage.schedules')}</h2>
          <button className={btnPrimary} onClick={() => { setErr(''); setSf({ id: null, departureDate: '', returnDate: '' }) }}>+ {t('dash.manage.addSchedule')}</button>
        </div>
        <div className="mt-4">
          {sch.loading ? <Loading /> : sch.error ? <ErrorState onRetry={sch.reload} /> : sch.data!.length === 0 ? <p className="rounded-3xl bg-white p-8 text-center text-ink/60">{t('dash.manage.noSchedules')}</p> : (
            <TableWrap>
              <thead><tr><Th>{t('dash.manage.departure')}</Th><Th>{t('dash.manage.return')}</Th><Th>{t('dash.common.status')}</Th><Th>{t('dash.common.actions')}</Th></tr></thead>
              <tbody>
                {sch.data!.map((s: StaffSchedule) => (
                  <tr key={s.id}>
                    <Td>{formatDate(s.departureDate, lang)}</Td><Td>{formatDate(s.returnDate, lang)}</Td><Td><ActiveBadge on={s.isActive} /></Td>
                    <Td><div className="flex gap-2">
                      <button className={btnGhost} onClick={() => { setErr(''); setSf({ id: s.id, departureDate: s.departureDate, returnDate: s.returnDate }) }}>{t('dash.common.edit')}</button>
                      <button className={btnGhost} onClick={() => run(() => staffApi.setScheduleActive(s.id, !s.isActive), sch.reload)}>{s.isActive ? t('dash.common.deactivate') : t('dash.common.activate')}</button>
                    </div></Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-2xl font-semibold">{t('dash.manage.inclusions')}</h2>
          <button className={btnPrimary} onClick={() => { setErr(''); setInf({ id: null, displayOrder: String((inc.data?.length ?? 0) + 1), translations: { id: { itemName: '', description: '' }, en: { itemName: '', description: '' } } }) }}>+ {t('dash.manage.addInclusion')}</button>
        </div>
        <div className="mt-4">
          {inc.loading ? <Loading /> : inc.error ? <ErrorState onRetry={inc.reload} /> : inc.data!.length === 0 ? <p className="rounded-3xl bg-white p-8 text-center text-ink/60">{t('dash.manage.noInclusions')}</p> : (
            <TableWrap>
              <thead><tr><Th>#</Th><Th>{t('dash.manage.itemName')}</Th><Th>{t('dash.manage.description')}</Th><Th>{t('dash.common.actions')}</Th></tr></thead>
              <tbody>
                {inc.data!.map((i: StaffInclusion) => (
                  <tr key={i.id}>
                    <Td>{i.displayOrder}</Td><Td className="font-semibold">{i.translations[lang].itemName}</Td><Td>{i.translations[lang].description}</Td>
                    <Td><div className="flex gap-2">
                      <button className={btnGhost} onClick={() => { setErr(''); setInf({ id: i.id, displayOrder: String(i.displayOrder), translations: i.translations }) }}>{t('dash.common.edit')}</button>
                      <button className={btnGhost} onClick={() => { if (confirm(t('dash.common.confirmDelete'))) void run(() => staffApi.deleteInclusion(i.id), inc.reload) }}>{t('dash.common.delete')}</button>
                    </div></Td>
                  </tr>
                ))}
              </tbody>
            </TableWrap>
          )}
        </div>
      </section>

      {sf && (
        <Modal title={sf.id ? t('dash.manage.editSchedule') : t('dash.manage.addSchedule')} onClose={() => setSf(null)}>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); void run(() => staffApi.saveSchedule(pid, sf.id, { departureDate: sf.departureDate, returnDate: sf.returnDate }), () => { setSf(null); sch.reload() }) }}>
            <Field label={t('dash.manage.departure')}><input type="date" required value={sf.departureDate} onChange={(e) => setSf({ ...sf, departureDate: e.target.value })} className={inputCls} /></Field>
            <Field label={t('dash.manage.return')}><input type="date" required min={sf.departureDate} value={sf.returnDate} onChange={(e) => setSf({ ...sf, returnDate: e.target.value })} className={inputCls} /></Field>
            {err && <Banner kind="error">{err}</Banner>}
            <div className="flex justify-end gap-2"><button type="button" className={btnGhost} onClick={() => setSf(null)}>{t('dash.common.cancel')}</button><button disabled={busy} className={btnPrimary}>{busy ? t('dash.common.saving') : t('dash.common.save')}</button></div>
          </form>
        </Modal>
      )}
      {inf && (
        <Modal wide title={inf.id ? t('dash.manage.editInclusion') : t('dash.manage.addInclusion')} onClose={() => setInf(null)}>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); void run(() => staffApi.saveInclusion(pid, inf.id, { displayOrder: Number(inf.displayOrder) || 1, translations: inf.translations }), () => { setInf(null); inc.reload() }) }}>
            <Field label={t('dash.manage.order')}><input type="number" min={1} value={inf.displayOrder} onChange={(e) => setInf({ ...inf, displayOrder: e.target.value })} className={inputCls} /></Field>
            <TrFields fields={[{ key: 'itemName', label: t('dash.manage.itemName') }, { key: 'description', label: t('dash.manage.description') }]} value={inf.translations} onChange={(translations) => setInf({ ...inf, translations })} />
            {err && <Banner kind="error">{err}</Banner>}
            <div className="flex justify-end gap-2"><button type="button" className={btnGhost} onClick={() => setInf(null)}>{t('dash.common.cancel')}</button><button disabled={busy} className={btnPrimary}>{busy ? t('dash.common.saving') : t('dash.common.save')}</button></div>
          </form>
        </Modal>
      )}
      {err && !sf && !inf && <Banner kind="error">{err}</Banner>}
    </div>
  )
}
