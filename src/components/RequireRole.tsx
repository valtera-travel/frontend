import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import type { Role } from '../types/staff'
import { Loading } from './State'

export const homeFor = (r: Role) => (r === 'MANAGER' ? '/manager' : '/staff')

// Hanya UX: pemeriksaan hak akses yang sebenarnya ada di backend (SRS 2.4)
export default function RequireRole({ role }: { role: Role }) {
  const { user, loading } = useAuth()
  const loc = useLocation()
  if (loading) return <Loading />
  if (!user) return <Navigate to="/login" replace state={{ from: loc.pathname }} />
  if (user.role !== role) return <Navigate to={homeFor(user.role)} replace />
  return <Outlet />
}
