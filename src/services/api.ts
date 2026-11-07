import type { Destination, InquiryRequest, InquiryResult, Lang, Page, PackageDetail, PackageQuery, PackageSummary, Schedule } from '../types/api'
import { http, qs } from './http'
import { mockApi } from './mockApi'

// VITE_USE_MOCK=false -> memakai backend Spring Boot (/api/public/...)
const USE_MOCK = (import.meta.env.VITE_USE_MOCK as string | undefined) !== 'false'

const real = {
  getDestinations: (lang: Lang) => http<Destination[]>(`/api/public/destinations${qs({ lang })}`, lang),
  getDestination: (id: number, lang: Lang) => http<Destination>(`/api/public/destinations/${id}${qs({ lang })}`, lang),
  getPackages: (q: PackageQuery) => http<Page<PackageSummary>>(`/api/public/packages${qs({ ...q })}`, q.lang),
  getPackage: (id: number, lang: Lang) => http<PackageDetail>(`/api/public/packages/${id}${qs({ lang })}`, lang),
  getSchedules: (id: number, lang: Lang) => http<Schedule[]>(`/api/public/packages/${id}/schedules${qs({ lang })}`, lang),
  submitInquiry: (body: InquiryRequest) =>
    http<InquiryResult>(`/api/public/inquiries${qs({ lang: body.submissionLanguage })}`, body.submissionLanguage, { method: 'POST', body: JSON.stringify(body) }),
}

export const api = USE_MOCK ? mockApi : real
