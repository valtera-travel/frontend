import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from '../components/LanguageSwitcher'
import Logo from '../components/Logo'
import DemoBanner from '../components/DemoBanner'

export default function PublicLayout() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const [menu, setMenu] = useState(false)
  const overHero = pathname === '/'
  useEffect(() => { setMenu(false); window.scrollTo(0, 0) }, [pathname])

  const links: [string, string][] = [['/', t('nav.home')], ['/packages', t('nav.packages')], ['/destinations', t('nav.destinations')]]
  const textCls = overHero ? 'text-white' : 'text-ink'

  return (
    <div className="min-h-screen">
      <DemoBanner />
      <header className={`${overHero ? 'absolute inset-x-0 top-0' : 'bg-white shadow-sm'} z-30`}>
        <div className={`mx-auto flex max-w-7xl items-center justify-between px-5 py-5 ${textCls}`}>
          <Link to="/"><Logo /></Link>
          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            {links.map(([to, l]) => (
              <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `hover:opacity-100 ${isActive ? 'opacity-100 underline decoration-coral decoration-2 underline-offset-8' : 'opacity-80'}`}>{l}</NavLink>
            ))}
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <LanguageSwitcher dark={overHero} />
            <Link to="/inquiry" className={`rounded-full px-5 py-2.5 text-sm font-semibold ${overHero ? 'bg-white text-ink hover:bg-sand' : 'bg-coral text-white hover:brightness-95'}`}>{t('nav.contact')}</Link>
          </div>
          <button className="md:hidden" aria-label="Menu" aria-expanded={menu} onClick={() => setMenu(!menu)}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
          </button>
        </div>
        {menu && (
          <div className="mx-5 rounded-2xl bg-white p-4 text-ink shadow-xl md:hidden">
            {[...links, ['/inquiry', t('nav.contact')] as [string, string]].map(([to, l]) => (
              <Link key={to} to={to} className="block rounded-lg px-3 py-3 font-medium hover:bg-sand">{l}</Link>
            ))}
            <div className="px-3 pt-3"><LanguageSwitcher /></div>
          </div>
        )}
      </header>

      <main><Outlet /></main>

      <footer className="bg-ink py-12 text-sm text-white/70">
        <div className="mx-auto flex max-w-7xl flex-wrap justify-between gap-6 px-5">
          <div>
            <p className="text-xl text-white" style={{ fontFamily: 'var(--font-serif)' }}>ValteraTravel</p>
            <p className="mt-2">{t('footer.tagline')}</p>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-white">{t('footer.contact')}</p>
            <p>{t('footer.placeholderNote')}</p>
          </div>
          <p className="self-end"><Link to="/login" className="mr-4 underline-offset-4 hover:text-white hover:underline">{t('footerStaff')}</Link>© 2026 ValteraTravel. {t('footer.rights')}</p>
        </div>
      </footer>
    </div>
  )
}
