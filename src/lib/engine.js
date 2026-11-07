import { SCHOLARSHIPS } from '../data/scholarships'

/** @typedef {typeof SCHOLARSHIPS[number]} Scholarship */
/** @typedef {{ name: string, institution: string, course: string, field: string, level: string, year: number, cgpa: number, state: string, category: string, income: string, gender: string, flags: string[], goals: string[] }} Profile */
/** @typedef {{ ok: boolean, text: string }} Check */
/** @typedef {{ s: Scholarship, checks: Check[], eligible: boolean, score: number | null }} Match */
/** @typedef {Record<string, unknown>} Vault */

export const FIELDS = [
  { id: 'engineering', label: 'Engineering and tech' },
  { id: 'science', label: 'Science' },
  { id: 'medicine', label: 'Medicine and health' },
  { id: 'commerce', label: 'Commerce' },
  { id: 'arts', label: 'Arts and humanities' },
  { id: 'law', label: 'Law' },
]
export const LEVELS = [
  { id: 'diploma', label: 'Diploma' },
  { id: 'ug', label: 'Undergraduate' },
  { id: 'pg', label: 'Postgraduate' },
]
export const INCOME = [
  { id: 'lt25', label: 'Under ₹2.5L', sub: 'a year', max: 2.5 },
  { id: 'b8', label: '₹2.5L to ₹8L', sub: 'a year', max: 8 },
  { id: 'b15', label: '₹8L to ₹15L', sub: 'a year', max: 15 },
  { id: 'gt15', label: 'Above ₹15L', sub: 'a year', max: 99 },
]
export const CATEGORIES = [
  { id: 'general', label: 'General' }, { id: 'obc', label: 'OBC (non-creamy)' }, { id: 'sc', label: 'SC' },
  { id: 'st', label: 'ST' }, { id: 'ews', label: 'EWS' }, { id: 'minority', label: 'Minority community' },
]
export const STATES = [
  ['MH', 'Maharashtra'], ['KA', 'Karnataka'], ['DL', 'Delhi'], ['TN', 'Tamil Nadu'], ['UP', 'Uttar Pradesh'],
  ['WB', 'West Bengal'], ['TG', 'Telangana'], ['GJ', 'Gujarat'], ['KL', 'Kerala'], ['OT', 'Other state'],
]
export const FLAGS = [
  { id: 'firstGen', label: 'First in my family to attend college', note: 'Opens dedicated first-generation grants' },
  { id: 'pwd', label: 'Person with a benchmark disability', note: '40% or higher on a disability certificate' },
  { id: 'sports', label: 'State or national level athlete', note: 'Competed in a recognised federation' },
  { id: 'armed', label: 'Ward of armed forces personnel', note: 'Serving or ex-servicemen families' },
]
export const GOALS = [
  { id: 'tuition', label: 'Tuition fees' }, { id: 'living', label: 'Hostel and living costs' },
  { id: 'laptop', label: 'Laptop and equipment' }, { id: 'research', label: 'Research funding' },
  { id: 'abroad', label: 'Study or travel abroad' },
]

/** @type {Profile} */
export const SAMPLE_PROFILE = {
  name: 'Aarav Patel', institution: 'VJTI Mumbai', course: 'B.Tech Computer Science', field: 'engineering',
  level: 'ug', year: 2, cgpa: 8.9, state: 'MH', category: 'obc', income: 'b8', gender: 'male',
  flags: ['firstGen'], goals: ['tuition', 'laptop'],
}

/** @param {string} id */
const fieldLabel = (id) => FIELDS.find((f) => f.id === id)?.label.toLowerCase() ?? id
/** @param {string} id */
const levelLabel = (id) => LEVELS.find((l) => l.id === id)?.label.toLowerCase() ?? id
/** @param {string[]} arr */
const joinOr = (arr) => (arr.length < 2 ? arr[0] : arr.slice(0, -1).join(', ') + ' or ' + arr.at(-1))

// Returns every criterion with a plain-language verdict.
/**
 * @param {Scholarship} s
 * @param {Profile} p
 * @returns {Match}
 */
export function evaluate(s, p) {
  const c = s.c
  /** @type {Check[]} */
  const checks = []
  /** @param {boolean} ok @param {string} yes @param {string} no */
  const add = (ok, yes, no) => checks.push({ ok, text: ok ? yes : no })

  if (c.minCgpa != null) add(p.cgpa >= c.minCgpa,
    `Your ${p.cgpa} CGPA clears the ${c.minCgpa} minimum`, `Needs a ${c.minCgpa} CGPA, you have ${p.cgpa}`)
  if (c.fields) add(c.fields.includes(p.field),
    `Open to ${joinOr(c.fields.map(fieldLabel))} students`, `Only for ${joinOr(c.fields.map(fieldLabel))} students`)
  if (c.levels) add(c.levels.includes(p.level),
    `Open to ${joinOr(c.levels.map(levelLabel))} students`, `Only for ${joinOr(c.levels.map(levelLabel))} students`)
  if (c.maxIncome != null) {
    const inc = INCOME.find((i) => i.id === p.income)
    add(!!inc && inc.max <= c.maxIncome,
      `Family income is within the ₹${c.maxIncome}L limit`, `Family income must be under ₹${c.maxIncome}L`)
  }
  if (c.categories) add(c.categories.includes(p.category),
    `Your category qualifies`, `Reserved for ${joinOr(c.categories.map((x) => x.toUpperCase()))} categories`)
  if (c.states) add(c.states.includes(p.state), `You are a resident of the state`, `Only for residents of ${joinOr(c.states)}`)
  if (c.gender) add(p.gender === c.gender, `Open to women students`, `Only for women students`)
  if (c.flags) add(c.flags.some((f) => p.flags?.includes(f)),
    `You meet the special status requirement`, `Requires: ${joinOr(c.flags.map((f) => (FLAGS.find((x) => x.id === f)?.label ?? f).toLowerCase()))}`)

  const eligible = checks.every((k) => k.ok)
  let score = null
  if (eligible) {
    const margin = c.minCgpa != null ? Math.min(1, (p.cgpa - c.minCgpa) / 1.5) : 0.5
    const special = c.flags || c.categories || c.gender ? 1 : 0
    const goal = s.tags.some((t) => p.goals?.includes(t)) ? 1 : 0
    const narrow = c.fields ? 1 : 0
    score = Math.min(99, Math.round(70 + 10 * margin + 8 * special + 7 * goal + 4 * narrow))
  }
  return { s, checks, eligible, score }
}

/** @param {Profile} p @returns {Match[]} */
export function matchAll(p) {
  return SCHOLARSHIPS.map((s) => evaluate(s, p))
}

/** @param {Scholarship} s @param {Vault} vault */
export function missingDocs(s, vault) {
  return s.docs.filter((d) => !vault[d])
}

/** @param {Match[]} matches */
export function totalReach(matches) {
  return matches.filter((m) => m.eligible).reduce((sum, m) => sum + m.s.amount, 0)
}

/** @param {Profile} p @param {Vault} vault */
export function profileStrength(p, vault) {
  let pts = 0
  /** @type {(keyof Profile)[]} */
  const need = ['name', 'course', 'field', 'level', 'cgpa', 'state', 'category', 'income', 'gender']
  need.forEach((k) => { if (p[k] !== undefined && p[k] !== '') pts += 6 })
  if (p.goals?.length) pts += 6
  const docKeys = ['marksheet', 'id', 'bonafide', 'income', 'category', 'domicile', 'bank']
  pts += Math.round((docKeys.filter((d) => vault[d]).length / docKeys.length) * 40)
  return Math.min(100, pts)
}
