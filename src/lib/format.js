export const inr = (n) => '₹' + Math.round(n).toLocaleString('en-IN')
export const inrShort = (n) => {
  if (n >= 1e7) return '₹' + +(n / 1e7).toFixed(1) + 'Cr'
  if (n >= 1e5) return '₹' + +(n / 1e5).toFixed(1) + 'L'
  return '₹' + Math.round(n / 1e3) + 'k'
}
export const dayMonth = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
export const daysLeft = (s) => s.days
export const urgency = (days) => (days <= 7 ? 'urgent' : days <= 21 ? 'soon' : 'calm')
export const daysLabel = (days) => (days === 0 ? 'Due today' : days === 1 ? '1 day left' : `${days} days left`)
