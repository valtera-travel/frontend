import type { ApiResponse, Lang } from '../types/api'

export class ApiError extends Error {
  constructor(message: string, public status = 0, public errors: string[] = []) { super(message) }
}

const BASE = (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? ''

// Spring Security (session cookie HttpOnly + CSRF cookie XSRF-TOKEN) — SRS 12.1
const csrf = () => document.cookie.split('; ').find((c) => c.startsWith('XSRF-TOKEN='))?.split('=')[1]

function headers(lang: Lang, method: string, extra?: HeadersInit): Record<string, string> {
  const h: Record<string, string> = { 'Content-Type': 'application/json', 'Accept-Language': lang, ...(extra as Record<string, string> | undefined) }
  const token = csrf()
  if (token && method !== 'GET') h['X-XSRF-TOKEN'] = decodeURIComponent(token)
  return h
}

export async function httpBlob(path: string, lang: Lang): Promise<Blob> {
  const res = await fetch(`${BASE}${path}`, { credentials: 'include', headers: headers(lang, 'GET') })
  if (!res.ok) throw new ApiError(res.statusText, res.status)
  return res.blob()
}

export async function http<T>(path: string, lang: Lang, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${BASE}${path}`, {
      credentials: 'include',
      ...init,
      headers: headers(lang, (init?.method ?? 'GET').toUpperCase(), init?.headers),
    })
  } catch {
    throw new ApiError('Network error', 0)
  }
  let body: ApiResponse<T> | null = null
  try { body = (await res.json()) as ApiResponse<T> } catch { /* body kosong */ }
  if (!res.ok || !body?.success) throw new ApiError(body?.message ?? res.statusText, res.status, body?.errors ?? [])
  return body.data
}

export const qs = (o: Record<string, string | number | undefined | null>) => {
  const p = new URLSearchParams()
  Object.entries(o).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') p.set(k, String(v)) })
  const s = p.toString()
  return s ? `?${s}` : ''
}
