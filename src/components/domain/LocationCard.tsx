import React from 'react'
import { MapPin, Bookmark, ChevronRight } from 'lucide-react'
import { Location } from '@/types'
import { Badge, BadgeVariant } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

interface LocationCardProps {
  location: Location
  isSelected?: boolean
  isSaved?: boolean
  onSelect: () => void
  onToggleSave?: (e: React.MouseEvent) => void
}

export const LocationCard: React.FC<LocationCardProps> = ({
  location,
  isSelected = false,
  isSaved = false,
  onSelect,
  onToggleSave,
}) => {
  const typeBadgeVariant: Record<string, BadgeVariant> = {
    department: 'primary',
    lab: 'info',
    classroom: 'default',
    library: 'primary',
    canteen: 'warning',
    medical: 'error',
    sports: 'success',
    auditorium: 'info',
    parking: 'default',
    admin: 'primary',
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
      className={cn(
        'w-full p-3.5 rounded-card border text-left transition-all duration-180 flex items-start justify-between gap-3 cursor-pointer select-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600',
        isSelected
          ? 'bg-accent-100/60 border-primary-600 shadow-card ring-1 ring-primary-600/30'
          : 'bg-surface border-border hover:border-primary-600/40 hover:bg-canvas/50'
      )}
    >
      <div className="flex items-start gap-3 min-w-0 flex-1">
        <div
          className={cn(
            'w-9 h-9 rounded-card flex items-center justify-center shrink-0 mt-0.5 shadow-sm',
            isSelected ? 'bg-primary-600 text-white' : 'bg-canvas text-primary-600 border border-border'
          )}
        >
          <MapPin className="w-4 h-4" aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={typeBadgeVariant[location.type] || 'default'} size="sm">
              {location.type.toUpperCase()}
            </Badge>
          </div>

          <h3 className="text-small font-semibold text-text-primary truncate" title={location.name}>
            {location.name}
          </h3>

          <p className="text-caption text-text-muted truncate mt-0.5">
            {location.building} : {location.floor}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0 pt-1">
        {onToggleSave && (
          <button
            type="button"
            onClick={onToggleSave}
            aria-label={isSaved ? `Unsave ${location.name}` : `Save ${location.name}`}
            className={cn(
              'p-1.5 rounded-button transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600',
              isSaved ? 'text-primary-600 bg-accent-100/60' : 'text-text-muted hover:text-text-primary hover:bg-canvas'
            )}
          >
            <Bookmark className={cn('w-4 h-4', isSaved && 'fill-current')} aria-hidden="true" />
          </button>
        )}

        <ChevronRight className="w-4 h-4 text-text-muted" aria-hidden="true" />
      </div>
    </div>
  )
}
