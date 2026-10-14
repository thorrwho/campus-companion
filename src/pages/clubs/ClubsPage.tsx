import React, { useState, useMemo } from 'react'
import { Users, X } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { SearchBar } from '@/components/ui/SearchBar'
import { Chip } from '@/components/ui/Chip'
import { Tabs } from '@/components/ui/Tabs'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { ClubCard } from '@/components/domain/ClubCard'
import { useUserStore } from '@/store/useUserStore'
import { useToastStore } from '@/store/useToastStore'
import { useContentStore } from '@/store/useContentStore'
import { useSimulatedLoad } from '@/hooks/useSimulatedLoad'
import { useDebounce } from '@/hooks/useDebounce'
import { Club, ClubCategory } from '@/types'

const CLUB_CATEGORIES: { id: string; label: string }[] = [
  { id: 'all', label: 'All Societies' },
  { id: 'technical', label: 'Technical' },
  { id: 'cultural', label: 'Cultural' },
  { id: 'sports', label: 'Sports' },
  { id: 'social', label: 'Social Service' },
  { id: 'literary', label: 'Literary & Debating' },
]

export const ClubsPage: React.FC = () => {
  const clubs = useContentStore((state) => state.clubs)
  const { joinedClubIds, joinClub, leaveClub } = useUserStore()
  const { push: pushToast } = useToastStore()
  const { isLoading, hasError, retry } = useSimulatedLoad({ duration: 500 })

  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebounce(searchQuery, 200)

  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [activeTab, setActiveTab] = useState<'all' | 'joined'>('all')

  // Modal for leave club confirmation
  const [clubToLeave, setClubToLeave] = useState<Club | null>(null)

  const filteredClubs = useMemo(() => {
    return clubs.filter((club) => {
      // Inactive clubs hidden from student list
      if (club.status === 'Inactive') return false

      // Tab filter
      if (activeTab === 'joined' && !joinedClubIds.includes(club.id)) {
        return false
      }

      // Category filter
      if (selectedCategory !== 'all' && club.category !== selectedCategory) {
        return false
      }

      // Search filter
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase()
        const matchName = club.name.toLowerCase().includes(q)
        const matchDesc = club.description.toLowerCase().includes(q)
        const matchActivities = club.activities.some((act) => act.toLowerCase().includes(q))
        if (!matchName && !matchDesc && !matchActivities) {
          return false
        }
      }

      return true
    })
  }, [clubs, joinedClubIds, activeTab, selectedCategory, debouncedSearch])

  const handleToggleJoin = (club: Club, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (joinedClubIds.includes(club.id)) {
      // Prompt confirmation before leaving
      setClubToLeave(club)
    } else {
      const res = joinClub(club.id)
      pushToast({
        type: 'success',
        message: res.message,
      })
    }
  }

  const handleConfirmLeave = () => {
    if (clubToLeave) {
      const res = leaveClub(clubToLeave.id)
      pushToast({
        type: 'info',
        message: res.message,
      })
      setClubToLeave(null)
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setActiveTab('all')
  }

  const hasActiveFilters = Boolean(searchQuery) || selectedCategory !== 'all' || activeTab !== 'all'

  if (hasError) {
    return (
      <div className="py-8">
        <ErrorState
          title="Failed to Load Clubs"
          message="Could not load the campus student organizations. Please try again."
          onRetry={retry}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-16 text-left">
      <PageHeader
        title="Student Clubs & Societies"
        subtitle="Discover student collectives across engineering, fine arts, sports, social outreach, and literature."
      />

      {/* Tabs Row: All Clubs vs My Clubs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-3">
        <Tabs
          activeTab={activeTab}
          onChange={(id) => setActiveTab(id as 'all' | 'joined')}
          tabs={[
            { id: 'all', label: 'All Campus Clubs', count: clubs.length },
            { id: 'joined', label: 'My Clubs', count: joinedClubIds.length },
          ]}
        />

        <div className="flex items-center gap-3">
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search clubs by name or interests..."
            className="w-full sm:w-64"
          />

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              leftIcon={<X className="w-4 h-4" />}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Category Chips Carousel */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {CLUB_CATEGORIES.map((cat) => (
          <Chip
            key={cat.id}
            label={cat.label}
            selected={selectedCategory === cat.id}
            onClick={() => setSelectedCategory(cat.id as ClubCategory | 'all')}
          />
        ))}
      </div>

      {/* Grid of Clubs */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredClubs.length === 0 ? (
        activeTab === 'joined' ? (
          <EmptyState
            icon={<Users className="w-8 h-8 text-primary-600" />}
            title="You Have Not Joined Any Clubs Yet"
            description="Explore our campus societies and click Join Club to receive regular meeting updates and activities."
            action={
              <Button variant="primary" size="md" onClick={() => setActiveTab('all')}>
                Browse Campus Clubs
              </Button>
            }
          />
        ) : (
          <EmptyState
            icon={<Users className="w-8 h-8 text-primary-600" />}
            title="No Clubs Found"
            description="No student clubs match your current search and category criteria."
            action={
              <Button variant="outline" size="md" onClick={clearFilters}>
                Clear Filters
              </Button>
            }
          />
        )
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {filteredClubs.map((club) => (
            <ClubCard
              key={club.id}
              club={club}
              isJoined={joinedClubIds.includes(club.id)}
              onToggleJoin={(e) => handleToggleJoin(club, e)}
            />
          ))}
        </div>
      )}

      {/* Confirmation Modal: Leave Club */}
      <Modal
        isOpen={Boolean(clubToLeave)}
        onClose={() => setClubToLeave(null)}
        title="Leave Student Club?"
        description={clubToLeave ? `Are you sure you want to leave ${clubToLeave.name}?` : ''}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setClubToLeave(null)}>
              Stay in Club
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmLeave}>
              Confirm Leave
            </Button>
          </>
        }
      >
        <p className="text-small text-text-secondary">
          You will no longer receive weekly meeting reminders or priority registration notifications for events hosted by this club.
        </p>
      </Modal>
    </div>
  )
}
