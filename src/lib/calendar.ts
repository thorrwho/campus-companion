import { Event } from '@/types'
import { useContentStore } from '@/store/useContentStore'

export function generateICS(event: Event): void {
  const locations = useContentStore.getState().locations
  const location = locations.find((l) => l.id === event.locationId)
  const locationName = location ? `${location.name}, ${location.building}` : 'Location not set'

  // Format date and time to iCal format: YYYYMMDDTHHMMSS
  const cleanDate = event.date.replace(/-/g, '')
  const startClean = event.startTime.replace(/:/g, '') + '00'
  const endClean = event.endTime.replace(/:/g, '') + '00'

  const dtStart = `${cleanDate}T${startClean}`
  const dtEnd = `${cleanDate}T${endClean}`
  const now = new Date()
    .toISOString()
    .replace(/[-:]/g, '')
    .split('.')[0] + 'Z'

  const sanitize = (text: string) => text.replace(/,/g, '\\,').replace(/;/g, '\\;')

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Campus Companion//Student Campus Information Platform//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:event-${event.id}-${Date.now()}@demo.edu`,
    `DTSTAMP:${now}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${sanitize(event.title)}`,
    `DESCRIPTION:${sanitize(event.description)}`,
    `LOCATION:${sanitize(locationName)}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `${event.id}.ics`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}
