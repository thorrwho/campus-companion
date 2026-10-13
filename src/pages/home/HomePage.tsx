import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { format } from 'date-fns'
import {
  MapPin,
  Calendar,
  Users,
  BookOpen,
  Building2,
  Bookmark,
  Sparkles,
  ArrowRight,
  Coffee,
  HeartPulse,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Skeleton, SkeletonText } from '@/components/ui/Skeleton'
import { TimetableItem } from '@/components/domain/TimetableItem'
import { EventCard } from '@/components/domain/EventCard'
import { AnnouncementRow } from '@/components/domain/AnnouncementRow'
import { useAuthStore } from '@/store/useAuthStore'
import { useUserStore } from '@/store/useUserStore'
import { useToastStore } from '@/store/useToastStore'
import { useSimulatedLoad } from '@/hooks/useSimulatedLoad'
import { TIMETABLE_SLOTS } from '@/data/timetable'
import { ANNOUNCEMENTS } from '@/data/announcements'
import { DayOfWeek } from '@/types'

export const HomePage: React.FC = () => {
  const { user } = useAuthStore()
  const {
    events,
    registeredEventIds,
    readAnnouncementIds,
    markAnnouncementRead,
    markAllAnnouncementsRead,
  } = useUserStore()
  const { push: pushToast } = useToastStore()

  const { isLoading, hasError, retry } = useSimulatedLoad({ duration: 600 })

  // Determine current day of week and greeting
  const today = new Date()
  const daysMap: DayOfWeek[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const currentDayOfWeek = daysMap[today.getDay()]
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(
    currentDayOfWeek === 'Sunday' ? 'Monday' : currentDayOfWeek
  )

  const currentHour = today.getHours()
  const greeting =
    currentHour < 12
      ? 'Good morning'
      : currentHour < 17
      ? 'Good afternoon'
      : 'Good evening'

  const formattedDate = format(today, 'EEEE, MMMM d, yyyy')
  const firstName = user?.name ? user.name.split(' ')[0] : 'Student'

  // User's department and semester
  const userDept = user?.department || 'CSE-AIML'
  const userSem = user?.semester || 5

  // Filter timetable slots for selected day and department
  const daySlots = TIMETABLE_SLOTS.filter(
    (slot) =>
      slot.department === userDept &&
      slot.semester === userSem &&
      slot.day === selectedDay
  ).sort((a, b) => a.start.localeCompare(b.start))

  // Next 3 upcoming events
  const upcomingEvents = events
    .filter((e) => new Date(`${e.date}T${e.endTime}:00`) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3)

  // Top 4 announcements
  const latestAnnouncements = ANNOUNCEMENTS.slice(0, 4)

  // Registered events within next 48 hours
  const nowTime = today.getTime()
  const in48Hours = nowTime + 48 * 60 * 60 * 1000
  const upcomingReminders = events.filter((e) => {
    if (!registeredEventIds.includes(e.id)) return false
    const eventTime = new Date(`${e.date}T${e.startTime}:00`).getTime()
    return eventTime >= nowTime && eventTime <= in48Hours
  })

  const quickActions = [
    { label: 'Find a room', to: '/map', icon: MapPin, color: 'text-primary-600 bg-accent-100' },
    { label: 'Events', to: '/events', icon: Calendar, color: 'text-primary-600 bg-accent-100' },
    { label: 'Clubs', to: '/clubs', icon: Users, color: 'text-primary-600 bg-accent-100' },
    { label: 'Faculty', to: '/faculty', icon: BookOpen, color: 'text-primary-600 bg-accent-100' },
    { label: 'Facilities', to: '/facilities', icon: Building2, color: 'text-primary-600 bg-accent-100' },
    { label: 'Saved', to: '/saved', icon: Bookmark, color: 'text-primary-600 bg-accent-100' },
  ]

  const handleMarkAllRead = () => {
    markAllAnnouncementsRead(latestAnnouncements.map((a) => a.id))
    pushToast({
      type: 'info',
      message: 'All announcements marked as read.',
    })
  }

  if (hasError) {
    return (
      <div className="py-8">
        <ErrorState
          title="Failed to Load Dashboard"
          message="Could not load campus timetable and updates. Check connection or retry."
          onRetry={retry}
        />
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="space-y-8 animate-fade-in text-left">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-40" />
        </div>

        {/* 2-column layout skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="space-y-4">
              <Skeleton className="h-5 w-40" />
              <div className="space-y-3">
                <Skeleton className="h-16 w-full rounded-card" />
                <Skeleton className="h-16 w-full rounded-card" />
                <Skeleton className="h-16 w-full rounded-card" />
              </div>
            </Card>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full rounded-card" />
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <Card className="space-y-3">
              <Skeleton className="h-5 w-32" />
              <SkeletonText lines={3} />
            </Card>
            <Card className="space-y-3">
              <Skeleton className="h-5 w-32" />
              <SkeletonText lines={4} />
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12 text-left">
      {/* 1. Header & Greeting */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/80 pb-5">
        <div>
          <h1 className="text-display text-text-primary font-bold tracking-tight">
            {greeting}, {firstName}
          </h1>
          <p className="text-body text-text-secondary mt-1">
            {formattedDate} : {userDept} (Semester {userSem})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/map">
            <Button variant="outline" size="sm" leftIcon={<MapPin className="w-3.5 h-3.5" />}>
              Campus Map
            </Button>
          </Link>
          <Link to="/events">
            <Button variant="primary" size="sm" leftIcon={<Calendar className="w-3.5 h-3.5" />}>
              Browse Events
            </Button>
          </Link>
        </div>
      </header>

      {/* 2. Registered Event Reminder Banner (Within 48 hours) */}
      {upcomingReminders.length > 0 && (
        <section aria-label="Upcoming Event Reminders">
          {upcomingReminders.map((reminder) => (
            <div
              key={reminder.id}
              className="p-4 sm:p-5 rounded-card bg-gradient-to-r from-accent-100/90 to-surface border border-primary-600/30 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-card bg-primary-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <Sparkles className="w-5 h-5" aria-hidden="true" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Badge variant="primary" size="sm">
                      Happening Soon
                    </Badge>
                    <span className="text-[11px] font-semibold text-primary-700">
                      Within 48 Hours
                    </span>
                  </div>
                  <h2 className="text-h3 font-bold text-text-primary mt-1">
                    {reminder.title}
                  </h2>
                  <p className="text-small text-text-secondary mt-0.5 flex flex-wrap items-center gap-3">
                    <span>Date: {reminder.date} ({reminder.startTime} to {reminder.endTime})</span>
                    <Link
                      to={`/map/${reminder.locationId}`}
                      className="text-primary-600 hover:underline font-medium inline-flex items-center gap-1"
                    >
                      <MapPin className="w-3.5 h-3.5" aria-hidden="true" />
                      View Room on Map
                    </Link>
                  </p>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <Link to={`/events/${reminder.id}`}>
                  <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Event Passes & Details
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* 3. Main Dashboard Layout (2-Column on Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* ========================================
            LEFT COLUMN (Main Content: 2 cols)
            ======================================== */}
        <div className="lg:col-span-2 space-y-8">
          {/* A. Today's Timetable Section */}
          <section aria-labelledby="timetable-heading">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h2 id="timetable-heading" className="text-h2 font-semibold text-text-primary">
                  Today's Schedule
                </h2>
                <p className="text-caption text-text-secondary">
                  {selectedDay} classes for {userDept} Sem {userSem}
                </p>
              </div>

              {/* Day selector pill */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
                {(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as DayOfWeek[]).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSelectedDay(d)}
                    className={`px-2.5 py-1 text-caption font-medium rounded-full transition-colors whitespace-nowrap ${
                      selectedDay === d
                        ? 'bg-primary-600 text-white font-semibold shadow-sm'
                        : 'bg-surface hover:bg-canvas text-text-secondary border border-border'
                    }`}
                  >
                    {d.slice(0, 3)}
                  </button>
                ))}
              </div>
            </div>

            {daySlots.length === 0 ? (
              <EmptyState
                title="No Classes Scheduled"
                description={`No lectures scheduled for ${selectedDay}. Enjoy your academic study break!`}
                action={
                  <Link to="/map">
                    <Button variant="outline" size="sm" leftIcon={<MapPin className="w-3.5 h-3.5" />}>
                      Explore Campus
                    </Button>
                  </Link>
                }
              />
            ) : (
              <div className="space-y-3">
                {daySlots.map((slot, index) => {
                  // Mark the first upcoming or active slot
                  const slotStatus = index === 0 ? 'now' : index === 1 ? 'next' : 'normal'
                  return <TimetableItem key={slot.id} slot={slot} status={slotStatus} />
                })}
              </div>
            )}
          </section>

          {/* B. Quick Actions Grid */}
          <section aria-labelledby="quick-actions-heading">
            <h2 id="quick-actions-heading" className="text-h2 font-semibold text-text-primary mb-4">
              Quick Actions
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <Link
                    key={action.label}
                    to={action.to}
                    className="p-4 rounded-card bg-surface border border-border hover:border-primary-600/40 shadow-card flex flex-col items-center justify-center text-center gap-2.5 group transition-all duration-180 hover:-translate-y-0.5"
                  >
                    <div
                      className={`w-11 h-11 rounded-card ${action.color} flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <span className="text-small font-semibold text-text-primary group-hover:text-primary-600 transition-colors">
                      {action.label}
                    </span>
                  </Link>
                )
              })}
            </div>
          </section>

          {/* C. Upcoming Events Section (Next 3) */}
          <section aria-labelledby="events-heading">
            <div className="flex items-center justify-between gap-4 mb-4">
              <div>
                <h2 id="events-heading" className="text-h2 font-semibold text-text-primary">
                  Upcoming Campus Events
                </h2>
                <p className="text-caption text-text-secondary">
                  Hackathons, masterclasses, and college fests
                </p>
              </div>
              <Link
                to="/events"
                className="text-small font-semibold text-primary-600 hover:text-primary-500 inline-flex items-center gap-1 shrink-0"
              >
                <span>View all ({events.length})</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {upcomingEvents.map((evt) => (
                <EventCard
                  key={evt.id}
                  event={evt}
                  isRegistered={registeredEventIds.includes(evt.id)}
                />
              ))}
            </div>
          </section>
        </div>

        {/* ========================================
            RIGHT RAIL COLUMN (1 col)
            ======================================== */}
        <div className="space-y-8">
          {/* D. Facility Status Strip */}
          <section aria-labelledby="facility-strip-heading">
            <Card className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 id="facility-strip-heading" className="text-h3 font-semibold text-text-primary">
                  Facility Status
                </h2>
                <Link
                  to="/facilities"
                  className="text-caption font-semibold text-primary-600 hover:text-primary-500"
                >
                  All Timings
                </Link>
              </div>

              <div className="space-y-3 pt-1">
                {/* Central Library */}
                <div className="flex items-center justify-between p-2.5 rounded-button bg-canvas border border-border text-small">
                  <div className="flex items-center gap-2.5 truncate max-w-[65%]">
                    <BookOpen className="w-4 h-4 text-primary-600 shrink-0" aria-hidden="true" />
                    <span className="font-medium text-text-primary truncate">Library</span>
                  </div>
                  <Badge variant="success" dot size="sm">
                    Open until 8 PM
                  </Badge>
                </div>

                {/* Central Canteen */}
                <div className="flex items-center justify-between p-2.5 rounded-button bg-canvas border border-border text-small">
                  <div className="flex items-center gap-2.5 truncate max-w-[65%]">
                    <Coffee className="w-4 h-4 text-primary-600 shrink-0" aria-hidden="true" />
                    <span className="font-medium text-text-primary truncate">Canteen</span>
                  </div>
                  <Badge variant="success" dot size="sm">
                    Open now
                  </Badge>
                </div>

                {/* Health Clinic */}
                <div className="flex items-center justify-between p-2.5 rounded-button bg-canvas border border-border text-small">
                  <div className="flex items-center gap-2.5 truncate max-w-[65%]">
                    <HeartPulse className="w-4 h-4 text-primary-600 shrink-0" aria-hidden="true" />
                    <span className="font-medium text-text-primary truncate">Health Clinic</span>
                  </div>
                  <Badge variant="info" size="sm">
                    24/7 Open
                  </Badge>
                </div>

                {/* Sports Complex */}
                <div className="flex items-center justify-between p-2.5 rounded-button bg-canvas border border-border text-small">
                  <div className="flex items-center gap-2.5 truncate max-w-[65%]">
                    <Building2 className="w-4 h-4 text-primary-600 shrink-0" aria-hidden="true" />
                    <span className="font-medium text-text-primary truncate">Sports Complex</span>
                  </div>
                  <Badge variant="success" dot size="sm">
                    Open until 9 PM
                  </Badge>
                </div>
              </div>
            </Card>
          </section>

          {/* E. Latest Announcements Section (Top 4) */}
          <section aria-labelledby="notices-heading">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div>
                <h2 id="notices-heading" className="text-h3 font-semibold text-text-primary">
                  Latest Notices
                </h2>
                <p className="text-[11px] text-text-secondary">Official circulars and advisories</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-[11px] font-semibold text-text-muted hover:text-text-primary"
                  title="Mark latest notices as read"
                >
                  Mark read
                </button>
                <Link
                  to="/announcements"
                  className="text-caption font-semibold text-primary-600 hover:text-primary-500"
                >
                  View all
                </Link>
              </div>
            </div>

            <div className="space-y-2.5">
              {latestAnnouncements.map((ann) => (
                <AnnouncementRow
                  key={ann.id}
                  announcement={ann}
                  isRead={readAnnouncementIds.includes(ann.id)}
                  onClick={() => markAnnouncementRead(ann.id)}
                />
              ))}
            </div>
          </section>

          {/* F. Student Academic Summary Card */}
          <section aria-label="Student Academic Profile Snapshot">
            <Card className="p-5 bg-gradient-to-br from-surface to-canvas border border-border">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-accent-100 text-primary-600 font-bold flex items-center justify-center text-small">
                  {user?.avatarInitials || 'CC'}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-small font-semibold text-text-primary truncate">
                    {user?.name || 'Aarav Sharma'}
                  </h3>
                  <p className="text-caption text-text-muted truncate">
                    Roll: {user?.rollNo || '23CS1A0501'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-center">
                <div className="p-2 rounded-button bg-surface border border-border">
                  <div className="text-h3 font-bold text-primary-600">
                    {registeredEventIds.length}
                  </div>
                  <div className="text-[11px] text-text-muted">Registered Events</div>
                </div>
                <div className="p-2 rounded-button bg-surface border border-border">
                  <div className="text-h3 font-bold text-primary-600">
                    {user?.department || 'AIML'}
                  </div>
                  <div className="text-[11px] text-text-muted">Sem {userSem}</div>
                </div>
              </div>
            </Card>
          </section>
        </div>
      </div>
    </div>
  )
}
