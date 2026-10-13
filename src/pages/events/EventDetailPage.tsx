import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  Download,
  ArrowLeft,
  Code,
  Laptop,
  Music,
  Trophy,
  Award,
  Sparkles,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { ErrorState } from '@/components/ui/ErrorState'
import { useUserStore } from '@/store/useUserStore'
import { useToastStore } from '@/store/useToastStore'
import { LOCATIONS } from '@/data/locations'
import { CLUBS } from '@/data/clubs'
import { generateICS } from '@/lib/calendar'
import { EventCategory } from '@/types'

export const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { events, registeredEventIds, registerEvent, cancelEvent } = useUserStore()
  const { push: pushToast } = useToastStore()

  const event = events.find((e) => e.id === id)

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)

  if (!event) {
    return (
      <div className="py-12">
        <ErrorState
          title="Event Not Found"
          message="We could not find the campus event requested. It may have been rescheduled or removed."
          onRetry={() => navigate('/events')}
        />
      </div>
    )
  }

  const location = LOCATIONS.find((l) => l.id === event.locationId)
  const organizerClub = CLUBS.find((c) => c.id === event.organizerClubId)
  const isRegistered = registeredEventIds.includes(event.id)

  const eventDateObj = new Date(`${event.date}T${event.endTime}:00`)
  const isPast = new Date() > eventDateObj
  const isFull = event.registeredCount >= event.capacity
  const isDeadlinePassed = new Date() > new Date(event.registrationDeadline)

  const seatsLeft = Math.max(0, event.capacity - event.registeredCount)
  const percentFilled = Math.min(100, Math.round((event.registeredCount / event.capacity) * 100))

  const handleRegisterConfirm = () => {
    setIsRegisterModalOpen(false)
    const result = registerEvent(event.id)
    if (result.success) {
      pushToast({
        type: 'success',
        message: result.message,
      })
    } else {
      pushToast({
        type: 'error',
        message: result.message,
      })
    }
  }

  const handleCancelConfirm = () => {
    setIsCancelModalOpen(false)
    const result = cancelEvent(event.id)
    pushToast({
      type: 'info',
      message: result.message,
    })
  }

  const handleDownloadICS = () => {
    generateICS(event)
    pushToast({
      type: 'info',
      message: `Downloaded ${event.title}.ics to your device.`,
    })
  }

  // Category Icon & Banner Theme (no stock photos!)
  const categoryIconMap: Record<EventCategory, React.ReactNode> = {
    hackathon: <Code className="w-12 h-12 text-white" aria-hidden="true" />,
    workshop: <Laptop className="w-12 h-12 text-white" aria-hidden="true" />,
    cultural: <Music className="w-12 h-12 text-white" aria-hidden="true" />,
    competition: <Trophy className="w-12 h-12 text-white" aria-hidden="true" />,
    sports: <Award className="w-12 h-12 text-white" aria-hidden="true" />,
    seminar: <Sparkles className="w-12 h-12 text-white" aria-hidden="true" />,
  }

  const categoryColorMap: Record<EventCategory, string> = {
    hackathon: 'from-primary-900 via-primary-700 to-primary-600',
    workshop: 'from-blue-900 via-indigo-800 to-primary-600',
    cultural: 'from-purple-900 via-indigo-900 to-primary-700',
    competition: 'from-amber-900 via-primary-900 to-primary-700',
    sports: 'from-emerald-900 via-teal-900 to-primary-800',
    seminar: 'from-slate-900 via-primary-900 to-primary-700',
  }

  return (
    <div className="space-y-8 pb-16 text-left max-w-4xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          to="/events"
          className="inline-flex items-center gap-1.5 text-small font-medium text-text-secondary hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-button"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to All Events</span>
        </Link>
      </div>

      {/* Hero Banner Area */}
      <div
        className={`w-full rounded-card bg-gradient-to-r ${categoryColorMap[event.category]} p-6 sm:p-10 text-white shadow-card relative overflow-hidden`}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <Badge variant="primary" size="md">
                {event.category.toUpperCase()}
              </Badge>
              {isRegistered && (
                <Badge variant="success" icon={<CheckCircle className="w-3.5 h-3.5" />}>
                  You are registered
                </Badge>
              )}
            </div>

            <h1 className="text-display font-bold text-white tracking-tight leading-tight">
              {event.title}
            </h1>

            <p className="text-small text-accent-100/90 flex flex-wrap items-center gap-4">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-accent-200" aria-hidden="true" />
                {event.date}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-accent-200" aria-hidden="true" />
                {event.startTime} to {event.endTime}
              </span>
            </p>
          </div>

          <div className="hidden md:flex w-24 h-24 rounded-modal bg-white/10 backdrop-blur-sm border border-white/20 items-center justify-center shrink-0 shadow-overlay">
            {categoryIconMap[event.category]}
          </div>
        </div>
      </div>

      {/* Main Grid: Details + Registration Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Left Column (2 cols): Description, Organizer, Tags */}
        <div className="md:col-span-2 space-y-6">
          <Card className="p-6 space-y-4">
            <h2 className="text-h2 font-semibold text-text-primary">About this Event</h2>
            <p className="text-body text-text-secondary leading-relaxed whitespace-pre-line">
              {event.description}
            </p>

            <div className="pt-4 border-t border-border space-y-3">
              <h3 className="text-small font-semibold text-text-muted uppercase tracking-wider">
                Event Topics & Technologies
              </h3>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full bg-canvas border border-border text-caption font-medium text-text-primary"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          </Card>

          {/* Organizer Club Info */}
          {organizerClub && (
            <Card className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-caption text-text-muted uppercase font-semibold">
                    Organized by
                  </span>
                  <h3 className="text-h3 font-semibold text-text-primary mt-0.5">
                    {organizerClub.name}
                  </h3>
                </div>
                <Link to={`/clubs/${organizerClub.id}`}>
                  <Button variant="outline" size="sm">
                    View Club
                  </Button>
                </Link>
              </div>
              <p className="text-small text-text-secondary">
                {organizerClub.shortDescription}
              </p>
            </Card>
          )}

          {/* Venue & Directions Card */}
          {location && (
            <Card className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-caption text-text-muted uppercase font-semibold">
                    Campus Location
                  </span>
                  <h3 className="text-h3 font-semibold text-text-primary mt-0.5 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary-600" aria-hidden="true" />
                    {location.name}
                  </h3>
                </div>
                <Link to={`/map/${location.id}`}>
                  <Button variant="outline" size="sm">
                    Open Map
                  </Button>
                </Link>
              </div>
              <p className="text-small text-text-secondary">
                {location.building}, {location.floor}
              </p>
            </Card>
          )}
        </div>

        {/* Right Column (1 col): Registration Action Box */}
        <div className="space-y-6">
          <Card className="p-6 space-y-5 shadow-card">
            <div>
              <span className="text-caption text-text-muted uppercase font-semibold block">
                Registration Status
              </span>
              <div className="mt-1 flex items-center justify-between">
                <span className="text-h3 font-bold text-text-primary">
                  {event.registeredCount} / {event.capacity}
                </span>
                <span className="text-caption text-text-muted font-medium">
                  {seatsLeft} seats remaining
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-canvas h-2 rounded-full overflow-hidden border border-border/40 mt-2" aria-hidden="true">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    isFull ? 'bg-status-error' : percentFilled > 80 ? 'bg-status-warning' : 'bg-primary-600'
                  }`}
                  style={{ width: `${percentFilled}%` }}
                />
              </div>
            </div>

            {/* Registration Action Buttons */}
            <div className="pt-2 space-y-3">
              {isRegistered ? (
                <div className="space-y-3">
                  <div className="p-3.5 rounded-card bg-status-success-bg/30 border border-status-success/30 text-status-success flex items-start gap-2.5">
                    <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" aria-hidden="true" />
                    <div className="text-small font-medium leading-snug">
                      Your seat is confirmed! Present your student ID card at the entry desk.
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="md"
                    className="w-full"
                    onClick={handleDownloadICS}
                    leftIcon={<Download className="w-4 h-4" />}
                  >
                    Add to Calendar (.ics)
                  </Button>

                  <Button
                    variant="outline"
                    size="md"
                    className="w-full text-status-error hover:bg-status-error-bg/30 hover:border-status-error/40"
                    onClick={() => setIsCancelModalOpen(true)}
                  >
                    Cancel Registration
                  </Button>
                </div>
              ) : isPast ? (
                <div className="p-4 rounded-card bg-canvas border border-border text-center">
                  <p className="text-small font-semibold text-text-muted">
                    This event has already concluded.
                  </p>
                </div>
              ) : isFull ? (
                <div className="space-y-2">
                  <Button variant="primary" size="md" className="w-full" disabled>
                    Registration Full
                  </Button>
                  <p className="text-caption text-text-muted text-center">
                    All {event.capacity} seats have been claimed.
                  </p>
                </div>
              ) : isDeadlinePassed ? (
                <div className="space-y-2">
                  <Button variant="primary" size="md" className="w-full" disabled>
                    Registration Closed
                  </Button>
                  <p className="text-caption text-text-muted text-center">
                    The registration deadline has passed.
                  </p>
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="md"
                  className="w-full font-semibold shadow-card"
                  onClick={() => setIsRegisterModalOpen(true)}
                >
                  Register Now (Free)
                </Button>
              )}
            </div>

            {/* Event Meta Details */}
            <div className="pt-4 border-t border-border space-y-2 text-caption text-text-secondary">
              <div className="flex items-center justify-between">
                <span>Registration Deadline:</span>
                <span className="font-semibold text-text-primary">
                  {new Date(event.registrationDeadline).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Fee / Admission:</span>
                <span className="font-semibold text-status-success">Free for Students</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal: Register */}
      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        title="Confirm Event Registration"
        description={`Confirm your registration for ${event.title}`}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsRegisterModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleRegisterConfirm}>
              Confirm Registration
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-small text-text-secondary">
          <p>
            You are registering for <strong>{event.title}</strong> scheduled for{' '}
            <strong>
              {event.date} from {event.startTime} to {event.endTime}
            </strong>.
          </p>
          <p>
            Please ensure you arrive 15 minutes before the start time at{' '}
            <strong>{location?.name || 'the venue'}</strong>. Your student roll number will be placed on the attendee roster.
          </p>
        </div>
      </Modal>

      {/* Confirmation Modal: Cancel Registration */}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Event Registration?"
        description="Are you sure you want to release your seat for this event?"
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setIsCancelModalOpen(false)}>
              Keep Registration
            </Button>
            <Button variant="danger" size="sm" onClick={handleCancelConfirm}>
              Release Seat
            </Button>
          </>
        }
      >
        <p className="text-small text-text-secondary">
          Cancelling will open your seat for other students on the waitlist. You can re-register later if seats remain available.
        </p>
      </Modal>
    </div>
  )
}
