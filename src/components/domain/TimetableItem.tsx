import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Clock, User } from 'lucide-react'
import { TimetableSlot } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

interface TimetableItemProps {
  slot: TimetableSlot
  status?: 'now' | 'next' | 'normal' | 'past'
}

export const TimetableItem: React.FC<TimetableItemProps> = ({ slot, status = 'normal' }) => {
  return (
    <div
      className={cn(
        'p-4 rounded-card border transition-all duration-180 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left',
        status === 'now'
          ? 'bg-accent-100/50 border-primary-600 shadow-card ring-1 ring-primary-600/30'
          : status === 'next'
          ? 'bg-surface border-primary-500/40 shadow-card'
          : 'bg-surface border-border hover:border-text-muted/40 shadow-card'
      )}
    >
      {/* Left: Time and Status */}
      <div className="flex items-start sm:items-center gap-3 shrink-0">
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 text-small font-semibold text-text-primary">
            <Clock className="w-3.5 h-3.5 text-text-muted" aria-hidden="true" />
            <span>
              {slot.start} to {slot.end}
            </span>
          </div>
          <span className="text-[11px] text-text-muted font-mono">{slot.code}</span>
        </div>

        {status === 'now' && (
          <Badge variant="primary" dot className="animate-pulse">
            Now
          </Badge>
        )}
        {status === 'next' && (
          <Badge variant="info">
            Up next
          </Badge>
        )}
      </div>

      {/* Center: Subject and Faculty */}
      <div className="flex-1 min-w-0 sm:px-4">
        <h3 className="text-small font-semibold text-text-primary truncate" title={slot.subject}>
          {slot.subject}
        </h3>
        <p className="text-caption text-text-secondary flex items-center gap-1.5 mt-0.5">
          <User className="w-3 h-3 text-text-muted shrink-0" aria-hidden="true" />
          <span className="truncate">{slot.faculty}</span>
        </p>
      </div>

      {/* Right: Room link to map */}
      <div className="shrink-0">
        <Link
          to={`/map/${slot.locationId}`}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-button text-caption font-medium border transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600',
            status === 'now'
              ? 'bg-primary-600 text-white border-primary-600 hover:bg-primary-500'
              : 'bg-canvas text-text-primary border-border hover:bg-surface hover:border-primary-600/50'
          )}
          title={`View ${slot.room} on campus map`}
        >
          <MapPin className="w-3.5 h-3.5 text-primary-500" aria-hidden="true" />
          <span>{slot.room}</span>
        </Link>
      </div>
    </div>
  )
}
