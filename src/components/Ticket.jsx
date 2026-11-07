import { Link } from 'react-router-dom'
import { Bookmark, BookmarkCheck, ArrowRight, Hourglass, CalendarDays } from 'lucide-react'
import { Chip, Seal, Check2, buttonClass } from './ui'
import { useStore } from '../store'
import { inr, dayMonth, urgency } from '../lib/format'

export default function Ticket({ m, showChecks = 2 }) {
  const { s, checks, eligible, score } = m
  const { apps, dispatch, notify } = useStore()
  const status = apps[s.id]?.status
  const u = urgency(s.days)
  const saved = status === 'saved'

  const toggleSave = () => {
    dispatch({ type: 'setStatus', id: s.id, status: saved ? null : 'saved' })
    notify(saved ? 'Removed from saved' : 'Saved for later')
  }

  return (
    <article className="ticket">
      <span className="notch top" /><span className="notch bottom" />
      <div className="flex flex-col md:flex-row">
        <div className="flex flex-1 flex-col gap-4 p-5 md:p-6">
          <div>
            <div className="mb-2.5 flex flex-wrap items-center gap-2">
              <Chip tone={u === 'urgent' ? 'urgent' : 'neutral'} icon={u === 'urgent' ? Hourglass : CalendarDays}>
                {s.days} days left · {dayMonth(s.deadline)}
              </Chip>
              <Chip>{s.kind}</Chip>
              {status && status !== 'saved' && <Chip tone="info">{status[0].toUpperCase() + status.slice(1)}</Chip>}
            </div>
            <h3 className="text-xl font-semibold leading-snug">
              <Link to={`/app/s/${s.id}`} className="hover:text-primary focus-visible:text-primary">{s.name}</Link>
            </h3>
            <p className="mt-0.5 text-sm text-muted">{s.provider}</p>
          </div>

          <ul className="space-y-1.5 rounded-lg border border-line bg-paper/70 p-3">
            {checks.slice(0, showChecks).map((c, i) => <Check2 key={i} ok={c.ok}>{c.text}</Check2>)}
          </ul>

          <div className="flex flex-wrap items-center gap-3">
            <Link to={`/app/s/${s.id}`} className={buttonClass.primary}>
              {status && status !== 'saved' ? 'Continue application' : 'Start application'}<ArrowRight size={16} />
            </Link>
            <button onClick={toggleSave} aria-pressed={saved} className={buttonClass.secondary}>
              {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}{saved ? 'Saved' : 'Save for later'}
            </button>
          </div>
        </div>

        <div className="stub flex shrink-0 flex-row items-center justify-between gap-3 bg-primary-tint/30 p-5 md:w-48 md:flex-col md:justify-center md:gap-4 md:p-6 md:text-center">
          {eligible ? <Seal value={score} /> : <Chip>Not eligible</Chip>}
          <div>
            <div className="text-xs text-muted">Grant award</div>
            <div className="num font-display text-2xl font-bold text-primary">{inr(s.amount)}</div>
            <div className="text-xs text-muted">{s.period}</div>
          </div>
        </div>
      </div>
    </article>
  )
}
