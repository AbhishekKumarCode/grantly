import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, CornerDownLeft, LayoutDashboard, Compass, Kanban, FolderOpen } from 'lucide-react'
import { SCHOLARSHIPS } from '../data/scholarships'
import { inrShort } from '../lib/format'

const PAGES = [
  { label: 'Dashboard', to: '/app', icon: LayoutDashboard },
  { label: 'Discover scholarships', to: '/app/discover', icon: Compass },
  { label: 'Application tracker', to: '/app/tracker', icon: Kanban },
  { label: 'Document vault', to: '/app/vault', icon: FolderOpen },
]

export default function Palette({ open, onClose }) {
  const nav = useNavigate()
  const [q, setQ] = useState('')
  const [i, setI] = useState(0)
  const input = useRef(null)

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase()
    const pages = PAGES.filter((p) => !t || p.label.toLowerCase().includes(t)).map((p) => ({ key: p.to, label: p.label, to: p.to, icon: p.icon, hint: 'Go to' }))
    const sch = SCHOLARSHIPS.filter((s) => !t || (s.name + ' ' + s.provider).toLowerCase().includes(t))
      .slice(0, t ? 8 : 5).map((s) => ({ key: s.id, label: s.name, to: `/app/s/${s.id}`, hint: inrShort(s.amount), sub: s.provider }))
    return [...pages, ...sch]
  }, [q])

  useEffect(() => { if (open) { setQ(''); setI(0); setTimeout(() => input.current?.focus(), 0) } }, [open])
  useEffect(() => { setI(0) }, [q])
  if (!open) return null

  const go = (r) => { nav(r.to); onClose() }
  const onKey = (e) => {
    if (e.key === 'Escape') onClose()
    else if (e.key === 'ArrowDown') { e.preventDefault(); setI((x) => Math.min(rows.length - 1, x + 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setI((x) => Math.max(0, x - 1)) }
    else if (e.key === 'Enter' && rows[i]) go(rows[i])
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-ink/40 px-4 pt-[12vh]" onMouseDown={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Search Grantly" onMouseDown={(e) => e.stopPropagation()} onKeyDown={onKey}
        className="w-full max-w-xl overflow-hidden rounded-2xl border border-line-strong bg-white shadow-2xl">
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search size={18} className="text-faint" aria-hidden />
          <input ref={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search scholarships or jump to a page"
            aria-label="Search" className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-faint" />
          <kbd className="rounded border border-line-strong px-1.5 py-0.5 text-[11px] text-faint">Esc</kbd>
        </div>
        <ul className="max-h-[50vh] overflow-y-auto p-2" role="listbox">
          {rows.length === 0 && <li className="px-3 py-8 text-center text-sm text-muted">Nothing found. Try a provider name like “Tata”.</li>}
          {rows.map((r, n) => (
            <li key={r.key} role="option" aria-selected={n === i}>
              <button onMouseEnter={() => setI(n)} onClick={() => go(r)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left ${n === i ? 'bg-primary-tint/60' : ''}`}>
                {r.icon ? <r.icon size={17} className="shrink-0 text-primary" /> : <span className="grid h-[17px] w-[17px] shrink-0 place-items-center"><span className="h-2 w-2 rounded-full bg-saffron" /></span>}
                <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{r.label}</span>{r.sub && <span className="block truncate text-xs text-faint">{r.sub}</span>}</span>
                <span className="num shrink-0 text-xs font-medium text-faint">{r.hint}</span>
                {n === i && <CornerDownLeft size={14} className="shrink-0 text-faint" />}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
