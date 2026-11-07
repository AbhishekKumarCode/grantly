/** @param {number} n */
export const inr = (n) => '₹' + Math.round(n).toLocaleString('en-IN')
/** @param {number} n */
export const inrShort = (n) => {
  if (n >= 1e7) return '₹' + +(n / 1e7).toFixed(1) + 'Cr'
  if (n >= 1e5) return '₹' + +(n / 1e5).toFixed(1) + 'L'
  return '₹' + Math.round(n / 1e3) + 'k'
}
/** @param {Date} d */
export const dayMonth = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
/** @param {{ days: number }} s */
export const daysLeft = (s) => s.days
/** @param {number} days */
export const urgency = (days) => (days <= 7 ? 'urgent' : days <= 21 ? 'soon' : 'calm')
/** @param {number} days */
export const daysLabel = (days) => (days === 0 ? 'Due today' : days === 1 ? '1 day left' : `${days} days left`)
