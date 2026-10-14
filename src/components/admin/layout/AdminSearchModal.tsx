import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  X,
  Bell,
  Calendar,
  Users,
  MapPin,
  Building2,
  GraduationCap,
  Layers,
  Clock,
  UserCheck,
  History,
  Settings,
  ArrowRight,
} from 'lucide-react'
import { useContentStore } from '@/store/useContentStore'

interface AdminSearchModalProps {
  isOpen: boolean
  onClose: () => void
}

interface SearchEntry {
  id: string
  title: string
  subtitle: string
  type: string
  url: string
  icon: React.ComponentType<{ className?: string }>
}

export const AdminSearchModal: React.FC<AdminSearchModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)

  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  const {
    announcements,
    events,
    clubs,
    locations,
    facilities,
    faculty,
    departments,
    students,
  } = useContentStore()

  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  // Build searchable corpus
  const allEntries = useMemo<SearchEntry[]>(() => {
    const items: SearchEntry[] = []

    // Quick admin routes
    items.push(
      { id: 'page-dash', title: 'Dashboard', subtitle: 'Overview metrics and attention items', type: 'Page', url: '/admin', icon: Calendar },
      { id: 'page-ann', title: 'Announcements Management', subtitle: 'Circulars and notices list', type: 'Page', url: '/admin/announcements', icon: Bell },
      { id: 'page-evt', title: 'Events Management', subtitle: 'Workshops, hackathons, and registrations', type: 'Page', url: '/admin/events', icon: Calendar },
      { id: 'page-clb', title: 'Clubs & Societies Management', subtitle: 'Campus student organizations', type: 'Page', url: '/admin/clubs', icon: Users },
      { id: 'page-notif', title: 'Broadcast Notifications', subtitle: 'Push alerts and scheduled announcements', type: 'Page', url: '/admin/notifications', icon: Bell },
      { id: 'page-loc', title: 'Locations & Campus Map', subtitle: 'Interactive grounds coordinates', type: 'Page', url: '/admin/locations', icon: MapPin },
      { id: 'page-fac', title: 'Facilities & Services', subtitle: 'Library, cafes, health center, sports', type: 'Page', url: '/admin/facilities', icon: Building2 },
      { id: 'page-prof', title: 'Faculty Directory', subtitle: 'Department staff and office venues', type: 'Page', url: '/admin/faculty', icon: GraduationCap },
      { id: 'page-dept', title: 'Departments Table', subtitle: 'Curriculum branches and semesters', type: 'Page', url: '/admin/departments', icon: Layers },
      { id: 'page-tt', title: 'Timetable Grid', subtitle: 'Weekly schedules and classroom allocations', type: 'Page', url: '/admin/timetable', icon: Clock },
      { id: 'page-stu', title: 'Students Registry', subtitle: 'Enrolled students and status administration', type: 'Page', url: '/admin/students', icon: UserCheck },
      { id: 'page-act', title: 'Activity Audit Log', subtitle: 'Administrative change log and actions', type: 'Page', url: '/admin/activity', icon: History },
      { id: 'page-set', title: 'Portal Settings & Backups', subtitle: 'Export, import, and data reset', type: 'Page', url: '/admin/settings', icon: Settings },
    )

    // Events
    events.forEach((e) => {
      items.push({
        id: `evt-${e.id}`,
        title: e.title,
        subtitle: `Event: ${e.category} (${e.date})`,
        type: 'Event',
        url: `/admin/events/${e.id}/edit`,
        icon: Calendar,
      })
    })

    // Announcements
    announcements.forEach((a) => {
      items.push({
        id: `ann-${a.id}`,
        title: a.title,
        subtitle: `Notice: ${a.postedBy} (${a.category})`,
        type: 'Announcement',
        url: `/admin/announcements/${a.id}/edit`,
        icon: Bell,
      })
    })

    // Clubs
    clubs.forEach((c) => {
      items.push({
        id: `clb-${c.id}`,
        title: c.name,
        subtitle: `Club: ${c.category} (${c.memberCount} members)`,
        type: 'Club',
        url: `/admin/clubs/${c.id}/edit`,
        icon: Users,
      })
    })

    // Locations
    locations.forEach((l) => {
      items.push({
        id: `loc-${l.id}`,
        title: l.name,
        subtitle: `Location: ${l.building}, Floor ${l.floor}`,
        type: 'Location',
        url: `/admin/locations/${l.id}/edit`,
        icon: MapPin,
      })
    })

    // Facilities
    facilities.forEach((f) => {
      items.push({
        id: `fac-${f.id}`,
        title: f.name,
        subtitle: `Facility: ${f.type}`,
        type: 'Facility',
        url: `/admin/facilities/${f.id}/edit`,
        icon: Building2,
      })
    })

    // Faculty
    faculty.forEach((f) => {
      items.push({
        id: `prof-${f.id}`,
        title: f.name,
        subtitle: `Faculty: ${f.designation} (${f.departmentId})`,
        type: 'Faculty',
        url: `/admin/faculty/${f.id}/edit`,
        icon: GraduationCap,
      })
    })

    // Departments
    departments.forEach((d) => {
      items.push({
        id: `dept-${d.id}`,
        title: d.name,
        subtitle: `Department: ${d.code}`,
        type: 'Department',
        url: `/admin/departments/${d.id}/edit`,
        icon: Building2,
      })
    })

    // Students
    students.forEach((s) => {
      items.push({
        id: `stu-${s.id}`,
        title: s.name,
        subtitle: `Student: ${s.rollNo} (${s.department} Sem ${s.semester})`,
        type: 'Student',
        url: `/admin/students/${s.id}`,
        icon: UserCheck,
      })
    })

    return items
  }, [events, announcements, clubs, locations, facilities, faculty, departments, students])

  const filtered = useMemo(() => {
    if (!query.trim()) {
      return allEntries.slice(0, 10) // Show quick access routes when query is empty
    }
    const q = query.toLowerCase().trim()
    return allEntries.filter(
      (it) =>
        it.title.toLowerCase().includes(q) ||
        it.subtitle.toLowerCase().includes(q) ||
        it.type.toLowerCase().includes(q)
    ).slice(0, 20)
  }, [allEntries, query])

  const handleSelect = (entry: SearchEntry) => {
    navigate(entry.url)
    onClose()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filtered[selectedIndex]) {
        handleSelect(filtered[selectedIndex])
      }
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-16 sm:pt-24 px-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-surface border border-border rounded-modal shadow-overlay overflow-hidden flex flex-col max-h-[75vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="p-4 border-b border-border flex items-center gap-3">
          <Search className="w-5 h-5 text-text-muted shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            placeholder="Search records, pages, students, events, faculty..."
            className="flex-1 bg-transparent text-text-primary placeholder:text-text-muted outline-none text-base font-normal"
            aria-label="Admin global search"
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                inputRef.current?.focus()
              }}
              className="p-1 rounded-full text-text-muted hover:text-text-primary"
              aria-label="Clear search input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-2 py-1 text-xs text-text-muted hover:text-text-primary border border-border rounded"
          >
            Esc
          </button>
        </div>

        {/* Results List */}
        <div ref={resultsRef} className="flex-1 overflow-y-auto p-2 space-y-1 text-left">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-text-muted text-small">
              No administrator records found matching "{query}"
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon
              const isSelected = idx === selectedIndex

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-3 rounded-card cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-primary-50 text-text-primary border border-primary-200'
                      : 'hover:bg-canvas text-text-secondary border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-primary-600 text-white' : 'bg-canvas text-text-muted'
                      }`}
                    >
                      <Icon className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-small text-text-primary truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-text-muted truncate">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-canvas border border-border text-text-secondary">
                      {item.type}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-text-muted" aria-hidden="true" />
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-canvas border-t border-border text-xs text-text-muted flex items-center justify-between">
          <span>Navigate with arrow keys</span>
          <span>Press Enter to open</span>
        </div>
      </div>
    </div>
  )
}
