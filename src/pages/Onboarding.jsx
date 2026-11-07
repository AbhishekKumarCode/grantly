import { cloneElement, useId, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { Logo, Footer } from '../components/Layout'
import { buttonClass, Seal, useCountUp } from '../components/ui'
import { useStore } from '../store'
import { FIELDS, LEVELS, INCOME, CATEGORIES, STATES, FLAGS, GOALS, matchAll, totalReach } from '../lib/engine'
import { inr, inrShort } from '../lib/format'

const input = 'h-[46px] w-full rounded-lg border-[1.5px] border-line-strong bg-white px-3.5 text-[15px] outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10'
const choice = (on) => `cursor-pointer rounded-lg border-[1.5px] p-3 text-left transition ${on ? 'border-primary bg-primary-tint/40' : 'border-line-strong bg-white hover:border-ink'}`
const why = (t) => <p className="mt-1.5 text-[13px] text-faint">Why we ask: {t}</p>

function Field({ label, children, hint }) {
  const id = useId()
  return <div><label htmlFor={id} className="mb-1.5 block text-[15px] font-semibold">{label}</label>{cloneElement(children, { id })}{hint && why(hint)}</div>
}

export default function Onboarding() {
  const nav = useNavigate()
  const { profile, dispatch, notify } = useStore()
  const [step, setStep] = useState(1)
  const [p, setP] = useState({
    name: '', institution: '', course: '', field: 'engineering', level: 'ug', year: 2, cgpa: 8, state: 'MH',
    category: 'general', income: 'b8', gender: 'female', flags: [], goals: ['tuition'], ...profile,
  })
  const set = (patch) => setP((x) => ({ ...x, ...patch }))
  const toggle = (k, id) => set({ [k]: p[k].includes(id) ? p[k].filter((x) => x !== id) : [...p[k], id] })

  const live = useMemo(() => {
    const m = matchAll(p).filter((x) => x.eligible).sort((a, b) => b.score - a.score)
    return { count: m.length, total: totalReach(m), top: m.slice(0, 3) }
  }, [p])
  const total = useCountUp(live.total, 500)

  const valid1 = p.name.trim() && p.course.trim()
  const finish = () => { dispatch({ type: 'profile', patch: { ...p, name: p.name.trim() } }); notify(profile ? 'Profile updated. Your matches are refreshed.' : `You are in, ${p.name.trim().split(' ')[0]}. Let\u2019s go find your money.`, profile ? undefined : { confetti: true }); nav('/app') }
  const next = () => (step < 3 ? setStep(step + 1) : finish())
  const titles = ['Your studies', 'Your background', 'What you need most']

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-line bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
          <Logo />
          <span className="hidden text-sm text-muted sm:inline">Takes under 2 minutes. Stored only in this browser.</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-8 md:px-8">
        <ol className="mb-8 flex items-center gap-3" aria-label="Progress">
          {titles.map((t, i) => {
            const n = i + 1, done = n < step, on = n === step
            return (
              <li key={t} className="flex flex-1 items-center gap-3" aria-current={on ? 'step' : undefined}>
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-sm font-bold ${done ? 'bg-forest text-white' : on ? 'bg-primary text-white' : 'bg-line text-faint'}`}>
                  {done ? <Check size={15} strokeWidth={3} /> : n}
                </span>
                <span className={`hidden text-sm font-semibold sm:block ${on ? 'text-ink' : 'text-faint'}`}>{t}</span>
                {n < 3 && <span className={`h-px flex-1 ${done ? 'bg-forest' : 'bg-line-strong'}`} />}
              </li>
            )
          })}
        </ol>

        <div className="grid items-start gap-8 lg:grid-cols-12">
          <section className="lg:col-span-7">
            <h1 className="text-3xl font-bold">{titles[step - 1]}</h1>
            <p className="mt-1 text-muted">{['Quick and painless. Promise.', 'Halfway there. This part unlocks the big ones.', 'Last one. Then the good part.'][step - 1]}</p>
            <form onSubmit={(e) => { e.preventDefault(); next() }} className="mt-6 space-y-6 rounded-2xl border border-line-strong bg-white p-6 md:p-8">
              {step === 1 && (<>
                <Field label="Your name"><input className={input} value={p.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Aarav Patel" autoComplete="name" /></Field>
                <Field label="Course" hint="Many grants are limited to specific programmes.">
                  <input className={input} value={p.course} onChange={(e) => set({ course: e.target.value })} placeholder="e.g. B.Tech Computer Science" />
                </Field>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Field of study"><select className={input} value={p.field} onChange={(e) => set({ field: e.target.value })}>{FIELDS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}</select></Field>
                  <Field label="Level"><select className={input} value={p.level} onChange={(e) => set({ level: e.target.value })}>{LEVELS.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}</select></Field>
                </div>
                <Field label="College or university"><input className={input} value={p.institution} onChange={(e) => set({ institution: e.target.value })} placeholder="e.g. VJTI Mumbai" /></Field>
                <div>
                  <label htmlFor="cg" className="mb-1.5 flex justify-between text-[15px] font-semibold"><span>CGPA (out of 10)</span><span className="num font-display text-lg">{(+p.cgpa).toFixed(1)}</span></label>
                  <input id="cg" type="range" min="5" max="10" step="0.1" value={p.cgpa} onChange={(e) => set({ cgpa: +e.target.value })} className="w-full accent-primary" />
                  {why('Most merit grants set a minimum CGPA.')}
                </div>
              </>)}

              {step === 2 && (<>
                <Field label="State of residence" hint="Over a dozen state schemes are open only to residents.">
                  <select className={input} value={p.state} onChange={(e) => set({ state: e.target.value })}>{STATES.map(([id, l]) => <option key={id} value={id}>{l}</option>)}</select>
                </Field>
                <fieldset>
                  <legend className="mb-1.5 text-[15px] font-semibold">Category</legend>
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {CATEGORIES.map((c) => <button type="button" key={c.id} aria-pressed={p.category === c.id} onClick={() => set({ category: c.id })} className={choice(p.category === c.id) + ' text-sm font-medium'}>{c.label}</button>)}
                  </div>
                  {why('Central and state quotas depend on category. Self-declared for now.')}
                </fieldset>
                <fieldset>
                  <legend className="mb-1.5 text-[15px] font-semibold">Family income per year</legend>
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                    {INCOME.map((i) => <button type="button" key={i.id} aria-pressed={p.income === i.id} onClick={() => set({ income: i.id })} className={choice(p.income === i.id)}><span className="block font-display text-base font-semibold">{i.label}</span></button>)}
                  </div>
                  {why('Need-based grants use income slabs. You only pick a range.')}
                </fieldset>
                <fieldset>
                  <legend className="mb-1.5 text-[15px] font-semibold">Gender</legend>
                  <div className="flex flex-wrap gap-2.5">
                    {[['female', 'Woman'], ['male', 'Man'], ['other', 'Prefer not to say']].map(([id, l]) => <button type="button" key={id} aria-pressed={p.gender === id} onClick={() => set({ gender: id })} className={choice(p.gender === id) + ' px-4 text-sm font-medium'}>{l}</button>)}
                  </div>
                  {why('Several grants are reserved for women in technical fields.')}
                </fieldset>
                <fieldset>
                  <legend className="mb-1.5 text-[15px] font-semibold">Anything else that applies <span className="font-normal text-faint">(optional)</span></legend>
                  <div className="space-y-2.5">
                    {FLAGS.map((f) => (
                      <label key={f.id} className={choice(p.flags.includes(f.id)) + ' flex items-start gap-3'}>
                        <input type="checkbox" className="mt-0.5 h-5 w-5 accent-primary" checked={p.flags.includes(f.id)} onChange={() => toggle('flags', f.id)} />
                        <span><span className="block text-[15px] font-semibold">{f.label}</span><span className="block text-[13px] text-faint">{f.note}</span></span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              </>)}

              {step === 3 && (
                <fieldset>
                  <legend className="mb-1.5 text-[15px] font-semibold">What would the money help with?</legend>
                  <div className="grid gap-2.5 sm:grid-cols-2">
                    {GOALS.map((g) => (
                      <label key={g.id} className={choice(p.goals.includes(g.id)) + ' flex items-center gap-3'}>
                        <input type="checkbox" className="h-5 w-5 accent-primary" checked={p.goals.includes(g.id)} onChange={() => toggle('goals', g.id)} />
                        <span className="text-[15px] font-medium">{g.label}</span>
                      </label>
                    ))}
                  </div>
                  {why('We rank grants that cover these costs higher.')}
                </fieldset>
              )}

              <div className="flex flex-col-reverse items-stretch justify-between gap-3 border-t border-line pt-6 sm:flex-row sm:items-center">
                {step > 1 ? <button type="button" onClick={() => setStep(step - 1)} className={buttonClass.secondary}><ArrowLeft size={16} />Back</button> : <Link to={profile ? '/app' : '/'} className={buttonClass.ghost}>Cancel</Link>}
                <button type="submit" disabled={step === 1 && !valid1} className={buttonClass.primary}>
                  {step < 3 ? 'Continue' : `Show my ${live.count} matches`}<ArrowRight size={16} />
                </button>
              </div>
            </form>
          </section>

          <aside className="space-y-5 lg:sticky lg:top-6 lg:col-span-5" aria-label="Live matches">
            <div className="ticket">
              <div className="p-6">
                <p className="text-sm font-semibold">Matches so far</p>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <div>
                    <div className="num font-display text-4xl font-extrabold text-primary" aria-live="polite">{inr(total)}</div>
                    <div className="text-sm text-muted">across {live.count} scholarships</div>
                  </div>
                  <div className="seal h-14 w-14 text-center font-display"><div className="num text-xl font-bold">{live.count}</div></div>
                </div>
              </div>
              <ul className="divide-y divide-dashed divide-line-strong border-t border-dashed border-line-strong bg-primary-tint/30">
                {live.top.length === 0 && <li className="p-5 text-sm text-muted">Nothing matches yet. Try a different course or level.</li>}
                {live.top.map((m) => (
                  <li key={m.s.id} className="flex items-center justify-between gap-3 px-6 py-3.5">
                    <div className="min-w-0"><div className="truncate text-sm font-semibold">{m.s.name}</div><div className="text-xs text-faint">{m.score}% match</div></div>
                    <div className="num shrink-0 font-display font-bold text-primary">{inrShort(m.s.amount)}</div>
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-sm text-faint">Your answers only decide eligibility. We never sell them or share them with lenders.</p>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  )
}
