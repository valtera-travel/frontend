import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../contexts/AuthContext'
import { USE_MOCK } from '../services/dash'
import LanguageSwitcher from '../components/LanguageSwitcher'
import Logo from '../components/Logo'
import DemoBanner from '../components/DemoBanner'
import { Banner, Field, btnCoral, errMsg, inputCls } from '../components/ui'
import { homeFor } from '../components/RequireRole'

export default function Login() {
  const { t } = useTranslation()
  const { user, login } = useAuth()
  const nav = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  if (user) return <Navigate to={homeFor(user.role)} replace />

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setBusy(true); setError('')
    try { const u = await login(email, password); nav(homeFor(u.role), { replace: true }) }
    catch (err) { setError(errMsg(err, t('dash.err.generic'))); setBusy(false) }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-sea-dark p-5">
      <DemoBanner />
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <Link to="/" className="text-ink"><Logo /></Link>
          <LanguageSwitcher />
        </div>
        <h1 className="text-3xl font-semibold">{t('dash.login.title')}</h1>
        <p className="mt-1 text-sm text-ink/60">{t('dash.login.subtitle')}</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <Field label={t('dash.login.email')}><input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} /></Field>
          <Field label={t('dash.login.password')}><input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} /></Field>
          {error && <Banner kind="error">{error}</Banner>}
          <button disabled={busy} className={`${btnCoral} w-full py-3`}>{busy ? t('dash.login.submitting') : t('dash.login.submit')}</button>
        </form>
        {USE_MOCK && (
          <div className="mt-6 rounded-2xl bg-sand p-4 text-xs text-ink/70">
            <p className="font-semibold">{t('dash.login.demo')}</p>
            <p className="mt-1">staff@valteratravel.test / demo12345</p>
            <p>manager@valteratravel.test / demo12345</p>
          </div>
        )}
      </div>
    </div>
  )
}
