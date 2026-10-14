import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Users, CheckCircle, Clock } from 'lucide-react'
import { Event } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { useContentStore } from '@/store/useContentStore'
import { cn } from '@/lib/utils'

interface EventCardProps {
  event: Event
  isRegistered?: boolean
  className?: string
}

export const EventCard: React.FC<EventCardProps> = ({ event, isRegistered = false, className }) => {
  const locations = useContentStore((state) => state.locations)
  const location = locations.find((l) => l.id === event.locationId)
  const isCancelled = event.status === 'Cancelled'
  const eventDate = new Date(`${event.date}T00:00:00`)
  const isPast = new Date() > new Date(`${event.date}T${event.endTime}:00`)
  const isFull = event.registeredCount >= event.capacity
  const isDeadlinePassed = new Date() > new Date(event.registrationDeadline)

  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  const month = monthNames[eventDate.getMonth()]
  const day = eventDate.getDate()

  const seatsLeft = Math.max(0, event.capacity - event.registeredCount)
  const percentFilled = Math.min(100, Math.round((event.registeredCount / event.capacity) * 100))

  return (
    <Card hover padding="none" className={cn('overflow-hidden flex flex-col justify-between text-left', className)}>
      <Link to={`/events/${event.id}`} className="p-4 sm:p-5 flex-1 flex flex-col">
        {/* Top: Date block + Category + Status */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-13 py-1 px-2 rounded-card bg-canvas border border-border flex flex-col items-center justify-center shrink-0 text-center shadow-sm">
              <span className="text-[10px] font-bold text-primary-600 tracking-wider uppercase">
                {month}
              </span>
              <span className="text-h3 font-bold text-text-primary leading-tight">
                {day}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <Badge variant="primary" size="sm">
                {event.category.toUpperCase()}
              </Badge>
              <span className="text-[11px] text-text-muted flex items-center gap-1">
                <Clock className="w-3 h-3" aria-hidden="true" />
                {event.startTime} - {event.endTime}
              </span>
            </div>
          </div>

          <div>
            {isCancelled ? (
              <Badge variant="error">Cancelled</Badge>
            ) : isRegistered ? (
              <Badge variant="success" icon={<CheckCircle className="w-3 h-3" />}>
                Registered
              </Badge>
            ) : isPast ? (
              <Badge variant="neutral">Past Event</Badge>
            ) : isFull ? (
              <Badge variant="error">Full</Badge>
            ) : isDeadlinePassed ? (
              <Badge variant="warning">Closed</Badge>
            ) : (
              <Badge variant="info">Open</Badge>
            )}
          </div>
        </div>

        {/* Title & Description */}
        <h3 className="text-h3 font-semibold text-text-primary hover:text-primary-600 transition-colors line-clamp-1 mb-1.5">
          {event.title}
        </h3>
        <p className="text-small text-text-secondary line-clamp-2 mb-4 leading-normal flex-1">
          {event.description}
        </p>

        {/* Location & Seats Filled Bar */}
        <div className="pt-3 border-t border-border/70 space-y-2 mt-auto">
          <div className="flex items-center justify-between text-caption text-text-secondary">
            <span className="flex items-center gap-1.5 truncate max-w-[65%]" title={location?.name}>
              <MapPin className="w-3.5 h-3.5 text-text-muted shrink-0" aria-hidden="true" />
              <span className="truncate">{location?.name || 'Location not set'}</span>
            </span>
            <span className="flex items-center gap-1 shrink-0 text-text-muted font-medium">
              <Users className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{seatsLeft} seats left</span>
            </span>
          </div>

          {/* Seats left progress bar */}
          <div className="w-full bg-canvas h-1.5 rounded-full overflow-hidden border border-border/40" aria-hidden="true">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-300',
                isFull ? 'bg-status-error' : percentFilled > 80 ? 'bg-status-warning' : 'bg-primary-600'
              )}
              style={{ width: `${percentFilled}%` }}
            />
          </div>
        </div>
      </Link>
    </Card>
  )
}
