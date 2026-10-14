import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Users,
  Calendar,
  Clock,
  User,
  ArrowLeft,
  CheckCircle,
  Activity,
  CalendarDays,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { ErrorState } from '@/components/ui/ErrorState'
import { EventCard } from '@/components/domain/EventCard'
import { useUserStore } from '@/store/useUserStore'
import { useToastStore } from '@/store/useToastStore'
import { useContentStore } from '@/store/useContentStore'

export const ClubDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const clubs = useContentStore((state) => state.clubs)
  const events = useContentStore((state) => state.events)
  const { joinedClubIds, joinClub, leaveClub, registeredEventIds } = useUserStore()
  const { push: pushToast } = useToastStore()

  const club = clubs.find((c) => c.id === id)
  const isJoined = club ? joinedClubIds.includes(club.id) : false

  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false)

  if (!club) {
    return (
      <div className="py-12">
        <ErrorState
          title="Club Not Found"
          message="We could not find the campus club requested. It may have been archived or removed."
          onRetry={() => navigate('/clubs')}
        />
      </div>
    )
  }

  const handleToggleJoin = () => {
    if (isJoined) {
      setIsLeaveModalOpen(true)
    } else {
      const res = joinClub(club.id)
      pushToast({
        type: 'success',
        message: res.message,
      })
    }
  }

  const handleConfirmLeave = () => {
    setIsLeaveModalOpen(false)
    const res = leaveClub(club.id)
    pushToast({
      type: 'info',
      message: res.message,
    })
  }

  // Find linked upcoming events
  const clubUpcomingEvents = events.filter(
    (e) => (club.upcomingEventIds && club.upcomingEventIds.includes(e.id)) || e.organizerClubId === club.id
  )

  return (
    <div className="space-y-8 pb-16 text-left max-w-4xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          to="/clubs"
          className="inline-flex items-center gap-1.5 text-small font-medium text-text-secondary hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-button"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to All Clubs</span>
        </Link>
      </div>

      {/* Hero Header Card */}
      <Card className="p-6 sm:p-10 space-y-4 bg-gradient-to-br from-surface to-canvas border-border shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Badge variant="primary" size="md">
            {club.category.toUpperCase()}
          </Badge>

          <span className="flex items-center gap-1.5 text-small font-bold text-primary-700 bg-accent-100 px-3 py-1 rounded-full">
            <Users className="w-4 h-4" aria-hidden="true" />
            <span>{club.memberCount} Active Members</span>
          </span>
        </div>

        <h1 className="text-display font-bold text-text-primary tracking-tight">
          {club.name}
        </h1>

        <p className="text-body text-text-secondary leading-relaxed max-w-2xl">
          {club.description}
        </p>

        {/* Join action bar */}
        <div className="pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {isJoined ? (
              <Badge variant="success" icon={<CheckCircle className="w-3.5 h-3.5" />}>
                You are a member
              </Badge>
            ) : (
              <span className="text-caption text-text-muted">
                Open to all students across all academic departments and semesters.
              </span>
            )}
          </div>

          <Button
            variant={isJoined ? 'outline' : 'primary'}
            size="md"
            onClick={handleToggleJoin}
            leftIcon={isJoined ? <CheckCircle className="w-4 h-4 text-status-success" /> : undefined}
          >
            {isJoined ? 'Leave Club' : 'Join Club (Free)'}
          </Button>
        </div>
      </Card>

      {/* Main Grid: Info + Activities */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Left Column (2 cols): Activities & Upcoming Events */}
        <div className="md:col-span-2 space-y-6">
          {/* Key Activities */}
          <Card className="p-6 space-y-4">
            <h2 className="text-h2 font-semibold text-text-primary flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary-600" aria-hidden="true" />
              <span>Core Activities & Initiatives</span>
            </h2>

            <ul className="space-y-3">
              {club.activities.map((act, index) => (
                <li key={index} className="flex items-start gap-3 text-small text-text-secondary">
                  <span className="w-2 h-2 rounded-full bg-primary-600 shrink-0 mt-2" aria-hidden="true" />
                  <span className="leading-normal">{act}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Upcoming Events Hosted by this Club */}
          <div className="space-y-4">
            <h2 className="text-h2 font-semibold text-text-primary flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary-600" aria-hidden="true" />
              <span>Upcoming Hosted Events</span>
            </h2>

            {clubUpcomingEvents.length === 0 ? (
              <Card className="p-6 text-center text-small text-text-muted">
                No events currently scheduled by this club. Check back soon for new hackathons and fests!
              </Card>
            ) : (
              <div className="space-y-4">
                {clubUpcomingEvents.map((event) => (
                  <EventCard
                    key={event.id}
                    event={event}
                    isRegistered={registeredEventIds.includes(event.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 col): Logistics & Coordinator */}
        <div className="space-y-6">
          <Card className="p-6 space-y-5">
            <h3 className="text-small font-semibold text-text-muted uppercase tracking-wider">
              Meeting Logistics
            </h3>

            <div className="space-y-3 text-small">
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <span className="text-caption font-semibold text-text-muted block">
                    Routine Schedule
                  </span>
                  <span className="text-text-primary font-medium">
                    {club.meetingSchedule}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2 border-t border-border">
                <User className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <span className="text-caption font-semibold text-text-muted block">
                    Student Coordinator
                  </span>
                  <span className="text-text-primary font-medium">
                    {club.coordinator}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 pt-2 border-t border-border">
                <Calendar className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <span className="text-caption font-semibold text-text-muted block">
                    Affiliation
                  </span>
                  <span className="text-text-primary font-medium">
                    Student Activity Council (SAC)
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal: Leave Club */}
      <Modal
        isOpen={isLeaveModalOpen}
        onClose={() => setIsLeaveModalOpen(false)}
        title="Leave Student Club?"
        description={`Are you sure you want to leave ${club.name}?`}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsLeaveModalOpen(false)}>
              Keep Membership
            </Button>
            <Button variant="danger" size="sm" onClick={handleConfirmLeave}>
              Confirm Leave
            </Button>
          </>
        }
      >
        <p className="text-small text-text-secondary">
          You will stop receiving weekly circulars and notifications about upcoming events hosted by this club.
        </p>
      </Modal>
    </div>
  )
}
