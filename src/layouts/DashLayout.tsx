import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import LanguageSwitcher from '../components/LanguageSwitcher'
import Logo from '../components/Logo'
import DemoBanner from '../components/DemoBanner'

export default function DashLayout() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const nav = useNavigate()
  const items: [string, string][] = user?.role === 'MANAGER'
    ? [['/manager', t('dash.menu.reports')]]
    : [['/staff', t('dash.menu.dashboard')], ['/staff/destinations', t('dash.menu.destinations')], ['/staff/packages', t('dash.menu.packages')], ['/staff/inquiries', t('dash.menu.inquiries')]]

  const out = async () => { await logout(); nav('/login', { replace: true }) }
  const link = ({ isActive }: { isActive: boolean }) => `block whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold ${isActive ? 'bg-white text-ink' : 'text-white/75 hover:bg-white/10 hover:text-white'}`

  return (
    <div className="min-h-screen md:grid md:grid-cols-[240px_1fr]">
      <DemoBanner />
      <aside className="bg-sea-dark p-4 text-white md:sticky md:top-0 md:h-screen md:p-5">
        <Link to="/" className="mb-4 block md:mb-8"><Logo className="text-white" /></Link>
        <nav className="flex gap-2 overflow-x-auto md:flex-col">
          {items.map(([to, l]) => <NavLink key={to} to={to} end={to === '/staff' || to === '/manager'} className={link}>{l}</NavLink>)}
        </nav>
        <Link to="/" className="mt-4 hidden text-sm text-white/60 hover:text-white md:mt-8 md:block">↗ {t('dash.publicSite')}</Link>
      </aside>
      <div className="min-w-0">
        <header className="flex flex-wrap items-center justify-end gap-3 border-b border-ink/10 bg-white px-5 py-3">
          <LanguageSwitcher />
          <span className="text-sm"><b>{user?.name}</b> <span className="text-ink/50">· {user && t(`dash.role.${user.role}`)}</span></span>
          <button onClick={out} className="rounded-full border border-ink/15 px-4 py-1.5 text-sm font-semibold hover:bg-sand">{t('dash.logout')}</button>
        </header>
        <main className="p-5 md:p-8"><Outlet /></main>
      </div>
    </div>
  )
}
