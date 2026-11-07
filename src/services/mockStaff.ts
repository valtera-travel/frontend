// Implementasi in-memory /api/staff/* dengan aturan bisnis SRS (BAB IV). Backend nyata tetap sumber kebenaran.
import i18n from '../i18n'
import type { Lang, Page } from '../types/api'
import type { InquiryFilter, StaffApi, StaffDestination, StaffInclusion, StaffInquiry, StaffPackage, StaffSchedule, Tr } from '../types/staff'
import { destinations, inclusionRows, packages, schedules, type MDestination, type MInclusion, type MPackage } from './mockData'
import { destComplete, pkgComplete, inquiryCount } from './mockApi'
import { inquiries, users, type MInquiry } from './mockStore'
import { ApiError } from './http'

const delay = <T,>(v: T, ms = 150) => new Promise<T>((r) => setTimeout(() => r(v), ms))
const err = (key: string, status = 400) => new ApiError(i18n.t(`dash.err.${key}`), status)
const lang = (): Lang => (i18n.language === 'en' ? 'en' : 'id')
const trOf = <T,>(t: Tr<T>): Tr<T> => ({ id: { ...t.id }, en: { ...t.en } })
const filled = (o: object) => Object.values(o as Record<string, string>).every((v) => String(v).trim() !== '')

const dOut = (d: MDestination): StaffDestination => ({ id: d.id, imageUrl: d.imageUrl, isActive: d.isActive, translations: trOf(d.tr) })
const pOut = (p: MPackage): StaffPackage => ({ id: p.id, destinationId: p.destinationId, pricePerPerson: p.pricePerPerson, durationDays: p.durationDays, imageUrl: p.imageUrl, isActive: p.isActive, inquiryCount: inquiryCount(p.id), translations: trOf(p.tr) })
const sOut = (s: (typeof schedules)[number]): StaffSchedule => ({ id: s.id, packageId: s.packageId, departureDate: s.departureDate, returnDate: s.returnDate, isActive: s.isActive })
const iOut = (i: MInclusion): StaffInclusion => ({ id: i.id, packageId: i.packageId, displayOrder: i.order, translations: trOf(i.tr) })
const qOut = (i: MInquiry): StaffInquiry => {
  const p = packages.find((x) => x.id === i.packageId)
  const u = users.find((x) => x.id === i.assignedStaffId)
  return { id: i.id, packageId: i.packageId, packageName: p ? p.tr[lang()].name : null, customerName: i.customerName, email: i.email, phone: i.phone,
    requestedDestination: (i.destinationId != null ? destinations.find((d) => d.id === i.destinationId)?.tr[lang()].name : undefined) ?? i.requestedDestination, numTravelers: i.numTravelers, preferredDeparture: i.preferredDeparture, estimatedBudget: i.estimatedBudget,
    message: i.message, submissionLanguage: i.submissionLanguage, status: i.status, followUpNotes: i.followUpNotes,
    assignedStaffId: i.assignedStaffId, assignedStaffName: u?.name ?? null, createdAt: i.createdAt }
}
const find = <T extends { id: number }>(arr: T[], id: number) => { const x = arr.find((a) => a.id === id); if (!x) throw err('notFound', 404); return x }
const nid = (arr: { id: number }[]) => Math.max(0, ...arr.map((a) => a.id)) + 1

