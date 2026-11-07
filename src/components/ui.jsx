import { useEffect, useRef, useState } from 'react'
import { Check, TriangleAlert } from 'lucide-react'
import { useStore } from '../store'

export function useCountUp(target, ms = 1100) {
  const [v, setV] = useState(0)
  const first = useRef(true)
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce || !first.current) { setV(target); return }
    first.current = false
    let raf, t0
    const tick = (t) => {
      t0 ??= t
      const p = Math.min(1, (t - t0) / ms)
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [target, ms])
  return v
}

const tones = {
  neutral: 'bg-white border border-line-strong text-muted',
  ok: 'bg-sage text-forest',
  urgent: 'bg-coral-tint text-crimson',
  info: 'bg-primary-tint text-primary-deep',
  gold: 'bg-saffron-tint text-[#6D4A00]',
}
export function Chip({ tone = 'neutral', icon: Icon, children, className = '' }) {
  return (
    <span className={`inline-flex h-7 items-center gap-1.5 rounded-full px-3 text-xs font-semibold whitespace-nowrap ${tones[tone]} ${className}`}>
      {Icon && <Icon size={13} strokeWidth={2.5} aria-hidden />}{children}
    </span>
  )
}

const btn = 'inline-flex h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold transition active:translate-y-px disabled:cursor-not-allowed disabled:bg-line disabled:text-faint disabled:border-line'
export const buttonClass = {
  primary: `${btn} bg-primary text-white hover:bg-primary-deep`,
  secondary: `${btn} bg-white border-[1.5px] border-line-strong text-ink hover:border-ink`,
  ghost: `${btn} text-muted hover:text-primary px-3`,
}

export function Seal({ value, size = 56 }) {
  return (
    <div className="seal num font-display leading-none" style={{ width: size, height: size }} aria-label={`${value} percent match`}>
      <div className="text-center">
        <div style={{ fontSize: size * 0.3 }} className="font-bold">{value}%</div>
        <div style={{ fontSize: size * 0.17 }} className="mt-0.5 font-medium">match</div>
      </div>
    </div>
  )
}

export function Check2({ ok, children }) {
  return (
    <li className="flex items-start gap-2 text-sm text-ink">
      <span className={`mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full ${ok ? 'bg-sage text-forest' : 'bg-coral-tint text-crimson'}`}>
        {ok ? <Check size={12} strokeWidth={3} /> : <TriangleAlert size={11} strokeWidth={2.5} />}
      </span>
      <span>{children}</span>
    </li>
  )
}

export function Toast() {
  const { toast } = useStore()
  if (!toast) return null
  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      <div key={toast.k} className="toast pointer-events-auto rounded-lg bg-ink px-4 py-3 text-sm font-medium text-white shadow-lg">{toast.msg}</div>
    </div>
  )
}

export function Empty({ title, body, children }) {
  return (
    <div className="rounded-2xl border border-dashed border-line-strong bg-white/60 px-6 py-12 text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{body}</p>
      <div className="mt-5 flex justify-center">{children}</div>
    </div>
  )
}
