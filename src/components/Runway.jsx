import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { inrShort, dayMonth, urgency } from '../lib/format'
import { TODAY } from '../data/scholarships'

const SPAN = 60          // days shown
const TAG_W = 148        // px
const TAG_H = 58
const LEVEL_GAP = 66
const LEVELS = 3
const BASE = LEVELS * LEVEL_GAP + 30   // y of the line

export default function Runway({ items, apps }) {
  const box = useRef(null)
  const [w, setW] = useState(1000)
  useEffect(() => {
    const el = box.current
    if (!el) return
    const ro = new ResizeObserver(() => setW(el.clientWidth))
    ro.observe(el); setW(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  const px = (d) => 8 + (d / SPAN) * (w - TAG_W - 8)   // keep the last tag inside the track
  const list = items.filter((m) => m.s.days <= SPAN).sort((a, b) => a.s.days - b.s.days)
  const ends = Array(LEVELS).fill(-1e9)
  const placed = list.map((m) => {
    const x = px(m.s.days)
    let lv = ends.findIndex((e) => x > e + 6)
    if (lv === -1) lv = ends.indexOf(Math.min(...ends))
    ends[lv] = x + TAG_W
    return { m, x, lv }
  })
  const ticks = [0, 10, 20, 30, 40, 50, 60]

  return (
    <div className="overflow-x-auto pb-2">
      <div ref={box} className="relative min-w-[820px]" style={{ height: BASE + 40 }} role="list" aria-label="Deadlines over the next 60 days">
        <div className="absolute inset-x-0 border-t-2 border-ink" style={{ top: BASE }} />
        {ticks.map((d) => (
          <div key={d} className="absolute" style={{ left: px(d), top: BASE }}>
            <div className="h-2 w-px bg-ink" />
            <div className={`num mt-1 whitespace-nowrap text-xs text-faint ${d === 0 ? '-translate-x-1' : '-translate-x-1/2'}`}>
              {d === 0 ? 'Today' : dayMonth(new Date(TODAY.getTime() + d * 86400000))}
            </div>
          </div>
        ))}
        {placed.map(({ m, x, lv }, i) => {
          const u = urgency(m.s.days)
          const done = ['submitted', 'awarded'].includes(apps[m.s.id]?.status)
          const color = done ? 'bg-forest' : u === 'urgent' ? 'bg-coral' : u === 'soon' ? 'bg-primary' : 'bg-ink'
          const top = lv * LEVEL_GAP
          return (
            <Link key={m.s.id} role="listitem" to={`/app/s/${m.s.id}`} title={`${m.s.name}: ${m.s.days} days left`}
              className="pin group absolute block outline-offset-4 hover:z-20 focus-visible:z-20"
              style={{ left: x, top, width: TAG_W, height: BASE - top, animationDelay: `${250 + i * 90}ms` }}>
              {/* stem sits on the pin's date, tag hangs to its right */}
              <div className={`absolute left-0 z-0 w-0.5 ${color}`} style={{ top: 0, height: '100%' }} />
              <div className={`absolute bottom-0 left-0 z-0 h-3 w-3 -translate-x-[5px] translate-y-1/2 rounded-full ring-4 ring-paper ${color}`} />
              <div className="relative z-10 ml-2 rounded-lg border border-line-strong bg-white px-2.5 py-1.5 transition group-hover:-translate-y-0.5 group-hover:border-ink group-focus-visible:border-ink" style={{ height: TAG_H }}>
                <div className="num font-display text-base font-bold leading-tight text-primary">{inrShort(m.s.amount)}</div>
                <div className="truncate text-[11px] font-medium leading-tight">{m.s.name.replace(/ (Scholarship|Grant|Fellowship|Award|Endowment)$/, '')}</div>
                <div className="num text-[11px] leading-tight text-faint">{dayMonth(m.s.deadline)}{done ? ' · done' : ` · ${m.s.days}d`}</div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
