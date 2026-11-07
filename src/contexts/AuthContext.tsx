import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { authApi } from '../services/dash'
import type { AuthUser } from '../types/staff'

interface AuthCtx { user: AuthUser | null; loading: boolean; login: (email: string, password: string) => Promise<AuthUser>; logout: () => Promise<void> }
const Ctx = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let alive = true
    authApi.me().then((u) => alive && setUser(u), () => alive && setUser(null)).finally(() => alive && setLoading(false))
    return () => { alive = false }
  }, [])

  const login = useCallback(async (email: string, password: string) => { const u = await authApi.login(email, password); setUser(u); return u }, [])
  const logout = useCallback(async () => { try { await authApi.logout() } finally { setUser(null) } }, [])
  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useAuth() {
  const c = useContext(Ctx)
  if (!c) throw new Error('useAuth must be used within AuthProvider')
  return c
}
