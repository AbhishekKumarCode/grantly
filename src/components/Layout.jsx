import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Bell, Search, UserRound, RotateCcw } from 'lucide-react'
import Palette from './Palette'
import { dayMonth, daysLabel } from '../lib/format'
import { useStore } from '../store'
import { Toast } from './ui'

const links = [['/app', 'Dashboard', true], ['/app/discover', 'Discover'], ['/app/tracker', 'Tracker'], ['/app/vault', 'Vault']]

function Popover({ label, trigger, children, align = 'right' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useEffect(() => {
    if (!open) return
    const down = (e) => { if (!ref.current?.contains(e.target)) setOpen(false) }
    const key = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', down); document.addEventListener('keydown', key)
    return () => { document.removeEventListener('mousedown', down); document.removeEventListener('keydown', key) }
  }, [open])
  return (
    <div ref={ref} className="relative">
      <button aria-label={label} aria-expanded={open} onClick={() => setOpen((o) => !o)} className="rounded-lg">{trigger}</button>
      {open && <div onClick={() => setOpen(false)} className={`absolute top-full z-50 mt-2 w-80 rounded-2xl border border-line-strong bg-white p-2 shadow-xl ${align === 'right' ? 'right-0' : 'left-0'}`}>{children}</div>}
    </div>
  )
}

const TITLES = { '/app': 'Dashboard', '/app/discover': 'Discover', '/app/tracker': 'Tracker', '/app/vault': 'Vault' }

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
  const { profile, matches, apps, dispatch } = useStore()
  const [pal, setPal] = useState(false)
  const loc = useLocation()
  const nav = useNavigate()
  useEffect(() => { document.title = (TITLES[loc.pathname] ?? 'Scholarship') + ' · Grantly' }, [loc.pathname])
  useEffect(() => {
    const k = (e) => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPal((v) => !v) } }
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k)
  }, [])
  if (!profile) return <Navigate to="/" replace />
  const urgentList = matches.filter((m) => m.eligible && m.s.days <= 10 && !['submitted', 'awarded'].includes(apps[m.s.id]?.status)).sort((a, b) => a.s.days - b.s.days)
  const urgent = urgentList.length
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
          <div className="flex items-center gap-2">
            <button onClick={() => setPal(true)} aria-label="Search (Ctrl K)" className="flex h-10 items-center gap-2 rounded-lg border-[1.5px] border-line-strong bg-white px-3 text-sm text-faint hover:border-ink">
              <Search size={16} /><span className="hidden lg:inline">Search</span><kbd className="hidden rounded border border-line-strong px-1.5 text-[11px] lg:inline">Ctrl K</kbd>
            </button>
            <Popover label={`${urgent} deadlines in the next 10 days`} trigger={
              <span className="relative block rounded-lg p-2 text-muted hover:bg-paper"><Bell size={20} />
                {urgent > 0 && <span className="absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-coral px-1 text-[10px] font-bold text-white">{urgent}</span>}</span>}>
              <p className="px-3 pb-1 pt-2 text-sm font-semibold">Closing in the next 10 days</p>
              {urgentList.length === 0 && <p className="px-3 py-4 text-sm text-muted">Nothing is closing soon. You are on track.</p>}
              {urgentList.map((m) => (
                <Link key={m.s.id} to={`/app/s/${m.s.id}`} className="block rounded-lg px-3 py-2.5 hover:bg-paper">
                  <span className="block text-sm font-semibold">{m.s.name}</span>
                  <span className="num text-xs text-crimson">{daysLabel(m.s.days)} · {dayMonth(m.s.deadline)}</span>
                </Link>
              ))}
            </Popover>
            <Popover label="Account menu" trigger={
              <span className="flex items-center gap-2.5 rounded-lg p-1 hover:bg-paper">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-xs font-bold text-white">{initials}</span>
                <span className="hidden text-left leading-tight lg:block"><span className="block text-sm font-semibold">{profile.name}</span><span className="block text-xs text-faint">{profile.course}</span></span>
              </span>}>
              <button onClick={() => nav('/start')} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium hover:bg-paper"><UserRound size={16} />Edit my profile</button>
              <button onClick={() => { dispatch({ type: 'reset' }); nav('/') }} className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm font-medium hover:bg-paper"><RotateCcw size={16} />Reset and start over</button>
            </Popover>
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
      <Palette open={pal} onClose={() => setPal(false)} />
    </div>
  )
}
