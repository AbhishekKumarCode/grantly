import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { lazy, Suspense, useEffect } from 'react'
import Layout from './components/Layout'
import Landing from './pages/Landing'

const Onboarding = lazy(() => import('./pages/Onboarding'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Discover = lazy(() => import('./pages/Discover'))
const Detail = lazy(() => import('./pages/Detail'))
const Tracker = lazy(() => import('./pages/Tracker'))
const Vault = lazy(() => import('./pages/Vault'))

function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  return (
    <>
      <ScrollTop />
      <Suspense fallback={<div role="status" className="grid min-h-[40vh] place-items-center text-sm text-muted">Loading…</div>}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/start" element={<Onboarding />} />
        <Route path="/app" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="discover" element={<Discover />} />
          <Route path="s/:id" element={<Detail />} />
          <Route path="tracker" element={<Tracker />} />
          <Route path="vault" element={<Vault />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </Suspense>
    </>
  )
}
