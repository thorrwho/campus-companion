import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search,
  X,
  MapPin,
  Calendar,
  Bell,
  Users,
  BookOpen,
  Building2,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { LOCATIONS } from '@/data/locations'
import { EVENTS } from '@/data/events'
import { ANNOUNCEMENTS } from '@/data/announcements'
import { CLUBS } from '@/data/clubs'
import { FACULTY } from '@/data/faculty'
import { FACILITIES } from '@/data/facilities'
import { cn } from '@/lib/utils'

export type SearchCategory =
  | 'all'
  | 'location'
  | 'event'
  | 'announcement'
  | 'club'
  | 'faculty'
  | 'facility'

interface SearchResultItem {
  id: string
  title: string
  subtitle: string
  category: SearchCategory
  categoryLabel: string
  url: string
  icon: React.ComponentType<{ className?: string }>
}

const CATEGORY_CHIPS: { id: SearchCategory; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'location', label: 'Locations' },
  { id: 'event', label: 'Events' },
  { id: 'announcement', label: 'Notices' },
  { id: 'club', label: 'Clubs' },
  { id: 'faculty', label: 'Faculty' },
  { id: 'facility', label: 'Facilities' },
]

const QUICK_LINKS = [
  { title: 'Campus Map', subtitle: 'Interactive 2D grounds map', url: '/map', icon: MapPin },
  { title: 'Upcoming Events', subtitle: 'Workshops, hackathons, seminars', url: '/events', icon: Calendar },
  { title: 'Dr. APJ Abdul Kalam Library', subtitle: 'Central library timings and study desk', url: '/facilities/fac-central-library', icon: Building2 },
  { title: 'AI & Robotics Society', subtitle: 'Featured campus innovation club', url: '/clubs/club-ai-robotics', icon: Users },
  { title: 'Campus Announcements', subtitle: 'Latest official circulars and notices', url: '/announcements', icon: Bell },
]

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('all')
  const [selectedIndex, setSelectedIndex] = useState(0)

  const inputRef = useRef<HTMLInputElement>(null)
  const resultsContainerRef = useRef<HTMLDivElement>(null)

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setActiveCategory('all')
      setSelectedIndex(0)
      setTimeout(() => {
        inputRef.current?.focus()
      }, 50)
    }
  }, [isOpen])

  // Build searchable index from all data
  const allSearchItems = useMemo<SearchResultItem[]>(() => {
    const items: SearchResultItem[] = []

    // Locations
    LOCATIONS.forEach((loc) => {
      items.push({
        id: `loc-${loc.id}`,
        title: loc.name,
        subtitle: `${loc.building}, Floor ${loc.floor} (${loc.type})`,
        category: 'location',
        categoryLabel: 'Location',
        url: `/map/${loc.id}`,
        icon: MapPin,
      })
    })

    // Events
    EVENTS.forEach((evt) => {
      items.push({
        id: `evt-${evt.id}`,
        title: evt.title,
        subtitle: `${evt.category} - ${evt.date} at ${evt.startTime}`,
        category: 'event',
        categoryLabel: 'Event',
        url: `/events/${evt.id}`,
        icon: Calendar,
      })
    })

    // Announcements
    ANNOUNCEMENTS.forEach((ann) => {
      items.push({
        id: `ann-${ann.id}`,
        title: ann.title,
        subtitle: `${ann.postedBy} (${ann.category})`,
        category: 'announcement',
        categoryLabel: 'Notice',
        url: `/announcements/${ann.id}`,
        icon: Bell,
      })
    })

    // Clubs
    CLUBS.forEach((clb) => {
      items.push({
        id: `clb-${clb.id}`,
        title: clb.name,
        subtitle: `${clb.category} - ${clb.memberCount} members`,
        category: 'club',
        categoryLabel: 'Club',
        url: `/clubs/${clb.id}`,
        icon: Users,
      })
    })

    // Faculty
    FACULTY.forEach((fac) => {
      items.push({
        id: `fac-${fac.id}`,
        title: fac.name,
        subtitle: `${fac.designation}, Department of ${fac.departmentId}`,
        category: 'faculty',
        categoryLabel: 'Faculty',
        url: `/faculty/${fac.id}`,
        icon: BookOpen,
      })
    })

    // Facilities
    FACILITIES.forEach((fcl) => {
      items.push({
        id: `fcl-${fcl.id}`,
        title: fcl.name,
        subtitle: `${fcl.type} - Contact: ${fcl.contact}`,
        category: 'facility',
        categoryLabel: 'Facility',
        url: `/facilities/${fcl.id}`,
        icon: Building2,
      })
    })

    return items
  }, [])

  // Filter items based on query & category
  const filteredResults = useMemo(() => {
    if (!query.trim()) return []

    const q = query.toLowerCase().trim()
    return allSearchItems.filter((item) => {
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false
      }
      return (
        item.title.toLowerCase().includes(q) ||
        item.subtitle.toLowerCase().includes(q) ||
        item.categoryLabel.toLowerCase().includes(q)
      )
    })
  }, [query, activeCategory, allSearchItems])

  // Reset selectedIndex when results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [query, activeCategory])

  // Keep selected item in view
  useEffect(() => {
    if (!resultsContainerRef.current) return
    const container = resultsContainerRef.current
    const activeEl = container.querySelector(`[data-index="${selectedIndex}"]`) as HTMLElement | null
    if (activeEl) {
      activeEl.scrollIntoView({ block: 'nearest' })
    }
  }, [selectedIndex])

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
      return
    }

    const currentListLength = query.trim() ? filteredResults.length : QUICK_LINKS.length
    if (currentListLength === 0) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % currentListLength)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + currentListLength) % currentListLength)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (query.trim() && filteredResults[selectedIndex]) {
        handleSelectItem(filteredResults[selectedIndex].url)
      } else if (!query.trim() && QUICK_LINKS[selectedIndex]) {
        handleSelectItem(QUICK_LINKS[selectedIndex].url)
      }
    }
  }

  const handleSelectItem = (url: string) => {
    onClose()
    navigate(url)
  }

  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Global Campus Search"
      className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4 bg-primary-950/60 backdrop-blur-sm transition-opacity"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-surface rounded-modal border border-border shadow-modal overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="relative flex items-center px-4 py-3.5 border-b border-border bg-white">
          <Search className="w-5 h-5 text-text-muted shrink-0 mr-3" aria-hidden="true" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search campus: rooms, clubs, professors, events, facilities..."
            className="flex-1 bg-transparent text-body font-medium text-text-primary placeholder:text-text-muted focus:outline-none"
            aria-autocomplete="list"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery('')
                inputRef.current?.focus()
              }}
              className="p-1 rounded text-text-muted hover:text-text-primary focus:outline-none mr-2"
              aria-label="Clear search input"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-xs text-text-muted bg-canvas border border-border rounded font-mono mr-2">
              ESC
            </kbd>
          )}
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-text-muted hover:text-text-primary rounded"
            aria-label="Close search"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Chips Bar */}
        <div className="flex items-center gap-1.5 px-4 py-2 bg-canvas/80 border-b border-border overflow-x-auto no-scrollbar">
          {CATEGORY_CHIPS.map((chip) => {
            const isSelected = activeCategory === chip.id
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => setActiveCategory(chip.id)}
                className={cn(
                  'px-3 py-1 rounded-full text-caption font-medium transition-colors shrink-0',
                  isSelected
                    ? 'bg-primary-900 text-white shadow-xs'
                    : 'bg-surface text-text-secondary hover:text-text-primary border border-border/80'
                )}
              >
                {chip.label}
              </button>
            )
          })}
        </div>

        {/* Results Container */}
        <div
          ref={resultsContainerRef}
          className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-border/40 text-left"
        >
          {query.trim() === '' ? (
            // Empty query state: Quick Links & Suggestions
            <div className="p-3">
              <div className="flex items-center gap-1.5 text-caption font-semibold text-text-muted uppercase tracking-wider mb-3 px-2">
                <Sparkles className="w-3.5 h-3.5 text-primary-600" aria-hidden="true" />
                <span>Suggested Campus Destinations</span>
              </div>
              <div className="space-y-1">
                {QUICK_LINKS.map((link, idx) => {
                  const Icon = link.icon
                  const isSelected = selectedIndex === idx
                  return (
                    <button
                      key={link.title}
                      data-index={idx}
                      type="button"
                      onClick={() => handleSelectItem(link.url)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={cn(
                        'w-full flex items-center justify-between p-3 rounded-card text-left transition-colors',
                        isSelected ? 'bg-primary-50 text-primary-950 font-medium' : 'hover:bg-canvas text-text-primary'
                      )}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={cn(
                          'w-9 h-9 rounded-button flex items-center justify-center shrink-0',
                          isSelected ? 'bg-primary-600 text-white' : 'bg-canvas text-text-secondary border border-border/60'
                        )}>
                          <Icon className="w-4 h-4" aria-hidden="true" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-small font-semibold text-text-primary truncate">{link.title}</div>
                          <div className="text-caption text-text-muted truncate">{link.subtitle}</div>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-text-muted shrink-0 ml-2" />
                    </button>
                  )
                })}
              </div>
            </div>
          ) : filteredResults.length > 0 ? (
            // Filtered results list
            <div className="p-1 space-y-1">
              <div className="text-xs text-text-muted font-medium px-3 py-1.5">
                Found {filteredResults.length} matching result{filteredResults.length === 1 ? '' : 's'}
              </div>
              {filteredResults.map((result, idx) => {
                const Icon = result.icon
                const isSelected = selectedIndex === idx
                return (
                  <button
                    key={result.id}
                    data-index={idx}
                    type="button"
                    onClick={() => handleSelectItem(result.url)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={cn(
                      'w-full flex items-center justify-between p-3 rounded-card text-left transition-colors',
                      isSelected ? 'bg-primary-50 text-primary-950 font-medium' : 'hover:bg-canvas text-text-primary'
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={cn(
                        'w-9 h-9 rounded-button flex items-center justify-center shrink-0',
                        isSelected ? 'bg-primary-600 text-white' : 'bg-canvas text-text-secondary border border-border/60'
                      )}>
                        <Icon className="w-4 h-4" aria-hidden="true" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-small font-semibold text-text-primary truncate">
                            {result.title}
                          </span>
                          <Badge variant="default" size="sm" className="shrink-0 text-[10px] py-0 px-1.5">
                            {result.categoryLabel}
                          </Badge>
                        </div>
                        <div className="text-caption text-text-secondary truncate">
                          {result.subtitle}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className={cn(
                      'w-4 h-4 shrink-0 ml-3',
                      isSelected ? 'text-primary-600' : 'text-text-muted'
                    )} />
                  </button>
                )
              })}
            </div>
          ) : (
            // Empty results state
            <div className="py-12 px-4 text-center">
              <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto mb-3 text-text-muted">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="text-body font-semibold text-text-primary mb-1">
                No results found for "{query}"
              </h3>
              <p className="text-small text-text-muted max-w-sm mx-auto">
                Check your spelling or try searching for general keywords like "library", "exam", "coding", or "canteen".
              </p>
            </div>
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-2.5 bg-canvas border-t border-border flex items-center justify-between text-xs text-text-muted">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-surface border border-border rounded font-mono">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-surface border border-border rounded font-mono">↓</kbd>
              to navigate
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-surface border border-border rounded font-mono">↵</kbd>
              to select
            </span>
            <span className="inline-flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-surface border border-border rounded font-mono">ESC</kbd>
              to dismiss
            </span>
          </div>
          <span className="hidden sm:inline font-medium text-text-secondary">Campus Companion Search</span>
        </div>
      </div>
    </div>
  )
}
