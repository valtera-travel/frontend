import type { Lang } from '../types/api'

const locale = (l: Lang) => (l === 'id' ? 'id-ID' : 'en-US')

// Nilai harga di database tetap satu; hanya format tampilan yang berubah, tanpa konversi mata uang (SRS 11.5)
export const formatPrice = (n: number, l: Lang) =>
  new Intl.NumberFormat(locale(l), { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)

export const formatDate = (iso: string, l: Lang) =>
  new Intl.DateTimeFormat(locale(l), { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(iso + 'T00:00:00Z'))

export const monthName = (m: number, l: Lang) =>
  new Intl.DateTimeFormat(locale(l), { month: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(2027, m - 1, 1)))

export const formatMonth = (period: string, l: Lang) =>
  new Intl.DateTimeFormat(locale(l), { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(period + '-01T00:00:00Z'))

export const formatDateTime = (iso: string, l: Lang) =>
  new Intl.DateTimeFormat(locale(l), { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso))
