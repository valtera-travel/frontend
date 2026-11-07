import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import PublicLayout from './layouts/PublicLayout'
import Home from './pages/Home'
import Packages from './pages/Packages'
import PackageDetailPage from './pages/PackageDetail'
import Destinations from './pages/Destinations'
import DestinationDetailPage from './pages/DestinationDetail'
import InquiryForm from './pages/InquiryForm'
import InquirySuccess from './pages/InquirySuccess'
import Login from './pages/Login'
import { AuthProvider } from './contexts/AuthContext'
import RequireRole from './components/RequireRole'
import DashLayout from './layouts/DashLayout'
import StaffOverview from './pages/dashboard/StaffOverview'
import StaffDestinations from './pages/dashboard/StaffDestinations'
import StaffPackages from './pages/dashboard/StaffPackages'
import StaffPackageManage from './pages/dashboard/StaffPackageManage'
import StaffInquiries from './pages/dashboard/StaffInquiries'
import ManagerDashboard from './pages/dashboard/ManagerDashboard'

function NotFound() {
  const { t } = useTranslation()
  return (
    <div className="mx-auto max-w-xl px-5 py-32 text-center">
      <h1 className="text-4xl font-semibold">{t('notFound.title')}</h1>
      <p className="mt-3 text-ink/60">{t('notFound.text')}</p>
      <Link to="/" className="mt-6 inline-block rounded-full bg-sea px-6 py-2.5 font-semibold text-white">{t('inquiry.successHome')}</Link>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
      <Routes>
        <Route path="login" element={<Login />} />
        <Route path="staff" element={<RequireRole role="STAFF" />}>
          <Route element={<DashLayout />}>
            <Route index element={<StaffOverview />} />
            <Route path="destinations" element={<StaffDestinations />} />
            <Route path="packages" element={<StaffPackages />} />
            <Route path="packages/:id" element={<StaffPackageManage />} />
            <Route path="inquiries" element={<StaffInquiries />} />
          </Route>
        </Route>
        <Route path="manager" element={<RequireRole role="MANAGER" />}>
          <Route element={<DashLayout />}>
            <Route index element={<ManagerDashboard />} />
          </Route>
        </Route>
        <Route element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="packages" element={<Packages />} />
          <Route path="packages/:id" element={<PackageDetailPage />} />
          <Route path="destinations" element={<Destinations />} />
          <Route path="destinations/:id" element={<DestinationDetailPage />} />
          <Route path="inquiry" element={<InquiryForm />} />
          <Route path="inquiry/success" element={<InquirySuccess />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
