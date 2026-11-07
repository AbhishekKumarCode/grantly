import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { useStore } from '../store'
import Ticket from '../components/Ticket'
import { Empty } from '../components/ui'

const sel = 'h-10 rounded-lg border-[1.5px] border-line-strong bg-white px-3 text-sm font-medium outline-none focus:border-primary'

export default function Discover() {
  const { matches } = useStore()
  const [q, setQ] = useState('')
  const [kind, setKind] = useState('all')
  const [amount, setAmount] = useState(0)
  const [within, setWithin] = useState(0)
  const [sort, setSort] = useState('match')
  const [all, setAll] = useState(false)

  const kinds = useMemo(() => ['all', ...new Set(matches.map((m) => m.s.kind))], [matches])
  const rows = useMemo(() => {
    const t = q.trim().toLowerCase()
    return matches
      .filter((m) => (all ? true : m.eligible))
      .filter((m) => !t || (m.s.name + m.s.provider).toLowerCase().includes(t))
      .filter((m) => kind === 'all' || m.s.kind === kind)
      .filter((m) => m.s.amount >= amount)
      .filter((m) => !within || m.s.days <= within)
      .sort((a, b) =>
        sort === 'deadline' ? a.s.days - b.s.days : sort === 'amount' ? b.s.amount - a.s.amount : (b.score ?? -1) - (a.score ?? -1) || a.s.days - b.s.days)
      .map((m) => (m.eligible ? m : { ...m, checks: [...m.checks].sort((x, y) => x.ok - y.ok) }))
  }, [matches, q, kind, amount, within, sort, all])

  const eligibleCount = matches.filter((m) => m.eligible).length

  return (
    <div>
      <h1 className="text-4xl font-extrabold">Discover</h1>
      <p className="mt-2 text-muted">{eligibleCount} of {matches.length} scholarships fit your profile.</p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1 sm:max-w-sm">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint" aria-hidden />
          <input aria-label="Search scholarships" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or provider"
            className="h-10 w-full rounded-lg border-[1.5px] border-line-strong bg-white pl-9 pr-3 text-sm outline-none focus:border-primary" />
        </div>
        <select aria-label="Type" className={sel} value={kind} onChange={(e) => setKind(e.target.value)}>{kinds.map((k) => <option key={k} value={k}>{k === 'all' ? 'Any type' : k}</option>)}</select>
        <select aria-label="Minimum award" className={sel} value={amount} onChange={(e) => setAmount(+e.target.value)}>
          <option value={0}>Any amount</option><option value={100000}>₹1L or more</option><option value={200000}>₹2L or more</option><option value={500000}>₹5L or more</option>
        </select>
        <select aria-label="Deadline" className={sel} value={within} onChange={(e) => setWithin(+e.target.value)}>
          <option value={0}>Any deadline</option><option value={14}>Next 14 days</option><option value={30}>Next 30 days</option><option value={60}>Next 60 days</option>
        </select>
        <select aria-label="Sort" className={sel} value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="match">Best match</option><option value="deadline">Closing soonest</option><option value="amount">Highest award</option>
        </select>
        <label className="ml-auto flex cursor-pointer items-center gap-2 text-sm font-medium">
          <input type="checkbox" className="h-4 w-4 accent-primary" checked={all} onChange={(e) => setAll(e.target.checked)} />
          Also show ones I don’t qualify for
        </label>
      </div>

      <div className="mt-6 space-y-4">
        {rows.length === 0
          ? <Empty title="No scholarships match these filters" body="Try a longer deadline window or a lower minimum award."><button className="h-11 rounded-lg border-[1.5px] border-line-strong bg-white px-5 text-sm font-semibold" onClick={() => { setQ(''); setKind('all'); setAmount(0); setWithin(0) }}>Clear filters</button></Empty>
          : rows.map((m) => <Ticket key={m.s.id} m={m} showChecks={m.eligible ? 2 : 2} />)}
      </div>
    </div>
  )
}
