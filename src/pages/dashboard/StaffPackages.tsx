import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { staffApi } from '../../services/dash'
import { useAsync } from '../../hooks/useAsync'
import { useLang } from '../../hooks/useLang'
import { formatPrice } from '../../utils/format'
import type { PackageInput, StaffPackage } from '../../types/staff'
import { ActiveBadge, Banner, Field, Modal, TableWrap, Td, Th, TrFields, btnGhost, btnPrimary, errMsg, inputCls } from '../../components/ui'
import { ErrorState, Loading } from '../../components/State'

interface FormState { destinationId: string; pricePerPerson: string; durationDays: string; imageUrl: string; translations: PackageInput['translations'] }
const blank = (): FormState => ({ destinationId: '', pricePerPerson: '', durationDays: '1', imageUrl: '', translations: { id: { name: '', description: '', highlights: '' }, en: { name: '', description: '', highlights: '' } } })

export default function StaffPackages() {
  const { t } = useTranslation()
  const { lang } = useLang()
  const { data, loading, error, reload } = useAsync(async () => {
    const [packages, destinations] = await Promise.all([staffApi.listPackages(), staffApi.listDestinations()])
    return { packages, destinations }
  }, [])
  const [editing, setEditing] = useState<{ id: number | null; form: FormState } | null>(null)
  const [msg, setMsg] = useState('')
  const [saving, setSaving] = useState(false)
  const [formErr, setFormErr] = useState('')

  const destName = (id: number) => data?.destinations.find((d) => d.id === id)?.translations[lang].name ?? '—'
  const full = (p: StaffPackage) => (['id', 'en'] as const).every((l) => Object.values(p.translations[l]).every((v) => v.trim()))

  const toggle = async (p: StaffPackage) => {
    setMsg('')
    try { await staffApi.setPackageActive(p.id, !p.isActive); reload() } catch (e) { setMsg(errMsg(e, t('dash.err.generic'))) }
  }
  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editing) return
    const f = editing.form
    setSaving(true); setFormErr('')
    try {
      await staffApi.savePackage(editing.id, { destinationId: Number(f.destinationId), pricePerPerson: Number(f.pricePerPerson), durationDays: Number(f.durationDays), imageUrl: f.imageUrl, translations: f.translations })
      setEditing(null); reload()
    } catch (err) { setFormErr(errMsg(err, t('dash.err.generic'))) } finally { setSaving(false) }
  }
  const upd = (patch: Partial<FormState>) => editing && setEditing({ ...editing, form: { ...editing.form, ...patch } })

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="text-3xl font-semibold">{t('dash.packages.title')}</h1><p className="mt-1 max-w-2xl text-sm text-ink/60">{t('dash.packages.hint')}</p></div>
        <button className={btnPrimary} onClick={() => { setFormErr(''); setEditing({ id: null, form: blank() }) }}>+ {t('dash.packages.add')}</button>
      </div>
      {msg && <div className="mt-4"><Banner kind="error">{msg}</Banner></div>}
      <div className="mt-6">
        {loading ? <Loading /> : error || !data ? <ErrorState onRetry={reload} /> : data.packages.length === 0 ? <p className="rounded-3xl bg-white p-10 text-center text-ink/60">{t('dash.common.empty')}</p> : (
          <TableWrap>
            <thead><tr><Th>{t('dash.packages.name')}</Th><Th>{t('dash.packages.destination')}</Th><Th>{t('dash.packages.price')}</Th><Th>{t('dash.packages.duration')}</Th><Th>{t('dash.packages.inquiries')}</Th><Th>{t('dash.common.status')}</Th><Th>{t('dash.common.actions')}</Th></tr></thead>
            <tbody>
              {data.packages.map((p) => (
                <tr key={p.id}>
                  <Td className="font-semibold">{p.translations[lang].name || '—'}</Td>
                  <Td>{destName(p.destinationId)}</Td>
                  <Td>{formatPrice(p.pricePerPerson, lang)}</Td>
                  <Td>{p.durationDays}</Td>
                  <Td>{p.inquiryCount}</Td>
                  <Td><ActiveBadge on={p.isActive} />{!full(p) && <span className="ml-2 text-xs font-semibold text-coral">{t('dash.common.incomplete')}</span>}</Td>
                  <Td><div className="flex flex-wrap gap-2">
                    <button className={btnGhost} onClick={() => { setFormErr(''); setEditing({ id: p.id, form: { destinationId: String(p.destinationId), pricePerPerson: String(p.pricePerPerson), durationDays: String(p.durationDays), imageUrl: p.imageUrl, translations: p.translations } }) }}>{t('dash.common.edit')}</button>
                    <Link to={`/staff/packages/${p.id}`} className={btnGhost}>{t('dash.packages.manage')}</Link>
                    <button className={btnGhost} onClick={() => toggle(p)}>{p.isActive ? t('dash.common.deactivate') : t('dash.common.activate')}</button>
                  </div></Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </div>
      {editing && data && (
        <Modal wide title={editing.id ? t('dash.packages.edit') : t('dash.packages.add')} onClose={() => setEditing(null)}>
          <form onSubmit={save} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={t('dash.packages.destination')}>
                <select required value={editing.form.destinationId} onChange={(e) => upd({ destinationId: e.target.value })} className={inputCls}>
                  <option value="" />
                  {data.destinations.map((d) => <option key={d.id} value={d.id}>{d.translations[lang].name || `#${d.id}`}</option>)}
                </select>
              </Field>
              <Field label={t('dash.common.imageUrl')}><input value={editing.form.imageUrl} onChange={(e) => upd({ imageUrl: e.target.value })} className={inputCls} placeholder="https://" /></Field>
              <Field label={t('dash.packages.price')}><input type="number" min={0} required value={editing.form.pricePerPerson} onChange={(e) => upd({ pricePerPerson: e.target.value })} className={inputCls} /></Field>
              <Field label={t('dash.packages.duration')}><input type="number" min={1} required value={editing.form.durationDays} onChange={(e) => upd({ durationDays: e.target.value })} className={inputCls} /></Field>
            </div>
            <TrFields fields={[{ key: 'name', label: t('dash.packages.name') }, { key: 'description', label: t('dash.packages.description'), multiline: true }, { key: 'highlights', label: t('dash.packages.highlights'), multiline: true }]}
              value={editing.form.translations} onChange={(translations) => upd({ translations })} />
            {formErr && <Banner kind="error">{formErr}</Banner>}
            <div className="flex justify-end gap-2"><button type="button" className={btnGhost} onClick={() => setEditing(null)}>{t('dash.common.cancel')}</button><button disabled={saving} className={btnPrimary}>{saving ? t('dash.common.saving') : t('dash.common.save')}</button></div>
          </form>
        </Modal>
      )}
    </div>
  )
}
