import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarPlus } from 'lucide-react'
import { useStore } from '../store'
import { BY_ID } from '../data/scholarships'
import { missingDocs } from '../lib/engine'
import { Chip, buttonClass } from '../components/ui'
import { inrShort, dayMonth, urgency } from '../lib/format'
import { downloadICS } from '../lib/ics'

const COLS = [
  ['saved', 'Saved', 'Scholarships you want to look at again.'],
  ['preparing', 'Preparing', 'Gathering documents and writing.'],
  ['submitted', 'Submitted', 'Waiting to hear back.'],
  ['awarded', 'Awarded', 'Money on its way.'],
]

export default function Tracker() {
  const { apps, vault, dispatch, notify } = useStore()
  const [over, setOver] = useState(null)
  const move = (id, status) => { dispatch({ type: 'setStatus', id, status }); notify(status === 'awarded' ? 'Awarded! Go celebrate.' : `Moved to ${COLS.find((c) => c[0] === status)[1]}`, status === 'awarded' ? { confetti: true } : undefined) }
  const items = Object.entries(apps).map(([id, a]) => ({ s: BY_ID[id], ...a })).filter((x) => x.s)
  const total = items.filter((i) => i.status === 'awarded').reduce((n, i) => n + i.s.amount, 0)
  const live = items.filter((i) => ['saved', 'preparing'].includes(i.status))

  return (
    <div>
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-4xl font-extrabold">Tracker</h1>
          <p className="mt-2 text-muted">{items.length} applications{total > 0 && <> · <span className="num font-semibold text-forest">{inrShort(total)}</span> awarded</>}</p>
        </div>
        <button className={buttonClass.secondary} disabled={!live.length} onClick={() => { downloadICS(live.map((i) => i.s)); notify('Calendar file ready. Deadlines now live on your phone.') }}><CalendarPlus size={16} />Add open deadlines to calendar</button>
      </div>

      <div className="mt-8 flex snap-x gap-4 overflow-x-auto pb-4 lg:grid lg:grid-cols-4 lg:overflow-visible">
        {COLS.map(([key, title, hint]) => {
          const col = items.filter((i) => i.status === key).sort((a, b) => a.s.days - b.s.days)
          return (
            <section key={key} aria-label={title}
              onDragOver={(e) => { e.preventDefault(); setOver(key) }} onDragLeave={() => setOver(null)}
              onDrop={(e) => { e.preventDefault(); setOver(null); const id = e.dataTransfer.getData('text/plain'); if (id && apps[id]?.status !== key) move(id, key) }}
              className={`min-h-[280px] w-[290px] shrink-0 snap-start rounded-2xl border-[1.5px] p-3 transition lg:w-auto ${over === key ? 'border-primary bg-primary-tint/30' : 'border-line bg-white/50'}`}>
              <div className="mb-3 flex items-baseline justify-between px-1.5 pt-1">
                <h2 className="text-lg font-bold">{title}</h2><span className="num text-sm text-faint">{col.length}</span>
              </div>
              <div className="space-y-3">
                {col.length === 0 && <p className="px-1.5 py-4 text-sm text-faint">{hint} Drop a card here.</p>}
                {col.map(({ s }) => {
                  const miss = missingDocs(s, vault), done = s.docs.length - miss.length
                  return (
                    <article key={s.id} draggable onDragStart={(e) => { e.dataTransfer.setData('text/plain', s.id); e.currentTarget.classList.add('dragging') }} onDragEnd={(e) => e.currentTarget.classList.remove('dragging')}
                      className="cursor-grab rounded-xl border border-line-strong bg-white p-4 active:cursor-grabbing">
                      <Link to={`/app/s/${s.id}`} className="block text-[15px] font-semibold leading-snug hover:text-primary">{s.name}</Link>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="num font-display font-bold text-primary">{inrShort(s.amount)}</span>
                        {key === 'awarded' ? <Chip tone="ok">Awarded</Chip> : key === 'submitted' ? <Chip tone="info">Submitted</Chip> : <Chip tone={urgency(s.days) === 'urgent' ? 'urgent' : 'neutral'}>{dayMonth(s.deadline)}</Chip>}
                      </div>
                      {['saved', 'preparing'].includes(key) && (
                        <div className="mt-3">
                          <div className="mb-1 flex justify-between text-xs text-faint"><span>{miss.length ? `Missing ${miss.length}` : 'All documents ready'}</span><span className="num">{done}/{s.docs.length}</span></div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-line"><div className="h-full bg-forest" style={{ width: `${(done / s.docs.length) * 100}%` }} /></div>
                        </div>
                      )}
                      <label className="mt-3 block"><span className="sr-only">Move {s.name}</span>
                        <select value={key} onChange={(e) => move(s.id, e.target.value)} className="h-8 w-full rounded-md border border-line-strong bg-paper px-2 text-xs font-medium">
                          {COLS.map(([k, t]) => <option key={k} value={k}>{k === key ? `In ${t}` : `Move to ${t}`}</option>)}
                        </select>
                      </label>
                    </article>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
