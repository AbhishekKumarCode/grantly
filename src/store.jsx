import { createContext, useContext, useEffect, useMemo, useReducer, useCallback, useState } from 'react'
import { SAMPLE_PROFILE, matchAll } from './lib/engine'

const KEY = 'grantly.v1'
const empty = { profile: null, saved: [], apps: {}, vault: {} }

const sampleState = () => ({
  profile: SAMPLE_PROFILE,
  saved: ['tata-merit'],
  apps: {
    'aditya-birla': { status: 'preparing' }, 'google-generation': { status: 'preparing' },
    'tata-merit': { status: 'saved' }, 'kc-mahindra': { status: 'submitted' }, 'reliance-ug': { status: 'awarded' },
  },
  vault: {
    marksheet: { name: 'sem3-marksheet.pdf', at: Date.now() },
    id: { name: 'aadhaar.pdf', at: Date.now() },
    bonafide: { name: 'bonafide-2026.pdf', at: Date.now(), expiresIn: 24 },
    category: { name: 'obc-ncl-certificate.pdf', at: Date.now() },
    domicile: { name: 'domicile-mh.pdf', at: Date.now() },
    bank: { name: 'passbook-page.jpg', at: Date.now() },
    sop: { name: 'statement-draft-v2.docx', at: Date.now() },
  },
})

function load() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY))
    const obj = (v) => v && typeof v === 'object' && !Array.isArray(v)
    return {
      profile: obj(d?.profile) ? d.profile : null,
      saved: Array.isArray(d?.saved) ? d.saved.filter((x) => typeof x === 'string') : [],
      apps: obj(d?.apps) ? d.apps : {},
      vault: obj(d?.vault) ? d.vault : {},
    }
  } catch { return empty }
}

function reducer(state, a) {
  switch (a.type) {
    case 'profile': return { ...state, profile: { ...state.profile, ...a.patch } }
    case 'sample': return sampleState()
    case 'reset': return empty
    case 'setStatus': {
      const apps = { ...state.apps }
      if (a.status === null) delete apps[a.id]
      else apps[a.id] = { ...apps[a.id], status: a.status }
      return { ...state, apps }
    }
    case 'upload': return { ...state, vault: { ...state.vault, [a.doc]: { name: a.name, at: Date.now() } } }
    case 'removeDoc': { const vault = { ...state.vault }; delete vault[a.doc]; return { ...state, vault } }
    default: return state
  }
}

const Ctx = createContext(null)
export const useStore = () => useContext(Ctx)

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, load)
  const [toast, setToast] = useState(null)
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* private mode */ } }, [state])
  const notify = useCallback((msg, o) => { setToast({ msg, k: Date.now(), ...o }) }, [])
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 2600); return () => clearTimeout(t) }, [toast])

  const matches = useMemo(() => (state.profile ? matchAll(state.profile) : []), [state.profile])
  const value = useMemo(() => ({ ...state, matches, dispatch, notify, toast }), [state, matches, notify, toast])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}
