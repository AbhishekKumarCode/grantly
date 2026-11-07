// Validate and sanitise a user-chosen file before we store anything about it.
const MAX = 5 * 1024 * 1024
export function checkFile(f) {
  if (!f) return { ok: false, msg: 'No file chosen' }
  if (!/\.(pdf|png|jpe?g|docx?)$/i.test(f.name)) return { ok: false, msg: 'Please use a PDF, image or Word file' }
  if (f.size > MAX) return { ok: false, msg: 'That file is over 5 MB. Please choose a smaller one' }
  return { ok: true, name: f.name.replace(/[^\w.\- ]/g, '').slice(0, 80) || 'document' }
}
export const FILE_ACCEPT = '.pdf,.png,.jpg,.jpeg,.doc,.docx'
