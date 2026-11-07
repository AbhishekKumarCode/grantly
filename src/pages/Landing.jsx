import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Logo, Footer } from '../components/Layout'
import { buttonClass, useCountUp } from '../components/ui'
import Runway from '../components/Runway'
import { FIELDS, INCOME, SAMPLE_PROFILE, matchAll, totalReach } from '../lib/engine'
import { inr } from '../lib/format'
import { useStore } from '../store'

const pill = (on) => `rounded-full border-[1.5px] px-3.5 py-1.5 text-sm font-medium transition ${on ? 'border-primary bg-primary text-white' : 'border-line-strong bg-white text-ink hover:border-ink'}`

export default function Landing() {
  const nav = useNavigate()
  const { profile, dispatch } = useStore()
  const [field, setField] = useState('engineering')
  const [cgpa, setCgpa] = useState(8.2)
  const [income, setIncome] = useState('b8')

  const result = useMemo(() => {
    const m = matchAll({ field, level: 'ug', cgpa, income, state: 'MH', category: 'general', gender: 'male', flags: [], goals: [], year: 2 })
    return { total: totalReach(m), count: m.filter((x) => x.eligible).length }
  }, [field, cgpa, income])
  const shown = useCountUp(result.total, 600)

  const preview = useMemo(() => matchAll(SAMPLE_PROFILE).filter((m) => m.eligible), [])
  const sample = () => { dispatch({ type: 'sample' }); nav('/app') }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-5 md:px-8">
        <Logo />
        {profile && <Link to="/app" className={buttonClass.secondary}>Open my dashboard</Link>}
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-5 pb-8 pt-10 md:px-8 md:pt-16">
        <div className="grid items-start gap-12 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <h1 className="text-[36px] font-extrabold leading-[1.05] sm:text-6xl">
              See every rupee you qualify for, and the day each one closes.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
              Grantly matches you to scholarships, explains why you qualify, and keeps your documents and deadlines in one place.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/start" className={buttonClass.primary}>Build my profile<ArrowRight size={16} /></Link>
              <button onClick={sample} className={buttonClass.secondary}>Explore with a sample student</button>
            </div>
            <p className="mt-3 text-sm text-faint">Takes about two minutes. Nothing leaves your browser.</p>
          </div>

          {/* The live answer: a ticket you can tune */}
          <div className="relative lg:col-span-6">
            <span className="absolute -top-4 right-6 z-10 rotate-3 rounded-full border-[1.5px] border-ink bg-saffron px-3.5 py-1 text-sm font-bold shadow-[2px_2px_0_0_#0E1B2C]">Live. Go on, slide it.</span>
            <div className="ticket tilt">
              <div className="p-6 md:p-8">
                <p className="text-sm font-semibold">Try it. Three answers, one number.</p>

                <fieldset className="mt-5">
                  <legend className="mb-2 text-sm text-muted">What do you study?</legend>
                  <div className="flex flex-wrap gap-2">
                    {FIELDS.map((f) => <button key={f.id} type="button" onClick={() => setField(f.id)} aria-pressed={field === f.id} className={pill(field === f.id)}>{f.label}</button>)}
                  </div>
                </fieldset>

                <div className="mt-5">
                  <label htmlFor="cgpa" className="mb-2 flex justify-between text-sm text-muted">
                    <span>Your CGPA</span><span className="num font-display text-base font-bold text-ink">{cgpa.toFixed(1)}</span>
                  </label>
                  <input id="cgpa" type="range" min="5" max="10" step="0.1" value={cgpa} onChange={(e) => setCgpa(+e.target.value)} className="w-full accent-primary" />
                </div>

                <fieldset className="mt-5">
                  <legend className="mb-2 text-sm text-muted">Family income</legend>
                  <div className="flex flex-wrap gap-2">
                    {INCOME.map((i) => <button key={i.id} type="button" onClick={() => setIncome(i.id)} aria-pressed={income === i.id} className={pill(income === i.id)}>{i.label}</button>)}
                  </div>
                </fieldset>
              </div>

              <div className="border-t border-dashed border-line-strong bg-primary-tint/30 p-6 md:p-8">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <div className="text-sm text-muted">Within reach</div>
                    <div key={result.total} className="pop num font-display text-5xl font-extrabold text-primary" aria-live="polite">{inr(shown)}</div>
                  </div>
                  <div className="seal h-20 w-20 shrink-0 text-center font-display">
                    <div><div className="num text-2xl font-bold leading-none">{result.count}</div><div className="mt-1 text-[11px]">grants</div></div>
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted">{result.count === 0 ? 'No matches with these answers. Try a lower income range or a different field.' : 'A cautious estimate. Add your state, category and background to unlock more.'}</p>
              </div>
            </div>
          </div>
        </div>

        <section className="mt-24" aria-labelledby="line">
          <h2 id="line" className="max-w-xl text-3xl font-bold md:text-4xl">Every deadline, on one line.</h2>
          <p className="mt-2 max-w-lg text-muted">Each pin is a scholarship you qualify for, placed on the day it closes and sized by what it pays. Here is a sample student's next 60 days.</p>
          <div className="mt-8 rounded-2xl border border-line-strong bg-white p-6"><Runway items={preview} interactive={false} /></div>
        </section>

        <section className="mt-24 grid gap-10 border-t border-line pt-12 md:grid-cols-3" aria-label="How it works">
          {[
            ['Find', 'Matches are ranked by fit, not by who advertises most. Every match shows the reasons.'],
            ['Prepare', 'Upload a document once. Grantly shows which applications it unlocks and what is still missing.'],
            ['Track', 'One timeline for every deadline, a board for every application, and a calendar file for your phone.'],
          ].map(([t, b]) => (
            <div key={t}><h2 className="text-2xl font-bold">{t}</h2><p className="mt-2 max-w-sm leading-relaxed text-muted">{b}</p></div>
          ))}
        </section>
      </main>
      <Footer />
    </div>
  )
}
