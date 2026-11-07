import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { staffApi } from '../../services/dash'
import { useAsync } from '../../hooks/useAsync'
import { useLang } from '../../hooks/useLang'
import type { DestinationInput, StaffDestination } from '../../types/staff'
import { ActiveBadge, Banner, Field, Modal, TableWrap, Td, Th, TrFields, btnGhost, btnPrimary, errMsg, inputCls } from '../../components/ui'
import { ErrorState, Loading } from '../../components/State'

const blank = (): DestinationInput => ({ imageUrl: '', translations: { id: { name: '', region: '', description: '' }, en: { name: '', region: '', description: '' } } })

export default function StaffDestinations() {
  const { t } = useTranslation()
  const { lang } = useLang()
  const { data, loading, error, reload } = useAsync(() => staffApi.listDestinations(), [])
  const [editing, setEditing] = useState<{ id: number | null; form: DestinationInput } | null>(null)
  const [msg, setMsg] = useState('')
  const [saving, setSaving] = useState(false)
  const [formErr, setFormErr] = useState('')

  const toggle = async (d: StaffDestination) => {
    setMsg('')
    try { await staffApi.setDestinationActive(d.id, !d.isActive); reload() } catch (e) { setMsg(errMsg(e, t('dash.err.generic'))) }
  }
  const save = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editing) return
    setSaving(true); setFormErr('')
    try { await staffApi.saveDestination(editing.id, editing.form); setEditing(null); reload() }
    catch (err) { setFormErr(errMsg(err, t('dash.err.generic'))) }
    finally { setSaving(false) }
  }
  const full = (d: StaffDestination) => (['id', 'en'] as const).every((l) => Object.values(d.translations[l]).every((v) => v.trim()))

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><h1 className="text-3xl font-semibold">{t('dash.destinations.title')}</h1><p className="mt-1 max-w-2xl text-sm text-ink/60">{t('dash.destinations.hint')}</p></div>
        <button className={btnPrimary} onClick={() => { setFormErr(''); setEditing({ id: null, form: blank() }) }}>+ {t('dash.destinations.add')}</button>
      </div>
      {msg && <div className="mt-4"><Banner kind="error">{msg}</Banner></div>}
      <div className="mt-6">
        {loading ? <Loading /> : error ? <ErrorState onRetry={reload} /> : data!.length === 0 ? <p className="rounded-3xl bg-white p-10 text-center text-ink/60">{t('dash.common.empty')}</p> : (
          <TableWrap>
            <thead><tr><Th /><Th>{t('dash.destinations.name')}</Th><Th>{t('dash.destinations.region')}</Th><Th>{t('dash.common.status')}</Th><Th>{t('dash.common.actions')}</Th></tr></thead>
            <tbody>
              {data!.map((d) => (
                <tr key={d.id}>
                  <Td><img src={d.imageUrl} alt="" className="h-12 w-16 rounded-lg object-cover" /></Td>
                  <Td className="font-semibold">{d.translations[lang].name || '—'}</Td>
                  <Td>{d.translations[lang].region || '—'}</Td>
                  <Td><ActiveBadge on={d.isActive} />{!full(d) && <span className="ml-2 text-xs font-semibold text-coral">{t('dash.common.incomplete')}</span>}</Td>
                  <Td><div className="flex gap-2">
                    <button className={btnGhost} onClick={() => { setFormErr(''); setEditing({ id: d.id, form: { imageUrl: d.imageUrl, translations: d.translations } }) }}>{t('dash.common.edit')}</button>
                    <button className={btnGhost} onClick={() => toggle(d)}>{d.isActive ? t('dash.common.deactivate') : t('dash.common.activate')}</button>
                  </div></Td>
                </tr>
              ))}
            </tbody>
          </TableWrap>
        )}
      </div>
      {editing && (
        <Modal wide title={editing.id ? t('dash.destinations.edit') : t('dash.destinations.add')} onClose={() => setEditing(null)}>
          <form onSubmit={save} className="space-y-5">
            <Field label={t('dash.common.imageUrl')}><input value={editing.form.imageUrl} onChange={(e) => setEditing({ ...editing, form: { ...editing.form, imageUrl: e.target.value } })} className={inputCls} placeholder="https://" /></Field>
            <TrFields fields={[{ key: 'name', label: t('dash.destinations.name') }, { key: 'region', label: t('dash.destinations.region') }, { key: 'description', label: t('dash.destinations.description'), multiline: true }]}
              value={editing.form.translations} onChange={(translations) => setEditing({ ...editing, form: { ...editing.form, translations } })} />
            {formErr && <Banner kind="error">{formErr}</Banner>}
            <div className="flex justify-end gap-2"><button type="button" className={btnGhost} onClick={() => setEditing(null)}>{t('dash.common.cancel')}</button><button disabled={saving} className={btnPrimary}>{saving ? t('dash.common.saving') : t('dash.common.save')}</button></div>
          </form>
        </Modal>
      )}
    </div>
  )
}
