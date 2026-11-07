import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { Upload, Trash2, FileCheck2 } from 'lucide-react'
import { useStore } from '../store'
import { DOCS } from '../data/docs'
import { Chip, buttonClass } from '../components/ui'
import { inrShort } from '../lib/format'

export default function Vault() {
  const { vault, matches, apps, dispatch, notify } = useStore()
  const file = useRef(null)
  const target = useRef(null)
  const eligible = matches.filter((m) => m.eligible && !['submitted', 'awarded'].includes(apps[m.s.id]?.status))

  const rows = Object.keys(DOCS).map((id) => {
    const users = eligible.filter((m) => m.s.docs.includes(id))
    return { id, ...DOCS[id], file: vault[id], users }
  }).filter((r) => r.users.length > 0 || r.file)
  const missing = rows.filter((r) => !r.file).sort((a, b) => b.users.length - a.users.length)
  const onFile = rows.filter((r) => r.file)

  const pick = (id) => { target.current = id; file.current.click() }
  const change = (e) => {
    const f = e.target.files?.[0]
    if (f) { dispatch({ type: 'upload', doc: target.current, name: f.name }); notify(`Got it. ${DOCS[target.current].label} is safe in your vault.`) }
    e.target.value = ''
  }

  const Row = ({ r }) => (
    <li className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-4">
      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${r.file ? 'bg-sage text-forest' : 'bg-saffron-tint text-[#6D4A00]'}`}><FileCheck2 size={18} /></span>
      <div className="min-w-0 flex-1 basis-56">
        <div className="text-[15px] font-semibold">{r.label}</div>
        <div className="truncate text-[13px] text-faint">{r.file ? r.file.name : r.hint}</div>
      </div>
      <div className="flex items-center gap-2">
        {r.file?.expiresIn != null && r.file.expiresIn <= 30 && <Chip tone="urgent">Expires in {r.file.expiresIn} days</Chip>}
        {r.users.length > 0 && <Chip tone={r.file ? 'neutral' : 'gold'}>{r.file ? `Used by ${r.users.length}` : `Unlocks ${r.users.length} · up to ${inrShort(r.users.reduce((n, m) => n + m.s.amount, 0))}`}</Chip>}
        {r.file
          ? <button aria-label={`Remove ${r.label}`} onClick={() => { dispatch({ type: 'removeDoc', doc: r.id }); notify('Removed. Upload a fresh one any time.') }} className="rounded-lg p-2 text-faint hover:bg-paper hover:text-crimson"><Trash2 size={16} /></button>
          : <button onClick={() => pick(r.id)} className={buttonClass.primary + ' h-9 px-3.5'}><Upload size={14} />Upload</button>}
      </div>
    </li>
  )

  return (
    <div>
      <h1 className="text-4xl font-extrabold">Vault</h1>
      <p className="mt-2 max-w-xl text-muted">Upload each document once. Grantly reuses it for every application that needs it.</p>
      <input ref={file} type="file" className="sr-only" aria-hidden tabIndex={-1} onChange={change} />

      {missing.length > 0 && (
        <section className="mt-8" aria-labelledby="miss">
          <h2 id="miss" className="mb-3 text-xl font-bold">Missing <span className="num font-normal text-faint">({missing.length})</span></h2>
          <ul className="divide-y divide-line rounded-2xl border border-line-strong bg-white">{missing.map((r) => <Row key={r.id} r={r} />)}</ul>
        </section>
      )}
      <section className="mt-10" aria-labelledby="have">
        <h2 id="have" className="mb-3 text-xl font-bold">On file <span className="num font-normal text-faint">({onFile.length})</span></h2>
        {onFile.length === 0
          ? <p className="rounded-2xl border border-dashed border-line-strong p-6 text-sm text-muted">Nothing here yet. Upload your marksheet first, since almost every scholarship asks for it.</p>
          : <ul className="divide-y divide-line rounded-2xl border border-line-strong bg-white">{onFile.map((r) => <Row key={r.id} r={r} />)}</ul>}
      </section>
      <p className="mt-6 text-sm text-faint">This prototype keeps file names only, in your browser. <Link to="/app/discover" className="font-medium text-primary hover:underline">Browse scholarships</Link></p>
    </div>
  )
}
