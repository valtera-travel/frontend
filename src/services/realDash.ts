import i18n from '../i18n'
import type { Lang, Page } from '../types/api'
import type { AuthApi, AuthUser, InquiryFilter, ManagerApi, ManagerReport, ReportQuery, StaffApi, StaffDestination, StaffInclusion, StaffInquiry, StaffMember, StaffPackage, StaffSchedule } from '../types/staff'
import { ApiError, http, httpBlob, qs } from './http'

const L = (): Lang => (i18n.language === 'en' ? 'en' : 'id')
const body = (o: unknown) => JSON.stringify(o)

export const realAuth: AuthApi = {
  login: (email, password) => http<AuthUser>('/api/auth/login', L(), { method: 'POST', body: body({ email, password }) }),
  logout: () => http<void>('/api/auth/logout', L(), { method: 'POST' }),
  me: async () => {
    try { return await http<AuthUser>('/api/auth/me', L()) } catch (e) {
      if (e instanceof ApiError && (e.status === 401 || e.status === 403)) return null
      throw e
    }
  },
}

export const realStaff: StaffApi = {
  listDestinations: () => http<StaffDestination[]>('/api/staff/destinations', L()),
  saveDestination: (id, i) => http<StaffDestination>(id ? `/api/staff/destinations/${id}` : '/api/staff/destinations', L(), { method: id ? 'PUT' : 'POST', body: body(i) }),
  setDestinationActive: (id, isActive) => http<StaffDestination>(`/api/staff/destinations/${id}/status`, L(), { method: 'PATCH', body: body({ isActive }) }),
  listPackages: () => http<StaffPackage[]>('/api/staff/packages', L()),
  savePackage: (id, i) => http<StaffPackage>(id ? `/api/staff/packages/${id}` : '/api/staff/packages', L(), { method: id ? 'PUT' : 'POST', body: body(i) }),
  setPackageActive: (id, isActive) => http<StaffPackage>(`/api/staff/packages/${id}/status`, L(), { method: 'PATCH', body: body({ isActive }) }),
  // GET jadwal/fasilitas/staf adalah endpoint tambahan di luar daftar SRS (lihat README)
  listSchedules: (pid) => http<StaffSchedule[]>(`/api/staff/packages/${pid}/schedules`, L()),
  saveSchedule: (pid, id, i) => http<StaffSchedule>(id ? `/api/staff/schedules/${id}` : `/api/staff/packages/${pid}/schedules`, L(), { method: id ? 'PUT' : 'POST', body: body(i) }),
  setScheduleActive: (id, isActive) => http<StaffSchedule>(`/api/staff/schedules/${id}/status`, L(), { method: 'PATCH', body: body({ isActive }) }),
  listInclusions: (pid) => http<StaffInclusion[]>(`/api/staff/packages/${pid}/inclusions`, L()),
  saveInclusion: (pid, id, i) => http<StaffInclusion>(id ? `/api/staff/inclusions/${id}` : `/api/staff/packages/${pid}/inclusions`, L(), { method: id ? 'PUT' : 'POST', body: body(i) }),
  deleteInclusion: (id) => http<void>(`/api/staff/inclusions/${id}`, L(), { method: 'DELETE' }),
  listStaff: () => http<StaffMember[]>('/api/staff/members', L()),
  listInquiries: (f: InquiryFilter) => http<Page<StaffInquiry>>(`/api/staff/inquiries${qs({ ...f, lang: L() })}`, L()),
  updateInquiryStatus: (id, status) => http<StaffInquiry>(`/api/staff/inquiries/${id}/status`, L(), { method: 'PATCH', body: body({ status }) }),
  assignInquiry: (id, assignedStaffId) => http<StaffInquiry>(`/api/staff/inquiries/${id}/assign`, L(), { method: 'PATCH', body: body({ assignedStaffId }) }),
  updateInquiryNotes: (id, followUpNotes) => http<StaffInquiry>(`/api/staff/inquiries/${id}/notes`, L(), { method: 'PATCH', body: body({ followUpNotes }) }),
}

export const realManager: ManagerApi = {
  report: (q: ReportQuery) => http<ManagerReport>(`/api/manager/dashboard${qs({ ...q })}`, q.lang),
  exportCsv: (q: ReportQuery) => httpBlob(`/api/manager/reports/inquiries/export${qs({ ...q })}`, q.lang),
}
