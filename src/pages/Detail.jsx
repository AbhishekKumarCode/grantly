import { useRef, useState } from 'react'
import { Link, useParams, Navigate } from 'react-router-dom'
import { ArrowLeft, Upload, Check, CalendarPlus, Clock, Send, Bookmark } from 'lucide-react'
import { useStore } from '../store'
import { BY_ID } from '../data/scholarships'
import { DOCS } from '../data/docs'
import { evaluate, missingDocs, INCOME } from '../lib/engine'
import { Chip, Seal, Check2, buttonClass } from '../components/ui'
import { inr, dayMonth, daysLabel, urgency } from '../lib/format'
import { downloadICS } from '../lib/ics'
import { checkFile, FILE_ACCEPT } from '../lib/safeFile'

export default function Detail() {
  const { id } = useParams()
  const { profile, apps, vault, dispatch, notify } = useStore()
  const s = BY_ID[id]
  const [wi, setWi] = useState(null)
  const docsRef = useRef(null)
  const file = useRef(null)
  const target = useRef(null)
  if (!s) return <Navigate to="/app/discover" replace />

  const m = evaluate(s, profile)
  const alt = wi ? evaluate(s, { ...profile, ...wi }) : null
  const status = apps[s.id]?.status
  const missing = missingDocs(s, vault)
  const ready = missing.length === 0
  const u = urgency(s.days)
  const steps = ['saved', 'preparing', 'submitted', 'awarded']

  const start = () => { dispatch({ type: 'setStatus', id: s.id, status: 'preparing' }); notify('Let\u2019s go. Application started.'); docsRef.current?.scrollIntoView({ behavior: 'smooth' }) }
  const submit = () => {
    if (!ready) { notify(`Add ${missing.length} missing ${missing.length === 1 ? 'document' : 'documents'} first`); docsRef.current?.scrollIntoView({ behavior: 'smooth' }); return }
    dispatch({ type: 'setStatus', id: s.id, status: 'submitted' }); notify('Stamped and submitted. Fingers crossed.')
  }
  const pick = (doc) => { target.current = doc; file.current.click() }
  const onFile = (e) => {
    const r = checkFile(e.target.files?.[0])
    if (!r.ok) notify(r.msg)
    else { dispatch({ type: 'upload', doc: target.current, name: r.name }); notify(`Got it. ${DOCS[target.current].label} is in your vault.`) }
    e.target.value = ''
  }

  return (
    <div>
      <Link to="/app/discover" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-primary"><ArrowLeft size={15} />All scholarships</Link>

      <header className="ticket mt-4">
        <span className="notch top" /><span className="notch bottom" />
        <div className="flex flex-col md:flex-row">
          <div className="relative flex-1 p-6 md:p-8">
            {(status === 'awarded' || status === 'submitted') && <span aria-hidden className={`stamp absolute right-6 top-6 hidden rounded-lg border-[3px] px-4 py-1 font-display text-2xl font-extrabold sm:block ${status === 'awarded' ? 'border-forest text-forest' : 'border-primary text-primary'}`}>{status === 'awarded' ? 'Awarded' : 'Submitted'}</span>}
            <div className="mb-3 flex flex-wrap gap-2">
              <Chip tone={u === 'urgent' ? 'urgent' : 'neutral'}>{daysLabel(s.days)} · {dayMonth(s.deadline)}</Chip>
              <Chip>{s.kind}</Chip>
              {status && <Chip tone="info">{status[0].toUpperCase() + status.slice(1)}</Chip>}
            </div>
            <h1 className="text-3xl font-extrabold leading-tight md:text-4xl">{s.name}</h1>
            <p className="mt-1 text-muted">{s.provider}</p>
          </div>
          <div className="stub flex items-center justify-between gap-4 bg-primary-tint/30 p-6 md:w-48 md:flex-col md:justify-center md:text-center">
            {m.eligible ? <Seal value={m.score} size={64} /> : <Chip>Not eligible</Chip>}
            <div><div className="num font-display text-2xl font-bold text-primary">{inr(s.amount)}</div><div className="text-xs text-muted">{s.period}</div></div>
          </div>
        </div>
      </header>

      <div className="mt-10 grid items-start gap-10 lg:grid-cols-12">
        <div className="space-y-12 lg:col-span-8">
          <section aria-labelledby="why">
            <h2 id="why" className="text-2xl font-bold">{m.eligible ? 'Why you match' : 'Why you don’t qualify yet'}</h2>
            <ul className="mt-4 space-y-3">{m.checks.map((c, i) => <Check2 key={i} ok={c.ok}>{c.text}</Check2>)}</ul>
            <p className="mt-5 max-w-prose leading-relaxed text-muted">{s.about}</p>
            {!m.eligible && (s.c.minCgpa != null || s.c.maxIncome != null) && (
              <div className="mt-6 rounded-2xl border border-line-strong bg-white p-5">
                <h3 className="text-lg font-bold">What if your numbers were different?</h3>
                <p className="mt-0.5 text-sm text-muted">Try a CGPA or income range to see when you would qualify. This does not change your profile.</p>
                {s.c.minCgpa != null && (
                  <div className="mt-4">
                    <label htmlFor="wi-cgpa" className="flex justify-between text-sm font-medium"><span>CGPA</span><span className="num font-display text-base font-bold">{(wi?.cgpa ?? profile.cgpa).toFixed(1)}</span></label>
                    <input id="wi-cgpa" type="range" min="5" max="10" step="0.1" value={wi?.cgpa ?? profile.cgpa} onChange={(e) => setWi({ ...wi, cgpa: +e.target.value })} className="mt-1 w-full accent-primary" />
                  </div>
                )}
                {s.c.maxIncome != null && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {INCOME.map((i) => { const on = (wi?.income ?? profile.income) === i.id; return <button key={i.id} aria-pressed={on} onClick={() => setWi({ ...wi, income: i.id })} className={`rounded-full border-[1.5px] px-3.5 py-1.5 text-sm font-medium ${on ? 'border-primary bg-primary text-white' : 'border-line-strong bg-white hover:border-ink'}`}>{i.label}</button> })}
                  </div>
                )}
                {alt && <p role="status" className={`mt-4 rounded-lg px-3 py-2 text-sm font-semibold ${alt.eligible ? 'bg-sage text-forest' : 'bg-coral-tint text-crimson'}`}>{alt.eligible ? 'With these numbers you would qualify for this scholarship.' : 'Still not enough. Other criteria are not met.'}</p>}
              </div>
            )}
          </section>

          <section ref={docsRef} aria-labelledby="need" className="scroll-mt-24">
            <div className="flex items-baseline justify-between">
              <h2 id="need" className="text-2xl font-bold">What you need</h2>
              <span className="num text-sm text-muted">{s.docs.length - missing.length} of {s.docs.length} ready</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line"><div className="h-full bg-forest transition-all" style={{ width: `${((s.docs.length - missing.length) / s.docs.length) * 100}%` }} /></div>
            <ul className="mt-4 divide-y divide-line rounded-2xl border border-line-strong bg-white">
              {s.docs.map((d) => {
                const v = vault[d]
                return (
                  <li key={d} className="flex items-center gap-4 px-5 py-4">
                    <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${v ? 'bg-forest text-white' : 'border-[1.5px] border-line-strong'}`}>{v && <Check size={14} strokeWidth={3} />}</span>
                    <div className="min-w-0 flex-1">
                      <div className="text-[15px] font-semibold">{DOCS[d].label}</div>
                      <div className="truncate text-[13px] text-faint">{v ? v.name : DOCS[d].hint}</div>
                    </div>
                    {!v && <button onClick={() => pick(d)} className="inline-flex h-9 items-center gap-1.5 rounded-lg border-[1.5px] border-line-strong px-3 text-sm font-semibold hover:border-ink"><Upload size={14} />Upload</button>}
                  </li>
                )
              })}
            </ul>
            <input ref={file} type="file" accept={FILE_ACCEPT} className="sr-only" aria-hidden tabIndex={-1} onChange={onFile} />
          </section>

          <section aria-labelledby="how">
            <h2 id="how" className="text-2xl font-bold">How to apply</h2>
            <ol className="mt-4 space-y-4">
              {s.steps.map((t, i) => (
                <li key={t} className="flex gap-4">
                  <span className="num grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ink text-sm font-bold text-white">{i + 1}</span>
                  <span className="pt-0.5 leading-snug">{t}</span>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="space-y-5 rounded-2xl border border-line-strong bg-white p-6 lg:sticky lg:top-24 lg:col-span-4">
          <div className="flex items-center gap-2 text-sm text-muted"><Clock size={15} />About {s.time} to apply</div>
          {status && (
            <ol className="flex gap-1" aria-label="Application progress">
              {steps.map((t, i) => <li key={t} title={t} className={`h-1.5 flex-1 rounded-full ${i <= steps.indexOf(status) ? 'bg-primary' : 'bg-line'}`} />)}
            </ol>
          )}
          {(!status || status === 'saved') && m.eligible && <button onClick={start} className={buttonClass.primary + ' w-full'}>Start application</button>}
          {status === 'preparing' && <button onClick={submit} className={buttonClass.primary + ' w-full'}><Send size={16} />Mark as submitted</button>}
          {status === 'submitted' && <button onClick={() => { dispatch({ type: 'setStatus', id: s.id, status: 'awarded' }); notify('You got it! Congratulations.', { confetti: true }) }} className={buttonClass.secondary + ' w-full'}>I received this award</button>}
          {status === 'awarded' && <p className="rounded-lg bg-sage p-3 text-sm font-semibold text-forest">Awarded. You earned this one.</p>}
          {!m.eligible && <p className="text-sm text-muted">You can’t apply to this one with your current profile. Update your details if something has changed.</p>}
          {!status && m.eligible && <button onClick={() => { dispatch({ type: 'setStatus', id: s.id, status: 'saved' }); notify('Saved for later') }} className={buttonClass.secondary + ' w-full'}><Bookmark size={16} />Save for later</button>}
          <button onClick={() => { downloadICS([s]); notify('Calendar file ready. This deadline will not sneak up on you.') }} className={buttonClass.ghost + ' w-full'}><CalendarPlus size={16} />Add deadline to calendar</button>
        </aside>
      </div>
    </div>
  )
}
