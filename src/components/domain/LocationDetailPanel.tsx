import {
  X,
  Clock,
  Compass,
  Bookmark,
  Share2,
  Navigation,
  Building,
} from 'lucide-react'
import { Location } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { useUserStore } from '@/store/useUserStore'
import { useToastStore } from '@/store/useToastStore'
import { useContentStore } from '@/store/useContentStore'
import { cn } from '@/lib/utils'

interface LocationDetailPanelProps {
  location: Location
  onClose: () => void
  onSelectLocation: (loc: Location) => void
}

export const LocationDetailPanel: React.FC<LocationDetailPanelProps> = ({
  location,
  onClose,
  onSelectLocation,
}) => {
  const { savedLocationIds, toggleSaveLocation } = useUserStore()
  const { push: pushToast } = useToastStore()
  const allLocations = useContentStore((state) => state.locations)

  const isSaved = savedLocationIds.includes(location.id)

  const handleToggleSave = () => {
    const result = toggleSaveLocation(location.id)
    pushToast({
      type: 'success',
      message: result.saved
        ? `Saved ${location.name} to bookmarks.`
        : `Removed ${location.name} from bookmarks.`,
    })
  }

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href)
      pushToast({
        type: 'info',
        message: 'Location link copied to clipboard.',
      })
    }
  }

  // Find nearby locations in the same building or close by
  const nearbyLocations = allLocations.filter(
    (l) => l.id !== location.id && (l.building === location.building || l.type === location.type)
  ).slice(0, 3)

  return (
    <div className="w-full bg-surface border border-border rounded-card shadow-overlay flex flex-col max-h-[85vh] overflow-y-auto text-left transition-all animate-fade-in">
      {/* Header bar */}
      <div className="p-4 sm:p-5 border-b border-border flex items-start justify-between gap-3 sticky top-0 bg-surface/95 backdrop-blur-sm z-10">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Badge variant="primary" size="sm">
              {location.type.toUpperCase()}
            </Badge>
            {isSaved && (
              <Badge variant="success" size="sm" icon={<Bookmark className="w-3 h-3 fill-current" />}>
                Saved
              </Badge>
            )}
          </div>
          <h2 className="text-h3 font-bold text-text-primary leading-snug">
            {location.name}
          </h2>
          <p className="text-caption text-text-muted mt-0.5 flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5" aria-hidden="true" />
            <span>
              {location.building}, {location.floor}
            </span>
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close location detail panel"
          className="p-1.5 text-text-muted hover:text-text-primary rounded-button transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
        >
          <X className="w-5 h-5" aria-hidden="true" />
        </button>
      </div>

      {/* Content body */}
      <div className="p-4 sm:p-5 space-y-6 flex-1">
        {/* Actions Row */}
        <div className="flex items-center gap-2.5">
          <Button
            variant={isSaved ? 'secondary' : 'primary'}
            size="sm"
            onClick={handleToggleSave}
            leftIcon={<Bookmark className={cn('w-4 h-4', isSaved && 'fill-current')} />}
            className="flex-1"
          >
            {isSaved ? 'Saved to Bookmarks' : 'Save Location'}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            aria-label="Share location link"
            leftIcon={<Share2 className="w-4 h-4" />}
          >
            Share
          </Button>
        </div>

        {/* Description & Operating Hours */}
        <div className="space-y-3">
          <p className="text-small text-text-secondary leading-relaxed">
            {location.description}
          </p>

          {location.openHours && (
            <div className="p-3 rounded-button bg-canvas border border-border text-caption text-text-secondary flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary-600 shrink-0" aria-hidden="true" />
              <span>
                <strong>Hours:</strong> {location.openHours}
              </span>
            </div>
          )}
        </div>

        {/* Step-by-Step Walking Directions from Main Gate */}
        <div className="space-y-3 pt-2 border-t border-border">
          <div className="flex items-center justify-between">
            <h3 className="text-small font-semibold text-text-primary flex items-center gap-2">
              <Navigation className="w-4 h-4 text-primary-600" aria-hidden="true" />
              <span>Directions from Main Gate</span>
            </h3>
            <span className="text-[11px] font-semibold text-primary-600 bg-accent-100 px-2 py-0.5 rounded-full">
              Walking Route
            </span>
          </div>

          <ol className="space-y-2.5 pl-1" aria-label="Step-by-step directions">
            {location.directions.map((step, idx) => (
              <li key={idx} className="flex items-start gap-3 text-small text-text-secondary">
                <span className="w-5 h-5 rounded-full bg-accent-100 text-primary-700 font-bold text-caption flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-snug flex-1">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* Nearby Locations */}
        {nearbyLocations.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-border">
            <h3 className="text-small font-semibold text-text-primary flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-text-muted" aria-hidden="true" />
              <span>Nearby Campus Locations</span>
            </h3>
            <div className="space-y-2">
              {nearbyLocations.map((nearby) => (
                <button
                  key={nearby.id}
                  type="button"
                  onClick={() => onSelectLocation(nearby)}
                  className="w-full p-2.5 rounded-button bg-canvas hover:bg-border/40 border border-border text-left flex items-center justify-between transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
                >
                  <div className="min-w-0 pr-2">
                    <p className="text-small font-semibold text-text-primary truncate">
                      {nearby.name}
                    </p>
                    <p className="text-caption text-text-muted truncate">
                      {nearby.building} : {nearby.floor}
                    </p>
                  </div>
                  <Badge variant="default" size="sm">
                    {nearby.type}
                  </Badge>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
