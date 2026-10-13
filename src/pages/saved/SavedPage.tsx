import React, { useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import {
  Calendar,
  Users,
  MapPin,
  ArrowRight,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Tabs } from '@/components/ui/Tabs'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { EventCard } from '@/components/domain/EventCard'
import { ClubCard } from '@/components/domain/ClubCard'
import { LocationCard } from '@/components/domain/LocationCard'
import { useUserStore } from '@/store/useUserStore'
import { useToastStore } from '@/store/useToastStore'
import { LOCATIONS } from '@/data/locations'

export const SavedPage: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTab = searchParams.get('tab') || 'events'

  const [activeTab, setActiveTab] = useState(
    ['events', 'clubs', 'locations'].includes(initialTab) ? initialTab : 'events'
  )

  const {
    events,
    clubs,
    registeredEventIds,
    joinedClubIds,
    savedLocationIds,
    cancelEvent,
    leaveClub,
    toggleSaveLocation,
  } = useUserStore()
  const { push: pushToast } = useToastStore()

  // Selected item for leave / cancel modals
  const [targetClubId, setTargetClubId] = useState<string | null>(null)
  const [targetEventId, setTargetEventId] = useState<string | null>(null)

  const registeredEvents = events.filter((e) => registeredEventIds.includes(e.id))
  const joinedClubs = clubs.filter((c) => joinedClubIds.includes(c.id))
  const savedLocations = LOCATIONS.filter((l) => savedLocationIds.includes(l.id))

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    setSearchParams({ tab: tabId })
  }

  const handleConfirmCancelEvent = () => {
    if (!targetEventId) return
    const res = cancelEvent(targetEventId)
    pushToast({
      type: 'info',
      message: res.message,
    })
    setTargetEventId(null)
  }

  const handleConfirmLeaveClub = () => {
    if (!targetClubId) return
    const res = leaveClub(targetClubId)
    pushToast({
      type: 'info',
      message: res.message,
    })
    setTargetClubId(null)
  }

  const handleToggleLocationBookmark = (locationId: string) => {
    const res = toggleSaveLocation(locationId)
    pushToast({
      type: res.saved ? 'success' : 'info',
      message: res.saved ? 'Location bookmarked to your saved list.' : 'Location removed from your bookmarks.',
    })
  }

  const targetEvent = events.find((e) => e.id === targetEventId)
  const targetClub = clubs.find((c) => c.id === targetClubId)

  return (
    <div className="space-y-6 pb-16 text-left max-w-6xl mx-auto">
      <PageHeader
        title="Saved & Registered"
        subtitle="Manage your confirmed event registrations, club memberships, and pinned campus locations."
      />

      {/* Tabs */}
      <Tabs
        tabs={[
          {
            id: 'events',
            label: `Registered Events (${registeredEvents.length})`,
            icon: <Calendar className="w-4 h-4" />,
          },
          {
            id: 'clubs',
            label: `Joined Clubs (${joinedClubs.length})`,
            icon: <Users className="w-4 h-4" />,
          },
          {
            id: 'locations',
            label: `Saved Locations (${savedLocations.length})`,
            icon: <MapPin className="w-4 h-4" />,
          },
        ]}
        activeTab={activeTab}
        onChange={handleTabChange}
        variant="pill"
      />

      {/* Tab 1: Registered Events */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          {registeredEvents.length === 0 ? (
            <Card padding="lg" className="py-16">
              <EmptyState
                icon={<Calendar className="w-7 h-7" aria-hidden="true" />}
                title="No registered events"
                description="You have not enrolled in any upcoming workshops, hackathons, or guest lectures yet."
                action={
                  <Link to="/events">
                    <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                      Explore Campus Events
                    </Button>
                  </Link>
                }
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {registeredEvents.map((evt) => (
                <div key={evt.id} className="relative flex flex-col justify-between">
                  <EventCard event={evt} isRegistered={true} />
                  <div className="mt-2 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs text-text-muted hover:text-accent-red"
                      onClick={() => setTargetEventId(evt.id)}
                    >
                      Cancel Registration
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Joined Clubs */}
      {activeTab === 'clubs' && (
        <div className="space-y-4">
          {joinedClubs.length === 0 ? (
            <Card padding="lg" className="py-16">
              <EmptyState
                icon={<Users className="w-7 h-7" aria-hidden="true" />}
                title="No club memberships"
                description="Join technical, robotics, cultural, or arts societies to collaborate with student peers."
                action={
                  <Link to="/clubs">
                    <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                      Discover Student Clubs
                    </Button>
                  </Link>
                }
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {joinedClubs.map((club) => (
                <ClubCard
                  key={club.id}
                  club={club}
                  isJoined={true}
                  onToggleJoin={() => setTargetClubId(club.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Saved Locations */}
      {activeTab === 'locations' && (
        <div className="space-y-4">
          {savedLocations.length === 0 ? (
            <Card padding="lg" className="py-16">
              <EmptyState
                icon={<MapPin className="w-7 h-7" aria-hidden="true" />}
                title="No saved locations"
                description="Bookmark seminar halls, computer labs, library rooms, and canteen stops on the campus map."
                action={
                  <Link to="/map">
                    <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                      Open Campus Map
                    </Button>
                  </Link>
                }
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedLocations.map((loc) => (
                <div key={loc.id} className="relative group">
                  <LocationCard
                    location={loc}
                    isSaved={true}
                    onSelect={() => navigate(`/map/${loc.id}`)}
                    onToggleSave={() => handleToggleLocationBookmark(loc.id)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cancel Event Registration Modal */}
      <Modal
        isOpen={Boolean(targetEventId)}
        onClose={() => setTargetEventId(null)}
        title="Cancel Event Registration?"
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" size="sm" onClick={() => setTargetEventId(null)}>
              Keep Registration
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="bg-accent-red hover:bg-accent-red/90 text-white"
              onClick={handleConfirmCancelEvent}
            >
              Confirm Cancellation
            </Button>
          </div>
        }
      >
        <p className="text-small text-text-secondary">
          Are you sure you want to cancel your pass for{' '}
          <strong className="text-text-primary">{targetEvent?.title}</strong>? Your seat will be freed for students on the waiting list.
        </p>
      </Modal>

      {/* Leave Club Modal */}
      <Modal
        isOpen={Boolean(targetClubId)}
        onClose={() => setTargetClubId(null)}
        title="Leave Society / Club?"
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" size="sm" onClick={() => setTargetClubId(null)}>
              Stay a Member
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="bg-accent-red hover:bg-accent-red/90 text-white"
              onClick={handleConfirmLeaveClub}
            >
              Leave Club
            </Button>
          </div>
        }
      >
        <p className="text-small text-text-secondary">
          Are you sure you want to leave{' '}
          <strong className="text-text-primary">{targetClub?.name}</strong>? You will stop receiving meeting circulars and updates.
        </p>
      </Modal>
    </div>
  )
}