export const mockStaff: StaffApi = {
  listDestinations: () => delay(destinations.map(dOut)),
  async saveDestination(id, input) {
    if (!input.translations.id.name.trim() || !input.translations.en.name.trim()) throw err('nameRequired')
    let d: MDestination
    if (id == null) { d = { id: nid(destinations), imageUrl: input.imageUrl, isActive: false, tr: trOf(input.translations) }; destinations.push(d) }
    else { d = find(destinations, id); d.imageUrl = input.imageUrl; d.tr = trOf(input.translations); if (d.isActive && !destComplete(d)) d.isActive = false }
    return delay(dOut(d))
  },
  async setDestinationActive(id, active) {
    const d = find(destinations, id)
    if (active && !destComplete(d)) throw err('incomplete') // tidak boleh aktif tanpa terjemahan lengkap (FR-09)
    d.isActive = active
    return delay(dOut(d))
  },

  listPackages: () => delay(packages.map(pOut)),
  async savePackage(id, input) {
    if (!destinations.some((d) => d.id === input.destinationId)) throw err('destinationRequired')
    if (!(input.pricePerPerson >= 0)) throw err('price')
    if (!(input.durationDays >= 1)) throw err('duration')
    if (!input.translations.id.name.trim() || !input.translations.en.name.trim()) throw err('nameRequired')
    let p: MPackage
    if (id == null) { p = { id: nid(packages), destinationId: input.destinationId, pricePerPerson: input.pricePerPerson, durationDays: input.durationDays, imageUrl: input.imageUrl, isActive: false, inquiryCount: 0, tr: trOf(input.translations) }; packages.push(p) }
    else { p = find(packages, id); Object.assign(p, { destinationId: input.destinationId, pricePerPerson: input.pricePerPerson, durationDays: input.durationDays, imageUrl: input.imageUrl, tr: trOf(input.translations) }); if (p.isActive && !pkgComplete(p)) p.isActive = false }
    return delay(pOut(p))
  },
  async setPackageActive(id, active) {
    const p = find(packages, id)
    if (active && !pkgComplete(p)) throw err('incomplete')
    p.isActive = active
    return delay(pOut(p))
  },

  listSchedules: (pid) => delay(schedules.filter((s) => s.packageId === pid).sort((a, b) => a.departureDate.localeCompare(b.departureDate)).map(sOut)),
  async saveSchedule(pid, id, input) {
    find(packages, pid)
    if (!input.departureDate || !input.returnDate || input.returnDate < input.departureDate) throw err('scheduleDates')
    let s
    if (id == null) { s = { id: nid(schedules), packageId: pid, departureDate: input.departureDate, returnDate: input.returnDate, isActive: true }; schedules.push(s) }
    else { s = find(schedules, id); s.departureDate = input.departureDate; s.returnDate = input.returnDate }
    return delay(sOut(s))
  },
  async setScheduleActive(id, active) { const s = find(schedules, id); s.isActive = active; return delay(sOut(s)) },

  listInclusions: (pid) => delay(inclusionRows.filter((i) => i.packageId === pid).sort((a, b) => a.order - b.order).map(iOut)),
  async saveInclusion(pid, id, input) {
    find(packages, pid)
    if (!filled(input.translations.id) || !filled(input.translations.en)) throw err('inclusionBoth')
    let i: MInclusion
    if (id == null) { i = { id: nid(inclusionRows), packageId: pid, order: input.displayOrder, tr: trOf(input.translations) }; inclusionRows.push(i) }
    else { i = find(inclusionRows, id); i.order = input.displayOrder; i.tr = trOf(input.translations) }
    return delay(iOut(i))
  },
  async deleteInclusion(id) { const i = inclusionRows.findIndex((x) => x.id === id); if (i < 0) throw err('notFound', 404); inclusionRows.splice(i, 1); await delay(null) },

  listStaff: () => delay(users.filter((u) => u.role === 'STAFF' && u.isActive).map((u) => ({ id: u.id, name: u.name }))),

  async listInquiries(f: InquiryFilter): Promise<Page<StaffInquiry>> {
    const list = inquiries.filter((i) => {
      const day = i.createdAt.slice(0, 10)
      if (f.from && day < f.from) return false
      if (f.to && day > f.to) return false
      if (f.status && i.status !== f.status) return false
      if (f.packageId && i.packageId !== f.packageId) return false
      if (f.assignedStaffId && i.assignedStaffId !== f.assignedStaffId) return false
      if (f.language && i.submissionLanguage !== f.language) return false
      return true
    }).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    const size = f.size ?? 10, page = f.page ?? 0
    return delay({ content: list.slice(page * size, page * size + size).map(qOut), page, size, totalElements: list.length, totalPages: Math.max(1, Math.ceil(list.length / size)) })
  },
  async updateInquiryStatus(id, status) { const i = find(inquiries, id); i.status = status; return delay(qOut(i)) },
  async assignInquiry(id, staffId) {
    const i = find(inquiries, id)
    if (staffId != null && !users.some((u) => u.id === staffId && u.role === 'STAFF')) throw err('notFound', 404)
    i.assignedStaffId = staffId
    return delay(qOut(i))
  },
  async updateInquiryNotes(id, notes) { const i = find(inquiries, id); i.followUpNotes = notes.trim() || null; return delay(qOut(i)) },
}
