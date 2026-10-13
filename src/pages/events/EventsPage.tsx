import React, { useState, useMemo } from 'react'
import { Calendar, Filter, Sparkles, X } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { SearchBar } from '@/components/ui/SearchBar'
import { Chip } from '@/components/ui/Chip'
import { Tabs } from '@/components/ui/Tabs'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { EventCard } from '@/components/domain/EventCard'
import { useUserStore } from '@/store/useUserStore'
import { useSimulatedLoad } from '@/hooks/useSimulatedLoad'
import { useDebounce } from '@/hooks/useDebounce'
import { EventCategory } from '@/types'

const CATEGORIES: { id: string; label: string }[] = [
  { id: 'all', label: 'All Categories' },
  { id: 'workshop', label: 'Workshops' },
  { id: 'hackathon', label: 'Hackathons' },
  { id: 'seminar', label: 'Seminars' },
  { id: 'cultural', label: 'Cultural' },
  { id: 'competition', label: 'Competitions' },
  { id: 'sports', label: 'Sports' },
]

export const EventsPage: React.FC = () => {
  const { events, registeredEventIds } = useUserStore()
  const { isLoading, hasError, retry } = useSimulatedLoad({ duration: 500 })

  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebounce(searchQuery, 250)

  const [selectedCategory, setSelectedCategory] = useState('all')
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all')
  const [activeTab, setActiveTab] = useState<'all' | 'registered'>('all')
  const [sortOrder, setSortOrder] = useState<'soonest' | 'latest'>('soonest')

  const filteredEvents = useMemo(() => {
    return events
      .filter((event) => {
        // Tab filter: all or registered only
        if (activeTab === 'registered' && !registeredEventIds.includes(event.id)) {
          return false
        }

        // Category filter
        if (selectedCategory !== 'all' && event.category !== selectedCategory) {
          return false
        }

        // Search filter
        if (debouncedSearch.trim()) {
          const q = debouncedSearch.toLowerCase()
          const matchesTitle = event.title.toLowerCase().includes(q)
          const matchesDesc = event.description.toLowerCase().includes(q)
          const matchesTags = event.tags.some((tag) => tag.toLowerCase().includes(q))
          if (!matchesTitle && !matchesDesc && !matchesTags) {
            return false
          }
        }

        // Date filter
        const eventDate = new Date(`${event.date}T00:00:00`)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        if (dateFilter === 'today') {
          const isSameDay =
            eventDate.getFullYear() === today.getFullYear() &&
            eventDate.getMonth() === today.getMonth() &&
            eventDate.getDate() === today.getDate()
          if (!isSameDay) return false
        } else if (dateFilter === 'week') {
          const oneWeekAhead = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)
          if (eventDate < today || eventDate > oneWeekAhead) return false
        } else if (dateFilter === 'month') {
          const oneMonthAhead = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
          if (eventDate < today || eventDate > oneMonthAhead) return false
        }

        return true
      })
      .sort((a, b) => {
        const timeA = new Date(`${a.date}T${a.startTime}`).getTime()
        const timeB = new Date(`${b.date}T${b.startTime}`).getTime()
        return sortOrder === 'soonest' ? timeA - timeB : timeB - timeA
      })
  }, [events, registeredEventIds, activeTab, selectedCategory, debouncedSearch, dateFilter, sortOrder])

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setDateFilter('all')
    setActiveTab('all')
    setSortOrder('soonest')
  }

  const hasActiveFilters =
    Boolean(searchQuery) ||
    selectedCategory !== 'all' ||
    dateFilter !== 'all' ||
    activeTab !== 'all'

  if (hasError) {
    return (
      <div className="py-8">
        <ErrorState
          title="Failed to Load Events"
          message="Could not load the campus events catalog. Please try again."
          onRetry={retry}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-16 text-left">
      <PageHeader
        title="Campus Events & Hackathons"
        subtitle="Workshops, guest lectures, cultural fests, and competitive leagues."
      />

      {/* Tabs: All Events vs Registered */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-3">
        <Tabs
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id as 'all' | 'registered')}
          tabs={[
            { id: 'all', label: 'All Events', count: events.length },
            { id: 'registered', label: 'My Registered', count: registeredEventIds.length },
          ]}
        />

        {/* Date Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <span className="text-caption font-semibold text-text-muted flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Time:</span>
          </span>
          {[
            { id: 'all', label: 'All' },
            { id: 'today', label: 'Today' },
            { id: 'week', label: 'This Week' },
            { id: 'month', label: 'This Month' },
          ].map((df) => (
            <button
              key={df.id}
              type="button"
              onClick={() => setDateFilter(df.id as 'all' | 'today' | 'week' | 'month')}
              className={`px-3 py-1 text-caption font-medium rounded-full transition-colors whitespace-nowrap ${
                dateFilter === df.id
                  ? 'bg-primary-600 text-white font-semibold shadow-sm'
                  : 'bg-surface hover:bg-canvas text-text-secondary border border-border'
              }`}
            >
              {df.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search and Sort Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-center">
        <div className="md:col-span-3">
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events by title, topics, or technologies..."
          />
        </div>

        <div className="flex items-center gap-2 justify-end">
          <label htmlFor="sort-events-select" className="sr-only">
            Sort events
          </label>
          <select
            id="sort-events-select"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'soonest' | 'latest')}
            className="w-full h-11 px-3 py-2 text-small bg-surface border border-border rounded-input text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-600"
          >
            <option value="soonest">Sort: Soonest First</option>
            <option value="latest">Sort: Latest First</option>
          </select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              title="Clear all active filters"
              aria-label="Clear all active filters"
              leftIcon={<X className="w-4 h-4" />}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Category Chips Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {CATEGORIES.map((cat) => (
          <Chip
            key={cat.id}
            label={cat.label}
            selected={selectedCategory === cat.id}
            onClick={() => setSelectedCategory(cat.id as EventCategory | 'all')}
          />
        ))}
      </div>

      {/* Loading Skeletons */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        activeTab === 'registered' ? (
          <EmptyState
            icon={<Calendar className="w-8 h-8 text-primary-600" />}
            title="No Registered Events"
            description="You have not registered for any events yet. Explore upcoming hackathons and workshops to enroll."
            action={
              <Button variant="primary" size="md" onClick={() => setActiveTab('all')}>
                Browse Upcoming Events
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={<Sparkles className="w-8 h-8 text-primary-600" />}
            title="No Matching Events Found"
            description="No events match your current filter and search criteria. Try resetting your search."
            action={
              <Button variant="outline" size="md" onClick={clearFilters}>
                Clear All Filters
              </Button>
            }
          />
        )
      ) : (
        /* Event Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {filteredEvents.map((evt) => (
            <EventCard
              key={evt.id}
              event={evt}
              isRegistered={registeredEventIds.includes(evt.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
