import { mockAuth } from './mockAuth'
import { mockManager } from './mockManager'
import { mockStaff } from './mockStaff'
import { realAuth, realManager, realStaff } from './realDash'
import type { AuthApi, ManagerApi, StaffApi } from '../types/staff'

export const USE_MOCK = (import.meta.env.VITE_USE_MOCK as string | undefined) !== 'false'
export const authApi: AuthApi = USE_MOCK ? mockAuth : realAuth
export const staffApi: StaffApi = USE_MOCK ? mockStaff : realStaff
export const managerApi: ManagerApi = USE_MOCK ? mockManager : realManager
