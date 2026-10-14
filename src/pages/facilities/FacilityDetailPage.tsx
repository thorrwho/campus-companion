import React, { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Clock,
  MapPin,
  Phone,
  ArrowLeft,
  CheckCircle,
  Calendar,
  Info,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ErrorState } from '@/components/ui/ErrorState'
import { computeFacilityStatus } from '@/components/domain/FacilityCard'
import { useContentStore } from '@/store/useContentStore'
import { useToastStore } from '@/store/useToastStore'
import { cn } from '@/lib/utils'

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

export const FacilityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { push: pushToast } = useToastStore()

  const [copiedContact, setCopiedContact] = useState(false)

  const facilities = useContentStore((state) => state.facilities)
  const locations = useContentStore((state) => state.locations)

  const facility = facilities.find((f) => f.id === id)
  const location = facility ? locations.find((l) => l.id === facility.locationId) : null

  if (!facility) {
    return (
      <div className="py-12">
        <ErrorState
          title="Facility Not Found"
          message="We could not find the campus facility requested. It may have been relocated or updated."
          onRetry={() => navigate('/facilities')}
        />
      </div>
    )
  }

  const computed = computeFacilityStatus(facility)

  const now = new Date()
  const currentDayIndex = now.getDay()
  // JavaScript Sunday is 0, Monday is 1, etc.
  const todayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][currentDayIndex]

  const handleCopyContact = () => {
    navigator.clipboard.writeText(facility.contact)
    setCopiedContact(true)
    pushToast({
      type: 'success',
      message: 'Contact information copied to clipboard.',
    })
    setTimeout(() => setCopiedContact(false), 2000)
  }

  return (
    <div className="space-y-8 pb-16 text-left max-w-4xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          to="/facilities"
          className="inline-flex items-center gap-1.5 text-small font-medium text-text-secondary hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-button"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to All Facilities</span>
        </Link>
      </div>

      {/* Hero Header Card */}
      <Card padding="lg" className="border-border">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="default" size="md">
                {facility.type}
              </Badge>
              <Badge variant={computed.badgeVariant} dot size="md">
                {computed.label}
              </Badge>
            </div>

            {location && (
              <Link to={`/map/${location.id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<MapPin className="w-4 h-4 text-primary-600" />}
                  rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
                >
                  View on Campus Map
                </Button>
              </Link>
            )}
          </div>

          <h1 className="text-display font-bold text-text-primary">
            {facility.name}
          </h1>

          {/* Quick info row */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-small text-text-secondary pt-2 border-t border-border">
            {location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-600 shrink-0" aria-hidden="true" />
                <span className="font-medium text-text-primary">{location.name}</span>
                <span className="text-text-muted">({location.building})</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary-600 shrink-0" aria-hidden="true" />
              <span>{facility.contact}</span>
              <button
                type="button"
                onClick={handleCopyContact}
                className="text-text-muted hover:text-primary-600 p-1 rounded transition-colors"
                title="Copy contact"
                aria-label="Copy contact"
              >
                {copiedContact ? (
                  <Check className="w-3.5 h-3.5 text-accent-green" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Weekly Operating Hours & Services */}
        <div className="md:col-span-2 space-y-6">
          {/* Weekly Schedule Table */}
          <Card padding="md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary-600" aria-hidden="true" />
                <h2 className="text-h3 font-semibold text-text-primary">Weekly Schedule</h2>
              </div>
              <span className="text-caption text-text-muted">Current day highlighted</span>
            </div>

            <div className="border border-border rounded-lg overflow-hidden divide-y divide-border">
              {DAYS_OF_WEEK.map((day) => {
                const isToday = day === todayName
                const hours = facility.openHours[day] || 'Closed'
                const isClosed = hours.toLowerCase().includes('closed')

                return (
                  <div
                    key={day}
                    className={cn(
                      'flex items-center justify-between px-4 py-3 text-small transition-colors',
                      isToday
                        ? 'bg-primary-50/70 font-semibold text-primary-950'
                        : 'bg-white hover:bg-neutral-50/50 text-text-primary'
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <Clock
                        className={cn(
                          'w-4 h-4 shrink-0',
                          isToday ? 'text-primary-600' : 'text-text-muted'
                        )}
                        aria-hidden="true"
                      />
                      <span>{day}</span>
                      {isToday && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary-100 text-primary-800 font-medium">
                          Today
                        </span>
                      )}
                    </div>
                    <div className={cn(
                      'font-mono text-xs sm:text-small',
                      isClosed ? 'text-accent-red font-medium' : isToday ? 'text-primary-900 font-semibold' : 'text-text-secondary'
                    )}>
                      {hours}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Key Services Offered */}
          <Card padding="md">
            <h2 className="text-h3 font-semibold text-text-primary mb-4">
              Services & Amenities
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {facility.services.map((service, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2.5 p-3 rounded-lg bg-neutral-50 border border-border/60"
                >
                  <CheckCircle className="w-4 h-4 text-accent-green shrink-0 mt-0.5" aria-hidden="true" />
                  <span className="text-small text-text-primary leading-snug">{service}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Column (1 col): Operational Notes & Location summary */}
        <div className="space-y-6">
          {/* Notes Card */}
          {facility.notes && (
            <Card padding="md" className="bg-amber-50/40 border-amber-200/80">
              <div className="flex items-center gap-2 text-amber-900 font-semibold mb-2">
                <Info className="w-4 h-4 text-amber-700" aria-hidden="true" />
                <h3 className="text-small">Important Guidelines</h3>
              </div>
              <p className="text-small text-amber-950 leading-relaxed">
                {facility.notes}
              </p>
            </Card>
          )}

          {/* Location & Directions Card */}
          {location && (
            <Card padding="md">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-primary-600" aria-hidden="true" />
                <h3 className="text-h3 font-semibold text-text-primary">Campus Location</h3>
              </div>
              <p className="text-small text-text-secondary mb-3">
                Building: <strong className="text-text-primary">{location.building}</strong>
              </p>
              <div className="p-3 bg-neutral-50 rounded-lg border border-border/60 text-small text-text-secondary mb-4">
                <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-1">
                  Walking directions
                </div>
                <p className="line-clamp-3">{location.directions.join(' ')}</p>
              </div>
              <Link to={`/map/${location.id}`} className="block">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full"
                  rightIcon={<ExternalLink className="w-4 h-4" />}
                >
                  Open Campus Map Pin
                </Button>
              </Link>
            </Card>
          )}

          {/* Need Assistance Card */}
          <Card padding="md" className="bg-primary-900 text-white">
            <h3 className="text-small font-semibold mb-1 text-primary-100">Need Help?</h3>
            <p className="text-xs text-primary-200 leading-normal mb-3">
              Reach out directly to the facility supervisor or student helpline for inquiries.
            </p>
            <div className="p-2.5 bg-primary-800/80 rounded border border-primary-700 font-mono text-xs break-all">
              {facility.contact}
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
