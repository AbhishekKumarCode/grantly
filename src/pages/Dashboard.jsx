import { Link } from 'react-router-dom'
import { ArrowRight, FileUp, CalendarPlus } from 'lucide-react'
import { useStore } from '../store'
import Ticket from '../components/Ticket'
import Runway from '../components/Runway'
import { buttonClass, useCountUp } from '../components/ui'
import { inr, inrShort, dayMonth, daysLabel, urgency } from '../lib/format'
import { profileStrength, missingDocs } from '../lib/engine'
import { DOCS } from '../data/docs'
import { downloadICS } from '../lib/ics'

export default function Dashboard() {
  const { profile, matches, apps, vault, notify } = useStore()
  const eligible = matches.filter((m) => m.eligible).sort((a, b) => b.score - a.score)
  const open = eligible.filter((m) => !['submitted', 'awarded'].includes(apps[m.s.id]?.status))
  const reach = eligible.reduce((n, m) => n + m.s.amount, 0)
  const shown = useCountUp(reach)
  const next10 = open.filter((m) => m.s.days <= 10)
  const upcoming = [...open].sort((a, b) => a.s.days - b.s.days).slice(0, 3)
  const strength = profileStrength(profile, vault)
  const inProgress = Object.values(apps).filter((a) => a.status === 'preparing').length

  // The most valuable missing document: unlocks the most open applications
  const counts = {}
  open.forEach((m) => missingDocs(m.s, vault).forEach((d) => { counts[d] = (counts[d] || []).concat(m) }))
  const topDoc = Object.entries(counts).sort((a, b) => b[1].length - a[1].length)[0]
  const needed = new Set(); open.forEach((m) => m.s.docs.forEach((d) => needed.add(d)))
  const neededDocs = needed.size, readyDocs = [...needed].filter((d) => vault[d]).length
  const awarded = Object.entries(apps).filter(([, a]) => a.status === 'awarded').reduce((n, [id]) => n + (matches.find((m) => m.s.id === id)?.s.amount ?? 0), 0)
  const hour = new Date().getHours()
  const hello = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-14">
      <section className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="text-muted">{hello}, {profile.name.split(' ')[0]}.</p>
          <h1 className="mt-1 text-[40px] font-extrabold leading-tight md:text-6xl">
            <span className="num text-primary">{inr(shown)}</span> within reach
          </h1>
          <p className="mt-3 max-w-xl text-lg text-muted">
            across {eligible.length} scholarships you qualify for.{' '}
            {next10.length > 0 ? <>{next10.length} close in the next 10 days.</> : 'Nothing closes in the next 10 days.'}
          </p>
        </div>
        <button className={buttonClass.secondary} onClick={() => { downloadICS(open.map((m) => m.s)); notify('Calendar file downloaded') }}>
          <CalendarPlus size={16} />Add deadlines to calendar
        </button>
      </section>

      <dl className="grid grid-cols-2 gap-y-6 border-y border-line py-6 sm:grid-cols-4">
        {[
          ['Open scholarships', open.length, 'you qualify for'],
          ['In progress', inProgress, inProgress === 1 ? 'application' : 'applications'],
          ['Documents ready', `${readyDocs}/${neededDocs}`, 'for your open list'],
          ['Awarded so far', inrShort(awarded) , 'money secured'],
        ].map(([k, v, sub], i) => (
          <div key={k} className={`px-0 sm:px-6 ${i > 0 ? 'sm:border-l sm:border-line' : 'sm:pl-0'}`}>
            <dt className="text-sm text-muted">{k}</dt>
            <dd className="num mt-1 font-display text-3xl font-bold">{v}</dd>
            <dd className="text-xs text-faint">{sub}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="runway">
        <div className="mb-2 flex items-baseline justify-between">
          <h2 id="runway" className="text-2xl font-bold">Your runway</h2>
          <span className="text-sm text-faint">Next 60 days</span>
        </div>
        <Runway items={eligible} apps={apps} />
      </section>

      <div className="grid items-start gap-10 lg:grid-cols-12">
        <section className="space-y-4 lg:col-span-8" aria-labelledby="matches">
          <div className="flex items-baseline justify-between">
            <h2 id="matches" className="text-2xl font-bold">Best matches for you</h2>
            <Link to="/app/discover" className="text-sm font-semibold text-primary hover:underline">See all {eligible.length}</Link>
          </div>
          {open.slice(0, 4).map((m) => <Ticket key={m.s.id} m={m} />)}
          <div className="pt-2 text-center"><Link to="/app/discover" className={buttonClass.secondary}>Browse every scholarship<ArrowRight size={16} /></Link></div>
        </section>

        <aside className="space-y-8 lg:col-span-4">
          {topDoc && (
            <div className="rounded-2xl border border-line-strong bg-saffron-tint p-6">
              <h3 className="text-lg font-bold">One upload unlocks {topDoc[1].length} {topDoc[1].length === 1 ? 'application' : 'applications'}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                Your {DOCS[topDoc[0]].label.toLowerCase()} is missing. Worth up to{' '}
                <strong className="num text-ink">{inrShort(topDoc[1].reduce((n, m) => n + m.s.amount, 0))}</strong>.
              </p>
              <Link to="/app/vault" className={buttonClass.primary + ' mt-4 w-full'}><FileUp size={16} />Upload in your vault</Link>
            </div>
          )}

          <div>
            <h3 className="mb-3 text-lg font-bold">Closing soon</h3>
            <ol className="relative space-y-5 border-l-2 border-line-strong pl-6">
              {upcoming.map((m) => {
                const u = urgency(m.s.days), miss = missingDocs(m.s, vault)
                return (
                  <li key={m.s.id} className="relative">
                    <span className={`absolute -left-[31px] top-1 h-3 w-3 rounded-full ring-4 ring-paper ${u === 'urgent' ? 'bg-coral' : u === 'soon' ? 'bg-primary' : 'bg-faint'}`} />
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="num text-sm font-semibold">{dayMonth(m.s.deadline)}</span>
                      <span className={`text-xs font-medium ${u === 'urgent' ? 'text-crimson' : 'text-faint'}`}>{daysLabel(m.s.days)}</span>
                    </div>
                    <Link to={`/app/s/${m.s.id}`} className="mt-0.5 block text-sm font-semibold hover:text-primary">{m.s.name}</Link>
                    <p className={`mt-1 text-xs ${miss.length ? 'text-crimson' : 'text-forest'}`}>
                      {miss.length ? `Needs ${DOCS[miss[0]].label.toLowerCase()}${miss.length > 1 ? ` and ${miss.length - 1} more` : ''}` : 'All documents ready'}
                    </p>
                  </li>
                )
              })}
            </ol>
          </div>

          <div className="space-y-3 border-t border-line pt-6">
            <div className="flex items-baseline justify-between"><h3 className="text-lg font-bold">Profile strength</h3><span className="num font-display text-xl font-bold">{strength}%</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-line"><div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${strength}%` }} /></div>
            <p className="text-sm text-muted">Stronger profiles get more accurate matches.</p>
            <div className="flex items-center justify-between pt-2 text-sm">
              <span className="text-muted">{inProgress} {inProgress === 1 ? 'application' : 'applications'} in progress</span>
              <Link to="/app/tracker" className="font-semibold text-primary hover:underline">Open tracker</Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
