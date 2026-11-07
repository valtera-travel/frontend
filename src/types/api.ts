// Bentuk data mengikuti kontrak REST API di SRS Bab X. Teks sudah diterjemahkan oleh backend sesuai ?lang=
export type Lang = 'id' | 'en'

export interface ApiResponse<T> { success: boolean; message: string; data: T; errors?: string[] }
export interface Page<T> { content: T[]; page: number; size: number; totalElements: number; totalPages: number }

export interface Destination { id: number; name: string; region: string; description: string; imageUrl: string }

export interface PackageSummary {
  id: number; destinationId: number; destinationName: string; region: string
  name: string; highlights: string; pricePerPerson: number; durationDays: number; imageUrl: string
}
export interface Schedule { id: number; departureDate: string; returnDate: string }
export interface Inclusion { id: number; itemName: string; description: string }
export interface PackageDetail extends PackageSummary {
  description: string; schedules: Schedule[]; inclusions: Inclusion[]
}

export type PackageSort = 'price_asc' | 'price_desc' | 'name_asc' | 'inquiries_desc'
export interface PackageQuery {
  lang: Lang; keyword?: string; destinationId?: number; region?: string
  maxPrice?: number; month?: number; sort?: PackageSort; page?: number; size?: number
}

export interface InquiryRequest {
  customerName: string; email: string | null; phone: string | null
  packageId: number | null; destinationId: number | null; requestedDestination: string | null
  numTravelers: number; preferredDeparture: string; estimatedBudget: number | null
  message: string | null; submissionLanguage: Lang
}
export interface InquiryResult { inquiryId: number; status: 'NEW' }
