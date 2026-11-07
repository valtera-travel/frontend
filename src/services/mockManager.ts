import i18n from '../i18n'
import type { Lang } from '../types/api'
import { STATUSES, type InquiryStatus, type ManagerApi, type ManagerReport, type ReportQuery } from '../types/staff'
import { destinations, packages } from './mockData'
import { inquiries, users } from './mockStore'

const delay = <T,>(v: T, ms = 250) => new Promise<T>((r) => setTimeout(() => r(v), ms))
const L = (l: Lang): Lang => (l === 'en' ? 'en' : 'id')
const inRange = (iso: string, q: ReportQuery) => { const d = iso.slice(0, 10); return (!q.from || d >= q.from) && (!q.to || d <= q.to) }

function build(q: ReportQuery): ManagerReport {
  const list = inquiries.filter((i) => inRange(i.createdAt, q))
  const byStatus = Object.fromEntries(STATUSES.map((s) => [s, 0])) as Record<InquiryStatus, number>
  const byLanguage: Record<Lang, number> = { id: 0, en: 0 }
  const pk = new Map<number, number>(), ds = new Map<number, number>(), per = new Map<string, number>()
  for (const i of list) {
    byStatus[i.status]++; byLanguage[i.submissionLanguage]++
    per.set(i.createdAt.slice(0, 7), (per.get(i.createdAt.slice(0, 7)) ?? 0) + 1)
    const p = packages.find((x) => x.id === i.packageId)
    if (p) pk.set(p.id, (pk.get(p.id) ?? 0) + 1)
    // Destinasi populer: dari paket, atau dari destinasi terdaftar yang dipilih pada inquiry tanpa paket
    const destId = p?.destinationId ?? i.destinationId
    if (destId != null) ds.set(destId, (ds.get(destId) ?? 0) + 1)
  }
  const top = <K,>(m: Map<K, number>) => [...m.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
  return {
    total: list.length, byStatus, byLanguage,
    topPackages: top(pk).map(([id, count]) => ({ id, count, name: packages.find((p) => p.id === id)!.tr[L(q.lang)].name })),
    topDestinations: top(ds).map(([id, count]) => ({ count, name: destinations.find((d) => d.id === id)!.tr[L(q.lang)].name })),
    byPeriod: [...per.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([period, count]) => ({ period, count })),
  }
}

const csvCell = (v: string | number | null) => `"${String(v ?? '').replace(/"/g, '""')}"`

export const mockManager: ManagerApi = {
  report: (q) => delay(build(q)),
  async exportCsv(q) {
    const lng = L(q.lang), loc = lng === 'id' ? 'id-ID' : 'en-US'
    const t = (k: string) => i18n.t(k, { lng })
    const dt = new Intl.DateTimeFormat(loc, { dateStyle: 'medium', timeStyle: 'short' }), d = new Intl.DateTimeFormat(loc, { dateStyle: 'long' }), n = new Intl.NumberFormat(loc)
    const head = ['id', 'created', 'customer', 'email', 'phone', 'package', 'destination', 'travelers', 'departure', 'budget', 'status', 'language', 'assigned', 'message'].map((k) => csvCell(t(`dash.csv.${k}`)))
    const rows = inquiries.filter((i) => inRange(i.createdAt, q)).map((i) => {
      const p = packages.find((x) => x.id === i.packageId)
      const refId = p?.destinationId ?? i.destinationId
      const dest = (refId != null ? destinations.find((x) => x.id === refId)?.tr[lng].name : undefined) ?? i.requestedDestination
      return [i.id, dt.format(new Date(i.createdAt)), i.customerName, i.email, i.phone, p?.tr[lng].name ?? '', dest, i.numTravelers,
        d.format(new Date(i.preferredDeparture + 'T00:00:00')), i.estimatedBudget == null ? '' : n.format(i.estimatedBudget), t(`status.${i.status}`),
        i.submissionLanguage.toUpperCase(), users.find((u) => u.id === i.assignedStaffId)?.name ?? '', i.message].map(csvCell).join(',')
    })
    return delay(new Blob(['\ufeff' + [head.join(','), ...rows].join('\r\n')], { type: 'text/csv;charset=utf-8' }))
  },
}
