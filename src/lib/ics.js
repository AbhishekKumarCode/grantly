const pad = (n) => String(n).padStart(2, '0')
const stamp = (d) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`

export function downloadICS(list, filename = 'grantly-deadlines.ics') {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Grantly//EN']
  list.forEach((s) => {
    const next = new Date(s.deadline.getTime() + 86400000)
    lines.push('BEGIN:VEVENT', `UID:${s.id}@grantly`, `DTSTAMP:${stamp(new Date())}T000000Z`,
      `DTSTART;VALUE=DATE:${stamp(s.deadline)}`, `DTEND;VALUE=DATE:${stamp(next)}`,
      `SUMMARY:Deadline: ${s.name}`, `DESCRIPTION:${s.provider}`,
      'BEGIN:VALARM', 'TRIGGER:-P3D', 'ACTION:DISPLAY', 'DESCRIPTION:Closes in 3 days', 'END:VALARM', 'END:VEVENT')
  })
  lines.push('END:VCALENDAR')
  const blob = new Blob([lines.join('\r\n')], { type: 'text/calendar' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob); a.download = filename; a.click()
  URL.revokeObjectURL(a.href)
}
