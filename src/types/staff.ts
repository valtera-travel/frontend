import type { Lang, Page } from './api'

export type Tr<T> = Record<Lang, T>
export type InquiryStatus = 'NEW' | 'CONTACTED' | 'OFFER_SENT' | 'CONVERTED' | 'CLOSED'
export const STATUSES: InquiryStatus[] = ['NEW', 'CONTACTED', 'OFFER_SENT', 'CONVERTED', 'CLOSED']
export type Role = 'STAFF' | 'MANAGER'

export interface AuthUser { id: number; name: string; email: string; role: Role }

export interface DestinationTr { name: string; region: string; description: string }
export interface StaffDestination { id: number; imageUrl: string; isActive: boolean; translations: Tr<DestinationTr> }
export interface DestinationInput { imageUrl: string; translations: Tr<DestinationTr> }

export interface PackageTr { name: string; description: string; highlights: string }
export interface StaffPackage {
  id: number; destinationId: number; pricePerPerson: number; durationDays: number
  imageUrl: string; isActive: boolean; inquiryCount: number; translations: Tr<PackageTr>
}
export interface PackageInput { destinationId: number; pricePerPerson: number; durationDays: number; imageUrl: string; translations: Tr<PackageTr> }

export interface StaffSchedule { id: number; packageId: number; departureDate: string; returnDate: string; isActive: boolean }
export interface ScheduleInput { departureDate: string; returnDate: string }

export interface InclusionTr { itemName: string; description: string }
export interface StaffInclusion { id: number; packageId: number; displayOrder: number; translations: Tr<InclusionTr> }
export interface InclusionInput { displayOrder: number; translations: Tr<InclusionTr> }

export interface StaffMember { id: number; name: string }

export interface StaffInquiry {
  id: number; packageId: number | null; packageName: string | null
  customerName: string; email: string | null; phone: string | null
  requestedDestination: string | null; numTravelers: number; preferredDeparture: string
  estimatedBudget: number | null; message: string | null; submissionLanguage: Lang
  status: InquiryStatus; followUpNotes: string | null
  assignedStaffId: number | null; assignedStaffName: string | null; createdAt: string
}
export interface InquiryFilter {
  from?: string; to?: string; status?: InquiryStatus | ''; packageId?: number
  assignedStaffId?: number; language?: Lang | ''; page?: number; size?: number
}

export interface ReportQuery { from?: string; to?: string; lang: Lang }
export interface ManagerReport {
  total: number
  byStatus: Record<InquiryStatus, number>
  topPackages: { id: number; name: string; count: number }[]
  topDestinations: { name: string; count: number }[]
  byLanguage: Record<Lang, number>
  byPeriod: { period: string; count: number }[]
}

export interface StaffApi {
  listDestinations(): Promise<StaffDestination[]>
  saveDestination(id: number | null, input: DestinationInput): Promise<StaffDestination>
  setDestinationActive(id: number, active: boolean): Promise<StaffDestination>
  listPackages(): Promise<StaffPackage[]>
  savePackage(id: number | null, input: PackageInput): Promise<StaffPackage>
  setPackageActive(id: number, active: boolean): Promise<StaffPackage>
  listSchedules(packageId: number): Promise<StaffSchedule[]>
  saveSchedule(packageId: number, id: number | null, input: ScheduleInput): Promise<StaffSchedule>
  setScheduleActive(id: number, active: boolean): Promise<StaffSchedule>
  listInclusions(packageId: number): Promise<StaffInclusion[]>
  saveInclusion(packageId: number, id: number | null, input: InclusionInput): Promise<StaffInclusion>
  deleteInclusion(id: number): Promise<void>
  listStaff(): Promise<StaffMember[]>
  listInquiries(f: InquiryFilter): Promise<Page<StaffInquiry>>
  updateInquiryStatus(id: number, status: InquiryStatus): Promise<StaffInquiry>
  assignInquiry(id: number, staffId: number | null): Promise<StaffInquiry>
  updateInquiryNotes(id: number, notes: string): Promise<StaffInquiry>
}
export interface ManagerApi {
  report(q: ReportQuery): Promise<ManagerReport>
  exportCsv(q: ReportQuery): Promise<Blob>
}
export interface AuthApi {
  login(email: string, password: string): Promise<AuthUser>
  logout(): Promise<void>
  me(): Promise<AuthUser | null>
}
