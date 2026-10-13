import React from 'react'
import { Link } from 'react-router-dom'
import { Clock, MapPin, ArrowRight, Phone } from 'lucide-react'
import { Facility, FacilityStatus } from '@/types'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { LOCATIONS } from '@/data/locations'
import { cn } from '@/lib/utils'

export interface ComputedFacilityStatus {
  status: FacilityStatus
  label: string
  badgeVariant: 'success' | 'warning' | 'error' | 'info'
}

export function computeFacilityStatus(facility: Facility): ComputedFacilityStatus {
  const now = new Date()
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const todayDay = days[now.getDay()]
  const hoursStr = facility.openHours[todayDay]

  if (!hoursStr || hoursStr.toLowerCase().includes('closed')) {
    return { status: 'closed', label: 'Closed Today', badgeVariant: 'error' }
  }

  if (hoursStr.includes('00:00 - 23:59') || hoursStr.toLowerCase().includes('24 hours')) {
    return { status: 'open', label: 'Open 24/7', badgeVariant: 'info' }
  }

  // Parse "HH:MM - HH:MM"
  const parts = hoursStr.split('-').map((s) => s.trim())
  if (parts.length === 2) {
    const [startH, startM] = parts[0].split(':').map(Number)
    const [endH, endM] = parts[1].split(':').map(Number)

    const currentMinutes = now.getHours() * 60 + now.getMinutes()
    const openMinutes = startH * 60 + startM
    const closeMinutes = endH * 60 + endM

    if (currentMinutes < openMinutes) {
      return { status: 'closed', label: `Opens at ${parts[0]}`, badgeVariant: 'error' }
    } else if (currentMinutes >= openMinutes && currentMinutes < closeMinutes) {
      const remaining = closeMinutes - currentMinutes
      if (remaining <= 60) {
        return { status: 'limited', label: `Closes in ${remaining}m`, badgeVariant: 'warning' }
      }
      return { status: 'open', label: `Open until ${parts[1]}`, badgeVariant: 'success' }
    } else {
      return { status: 'closed', label: `Closed at ${parts[1]}`, badgeVariant: 'error' }
    }
  }

  return { status: facility.status, label: facility.status === 'open' ? 'Open' : 'Closed', badgeVariant: 'info' }
}

interface FacilityCardProps {
  facility: Facility
  className?: string
}

export const FacilityCard: React.FC<FacilityCardProps> = ({ facility, className }) => {
  const location = LOCATIONS.find((l) => l.id === facility.locationId)
  const computed = computeFacilityStatus(facility)

  return (
    <Card hover padding="none" className={cn('overflow-hidden flex flex-col justify-between text-left', className)}>
      <div className="p-5 flex-1 flex flex-col">
        {/* Top: Facility Type & Live Status Badge */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <Badge variant="default" size="sm">
            {facility.type}
          </Badge>

          <Badge variant={computed.badgeVariant} dot size="sm">
            {computed.label}
          </Badge>
        </div>

        {/* Facility Name */}
        <h3 className="text-h3 font-semibold text-text-primary hover:text-primary-600 transition-colors line-clamp-1 mb-2">
          <Link to={`/facilities/${facility.id}`}>{facility.name}</Link>
        </h3>

        {/* Services summary */}
        <p className="text-small text-text-secondary line-clamp-2 mb-4 leading-normal flex-1">
          {facility.services.join(', ')}
        </p>

        {/* Location & Contact info */}
        <div className="space-y-2 mb-4 text-caption text-text-muted mt-auto">
          {location && (
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-primary-600" aria-hidden="true" />
              <span className="truncate">{location.name}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 truncate">
            <Phone className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">{facility.contact}</span>
          </div>
        </div>

        {/* Bottom Actions Row */}
        <div className="pt-3 border-t border-border flex items-center justify-between">
          <span className="text-[11px] text-text-muted flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Weekly Schedule</span>
          </span>

          <Link
            to={`/facilities/${facility.id}`}
            className="text-small font-semibold text-primary-600 hover:text-primary-500 inline-flex items-center gap-1"
          >
            <span>Full Timings</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </Card>
  )
}
