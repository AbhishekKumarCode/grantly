import { describe, it, expect } from 'vitest'
import { evaluate, matchAll, missingDocs, totalReach, profileStrength, SAMPLE_PROFILE } from '../engine'
import { BY_ID, SCHOLARSHIPS } from '../../data/scholarships'
import { inr, inrShort, urgency, daysLabel } from '../format'
import { checkFile } from '../safeFile'

const student = { ...SAMPLE_PROFILE }

describe('evaluate', () => {
  it('marks a student eligible when every criterion passes', () => {
    const r = evaluate(BY_ID['aditya-birla'], student)
    expect(r.eligible).toBe(true)
    expect(r.checks.every((c) => c.ok)).toBe(true)
    expect(r.score).toBeGreaterThanOrEqual(70)
    expect(r.score).toBeLessThanOrEqual(99)
  })

  it('rejects when CGPA is below the minimum and says why', () => {
    const r = evaluate(BY_ID['aditya-birla'], { ...student, cgpa: 7.9 })
    expect(r.eligible).toBe(false)
    expect(r.score).toBeNull()
    expect(r.checks.find((c) => !c.ok).text).toMatch(/8.5 CGPA.*7.9/)
  })

  it('rejects on field of study', () => {
    const r = evaluate(BY_ID['sashakt-med'], student)
    expect(r.eligible).toBe(false)
    expect(r.checks.some((c) => !c.ok && /medicine/i.test(c.text))).toBe(true)
  })

  it('respects income slabs', () => {
    expect(evaluate(BY_ID['kc-mahindra'], { ...student, income: 'b8' }).eligible).toBe(true)
    expect(evaluate(BY_ID['kc-mahindra'], { ...student, income: 'b15' }).eligible).toBe(false)
  })

  it('requires special status flags', () => {
    expect(evaluate(BY_ID['kc-mahindra'], { ...student, flags: [] }).eligible).toBe(false)
    expect(evaluate(BY_ID['inclusive-edu'], { ...student, flags: ['pwd'] }).eligible).toBe(true)
  })

  it('applies gender and state restrictions', () => {
    expect(evaluate(BY_ID['grace-hopper'], { ...student, gender: 'male' }).eligible).toBe(false)
    expect(evaluate(BY_ID['grace-hopper'], { ...student, gender: 'female' }).eligible).toBe(true)
    expect(evaluate(BY_ID['mh-post-matric'], { ...student, state: 'KA' }).eligible).toBe(false)
  })

  it('gives a higher score for a matching goal', () => {
    const base = evaluate(BY_ID['tata-merit'], { ...student, goals: [] }).score
    const withGoal = evaluate(BY_ID['tata-merit'], { ...student, goals: ['tuition'] }).score
    expect(withGoal).toBeGreaterThan(base)
  })
})

describe('matchAll and totals', () => {
  it('evaluates every scholarship', () => {
    expect(matchAll(student)).toHaveLength(SCHOLARSHIPS.length)
  })

  it('sums only eligible scholarships', () => {
    const m = matchAll(student)
    const expected = m.filter((x) => x.eligible).reduce((n, x) => n + x.s.amount, 0)
    expect(totalReach(m)).toBe(expected)
    expect(expected).toBeGreaterThan(0)
  })

  it('returns nothing for a profile that fails everything', () => {
    const none = matchAll({ ...student, field: 'law', level: 'diploma', cgpa: 5, income: 'gt15', flags: [], gender: 'male', category: 'general', state: 'OT' })
    expect(totalReach(none)).toBe(0)
  })
})

describe('documents', () => {
  it('lists the documents still missing from the vault', () => {
    const s = BY_ID['aditya-birla']
    expect(missingDocs(s, {})).toEqual(s.docs)
    expect(missingDocs(s, { marksheet: {}, id: {}, bonafide: {}, sop: {} })).toEqual([])
  })

  it('profile strength grows as documents are added', () => {
    expect(profileStrength(student, { marksheet: {}, id: {} })).toBeGreaterThan(profileStrength(student, {}))
    expect(profileStrength(student, {})).toBeLessThanOrEqual(100)
  })
})

describe('formatting', () => {
  it('formats rupees in the Indian system', () => {
    expect(inr(250000)).toBe('₹2,50,000')
    expect(inrShort(250000)).toBe('₹2.5L')
    expect(inrShort(75000)).toBe('₹75k')
  })

  it('classifies urgency and labels days', () => {
    expect(urgency(3)).toBe('urgent')
    expect(urgency(15)).toBe('soon')
    expect(urgency(40)).toBe('calm')
    expect(daysLabel(1)).toBe('1 day left')
    expect(daysLabel(0)).toBe('Due today')
  })
})

describe('checkFile (upload validation)', () => {
  it('accepts allowed types and strips unsafe characters from names', () => {
    const r = checkFile({ name: '<script>my doc</script>.pdf', size: 1000 })
    expect(r.ok).toBe(true)
    expect(r.name).not.toMatch(/[<>/]/)
  })
  it('rejects disallowed types and oversized files', () => {
    expect(checkFile({ name: 'run.exe', size: 10 }).ok).toBe(false)
    expect(checkFile({ name: 'big.pdf', size: 6 * 1024 * 1024 }).ok).toBe(false)
    expect(checkFile(undefined).ok).toBe(false)
  })
})
