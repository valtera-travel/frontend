// Implementasi in-memory dari kontrak /api/public/* agar frontend bisa dijalankan tanpa backend.
// Aturan bisnis yang sama (SRS Bab IV) sengaja diulang di sini; sumber kebenaran tetap backend Spring Boot.
import type { Destination, InquiryRequest, InquiryResult, Lang, Page, PackageDetail, PackageQuery, PackageSummary, Schedule } from '../types/api'
import { destinations, inclusionRows, packages, schedules } from './mockData'
import { ApiError } from './http'
import { inquiries, nextInquiryId } from './mockStore'

const delay = <T,>(v: T, ms = 250) => new Promise<T>((r) => setTimeout(() => r(v), ms))
const L = (l: Lang): Lang => (l === 'en' ? 'en' : 'id')

const activeDest = () => destinations.filter((d) => d.isActive && destComplete(d))
const toDest = (d: (typeof destinations)[number], l: Lang): Destination => ({ id: d.id, imageUrl: d.imageUrl, ...d.tr[L(l)] })

const full = (o: Record<string, string>) => Object.values(o).every((v) => v.trim() !== '')
export const destComplete = (d: (typeof destinations)[number]) => full(d.tr.id) && full(d.tr.en)
export const pkgComplete = (p: (typeof packages)[number]) => full(p.tr.id) && full(p.tr.en)
export const inquiryCount = (packageId: number) => inquiries.filter((i) => i.packageId === packageId).length

function visiblePackages() {
  // Paket publik: paket aktif + destinasi aktif + terjemahan lengkap kedua bahasa (SRS FR-02)
  return packages.filter((p) => p.isActive && pkgComplete(p) && activeDest().some((d) => d.id === p.destinationId))
}
function toSummary(p: (typeof packages)[number], l: Lang): PackageSummary {
  const d = destinations.find((x) => x.id === p.destinationId)!
  const t = p.tr[L(l)]
  return { id: p.id, destinationId: d.id, destinationName: d.tr[L(l)].name, region: d.tr[L(l)].region, name: t.name, highlights: t.highlights, pricePerPerson: p.pricePerPerson, durationDays: p.durationDays, imageUrl: p.imageUrl }
}
const activeSchedules = (packageId: number): Schedule[] =>
  schedules.filter((s) => s.packageId === packageId && s.isActive).map(({ id, departureDate, returnDate }) => ({ id, departureDate, returnDate }))

export const mockApi = {
  getDestinations: (lang: Lang) => delay(activeDest().map((d) => toDest(d, lang))),

  getDestination(id: number, lang: Lang) {
    const d = activeDest().find((x) => x.id === id)
    return d ? delay(toDest(d, lang)) : Promise.reject(new ApiError(lang === 'en' ? 'Data not found.' : 'Data tidak ditemukan.', 404))
  },

  getPackages(q: PackageQuery): Promise<Page<PackageSummary>> {
    const kw = q.keyword?.trim().toLowerCase()
    let list = visiblePackages().filter((p) => {
      const t = p.tr[L(q.lang)]
      const d = destinations.find((x) => x.id === p.destinationId)!
      if (q.destinationId && p.destinationId !== q.destinationId) return false
      if (q.region && d.tr[L(q.lang)].region.toLowerCase() !== q.region.toLowerCase()) return false
      if (q.maxPrice != null && p.pricePerPerson > q.maxPrice) return false
      if (q.month && !activeSchedules(p.id).some((s) => new Date(s.departureDate).getUTCMonth() + 1 === q.month)) return false
      if (kw && !(`${t.name} ${t.description} ${d.tr[L(q.lang)].name}`.toLowerCase().includes(kw))) return false
      return true
    })
    const cmp: Record<string, (a: (typeof list)[number], b: (typeof list)[number]) => number> = {
      price_asc: (a, b) => a.pricePerPerson - b.pricePerPerson,
      price_desc: (a, b) => b.pricePerPerson - a.pricePerPerson,
      name_asc: (a, b) => a.tr[L(q.lang)].name.localeCompare(b.tr[L(q.lang)].name),
      inquiries_desc: (a, b) => inquiryCount(b.id) - inquiryCount(a.id), // minat = jumlah inquiry, bukan skor manual
    }
    list = [...list].sort(cmp[q.sort ?? 'inquiries_desc'])
    const size = q.size ?? 9, page = q.page ?? 0
    return delay({ content: list.slice(page * size, page * size + size).map((p) => toSummary(p, q.lang)), page, size, totalElements: list.length, totalPages: Math.max(1, Math.ceil(list.length / size)) })
  },

  getPackage(id: number, lang: Lang): Promise<PackageDetail> {
    const p = visiblePackages().find((x) => x.id === id)
    if (!p) return Promise.reject(new ApiError(lang === 'en' ? 'Data not found.' : 'Data tidak ditemukan.', 404))
    return delay({
      ...toSummary(p, lang), description: p.tr[L(lang)].description, schedules: activeSchedules(p.id),
      inclusions: inclusionRows.filter((i) => i.packageId === p.id).sort((a, b) => a.order - b.order).map((i) => ({ id: i.id, ...i.tr[L(lang)] })),
    })
  },

  submitInquiry(body: InquiryRequest): Promise<InquiryResult> {
    const en = body.submissionLanguage === 'en'
    const errors: string[] = []
    if (!body.customerName.trim()) errors.push(en ? 'Name is required.' : 'Nama wajib diisi.')
    if (!body.email && !body.phone) errors.push(en ? 'Provide an email or a phone number.' : 'Isi email atau nomor telepon.')
    if (body.numTravelers < 1) errors.push(en ? 'At least 1 traveler is required.' : 'Jumlah peserta minimal 1.')
    if (new Date(body.preferredDeparture) < new Date(new Date().toDateString())) errors.push(en ? 'Departure date cannot be in the past.' : 'Tanggal keberangkatan tidak boleh di masa lalu.')
    if (body.packageId == null) {
      if (body.destinationId != null) {
        if (!activeDest().some((d) => d.id === body.destinationId)) errors.push(en ? 'The selected destination is not available.' : 'Destinasi yang dipilih tidak tersedia.')
      } else if (!body.requestedDestination?.trim()) errors.push(en ? 'Desired destination is required.' : 'Destinasi yang diinginkan wajib diisi.')
    }
    if (body.packageId != null && !visiblePackages().some((p) => p.id === body.packageId)) errors.push(en ? 'Selected package is not available.' : 'Paket yang dipilih tidak tersedia.')
    if (errors.length) return delay(null).then(() => { throw new ApiError(errors[0], 400, errors) })
    const id = nextInquiryId()
    inquiries.unshift({
      id, packageId: body.packageId, assignedStaffId: null, customerName: body.customerName.trim(), email: body.email, phone: body.phone,
      destinationId: body.packageId == null ? body.destinationId : null,
      requestedDestination: body.packageId == null && body.destinationId == null ? body.requestedDestination : null, numTravelers: body.numTravelers,
      preferredDeparture: body.preferredDeparture, estimatedBudget: body.estimatedBudget, message: body.message,
      submissionLanguage: body.submissionLanguage === 'en' ? 'en' : 'id', status: 'NEW', followUpNotes: null, createdAt: new Date().toISOString(),
    })
    return delay({ inquiryId: id, status: 'NEW' as const }, 500)
  },
}
