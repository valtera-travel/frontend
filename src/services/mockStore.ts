// State mutable untuk mode mock: inquiry & akun internal. Hanya untuk demo; produksi memakai PostgreSQL.
import type { Lang } from '../types/api'
import type { InquiryStatus, Role } from '../types/staff'

export interface MInquiry {
  id: number; packageId: number | null; assignedStaffId: number | null; customerName: string
  email: string | null; phone: string | null; destinationId: number | null; requestedDestination: string | null
  numTravelers: number; preferredDeparture: string; estimatedBudget: number | null; message: string | null
  submissionLanguage: Lang; status: InquiryStatus; followUpNotes: string | null; createdAt: string
}
export interface MUser { id: number; name: string; email: string; password: string; role: Role; isActive: boolean }

// Hanya akun demo untuk mode mock. Akun nyata dibuat di backend (password di-hash BCrypt).
export const users: MUser[] = [
  { id: 1, name: 'Sinta (Staff)', email: 'staff@valteratravel.test', password: 'demo12345', role: 'STAFF', isActive: true },
  { id: 2, name: 'Budi (Staff)', email: 'staff2@valteratravel.test', password: 'demo12345', role: 'STAFF', isActive: true },
  { id: 3, name: 'Maya (Manager)', email: 'manager@valteratravel.test', password: 'demo12345', role: 'MANAGER', isActive: true },
]

const names = ['Andi', 'Rina', 'Dimas', 'Sarah', 'Hartono', 'Wulan', 'Kevin', 'Putri', 'Michael', 'Emma', 'Bagus', 'Lina', 'Oliver', 'Sari']
const pkgPool = [1, 1, 1, 1, 1, 3, 3, 3, 3, 2, 2, 2, 5, 5, 4, 6, null, null]
const statuses: InquiryStatus[] = ['NEW', 'NEW', 'NEW', 'CONTACTED', 'CONTACTED', 'OFFER_SENT', 'CONVERTED', 'CLOSED']
let seed = 7
const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648

export const inquiries: MInquiry[] = Array.from({ length: 36 }, (_, i) => {
  const created = new Date(Date.now() - Math.floor(rnd() * 100) * 86400000 - i * 3600000)
  const dep = new Date(Date.now() + (20 + Math.floor(rnd() * 150)) * 86400000)
  const pkg = pkgPool[Math.floor(rnd() * pkgPool.length)]
  const n = names[i % names.length]
  const lang: Lang = rnd() > 0.45 ? 'id' : 'en'
  return {
    id: 100 + i, packageId: pkg, assignedStaffId: i % 3 === 0 ? null : (i % 2) + 1, customerName: `${n} ${String.fromCharCode(65 + (i % 26))}.`,
    email: i % 4 === 0 ? null : `${n.toLowerCase()}${i}@email.com`, phone: i % 4 === 0 || i % 5 === 0 ? `08123${String(100000 + i * 37).slice(0, 6)}` : null,
    destinationId: pkg ? null : ([3, 1, null] as (number | null)[])[i % 3],
    requestedDestination: pkg || i % 3 !== 2 ? null : 'Seoul',
    numTravelers: 1 + Math.floor(rnd() * 6), preferredDeparture: dep.toISOString().slice(0, 10),
    estimatedBudget: i % 3 === 0 ? null : (3 + Math.floor(rnd() * 20)) * 1000000,
    message: lang === 'id' ? 'Mohon kirim informasi lebih lanjut.' : 'Please send me more information.',
    submissionLanguage: lang, status: statuses[Math.floor(rnd() * statuses.length)],
    followUpNotes: i % 6 === 0 ? 'Sudah dihubungi via WhatsApp.' : null, createdAt: created.toISOString(),
  }
}).sort((a, b) => b.createdAt.localeCompare(a.createdAt))

let nextId = 1000
export const nextInquiryId = () => nextId++
