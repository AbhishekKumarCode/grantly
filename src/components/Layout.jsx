import { NavLink, Outlet, Link, Navigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { useStore } from '../store'
import { Toast } from './ui'

const links = [['/app', 'Dashboard', true], ['/app/discover', 'Discover'], ['/app/tracker', 'Tracker'], ['/app/vault', 'Vault']]

export function Logo({ to = '/' }) {
  return (
    <Link to={to} className="flex items-center gap-2 font-display text-xl font-bold tracking-tight text-primary">
      <span aria-hidden className="relative grid h-8 w-8 place-items-center rounded-lg bg-primary">
        <span className="h-3.5 w-3.5 rounded-full bg-saffron" />
      </span>
      Grantly
    </Link>
  )
}

export function Footer() {
  return (
    <footer className="mt-20 border-t border-line">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 py-6 text-sm text-faint md:flex-row md:justify-between md:px-8">
        <span>Grantly. A prototype for the scholarship journey. Sample data only.</span>
        <span>Your details stay in this browser.</span>
      </div>
    </footer>
  )
}

export default function Layout() {
  const { profile, matches, apps } = useStore()
  if (!profile) return <Navigate to="/" replace />
  const urgent = matches.filter((m) => m.eligible && m.s.days <= 10 && !['submitted', 'awarded'].includes(apps[m.s.id]?.status)).length
  const initials = profile.name?.split(' ').map((w) => w[0]).slice(0, 2).join('') || 'S'

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 md:px-8">
          <div className="flex items-center gap-8">
            <Logo to="/app" />
            <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
              {links.map(([to, label, end]) => (
                <NavLink key={to} to={to} end={end}
                  className={({ isActive }) => `rounded-lg px-3 py-2 text-sm font-medium transition ${isActive ? 'bg-primary-tint/60 text-primary-deep' : 'text-muted hover:text-ink'}`}>
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/app/tracker" aria-label={`${urgent} deadlines in the next 10 days`} className="relative rounded-lg p-2 text-muted hover:bg-paper">
              <Bell size={20} />
              {urgent > 0 && <span className="absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-coral px-1 text-[10px] font-bold text-white">{urgent}</span>}
            </Link>
            <div className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-xs font-bold text-white">{initials}</span>
              <div className="hidden leading-tight lg:block">
                <div className="text-sm font-semibold">{profile.name}</div>
                <div className="text-xs text-faint">{profile.course}</div>
              </div>
            </div>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto border-t border-line px-3 py-1.5 md:hidden" aria-label="Main">
          {links.map(([to, label, end]) => (
            <NavLink key={to} to={to} end={end}
              className={({ isActive }) => `rounded-lg px-3 py-1.5 text-sm font-medium ${isActive ? 'bg-primary-tint/60 text-primary-deep' : 'text-muted'}`}>
              {label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-8 md:px-8"><Outlet /></main>
      <Footer />
      <Toast />
    </div>
  )
}
