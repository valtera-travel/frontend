import i18n from '../i18n'
import type { AuthApi, AuthUser } from '../types/staff'
import { ApiError } from './http'
import { users } from './mockStore'

const KEY = 'valtera.mock.session'
const delay = <T,>(v: T, ms = 300) => new Promise<T>((r) => setTimeout(() => r(v), ms))
const pub = ({ id, name, email, role }: (typeof users)[number]): AuthUser => ({ id, name, email, role })

export const mockAuth: AuthApi = {
  async login(email, password) {
    await delay(null)
    const u = users.find((x) => x.email.toLowerCase() === email.trim().toLowerCase())
    if (!u || u.password !== password) throw new ApiError(i18n.t('dash.err.credentials'), 401)
    if (!u.isActive) throw new ApiError(i18n.t('dash.err.inactive'), 403)
    sessionStorage.setItem(KEY, String(u.id))
    return pub(u)
  },
  async logout() { sessionStorage.removeItem(KEY) },
  async me() {
    const id = Number(sessionStorage.getItem(KEY))
    const u = users.find((x) => x.id === id && x.isActive)
    return delay(u ? pub(u) : null, 100)
  },
}
