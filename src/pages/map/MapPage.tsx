import React, { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { MapPin, X } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { SearchBar } from '@/components/ui/SearchBar'
import { Chip } from '@/components/ui/Chip'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { LocationCard } from '@/components/domain/LocationCard'
import { CampusMapCanvas } from '@/components/domain/CampusMapCanvas'
import { LocationDetailPanel } from '@/components/domain/LocationDetailPanel'
import { useUserStore } from '@/store/useUserStore'
import { useToastStore } from '@/store/useToastStore'
import { useDebounce } from '@/hooks/useDebounce'
import { useContentStore } from '@/store/useContentStore'
import { Location, LocationType } from '@/types'

const LOCATION_TYPES: { id: string; label: string }[] = [
  { id: 'all', label: 'All Places' },
  { id: 'classroom', label: 'Classrooms' },
  { id: 'lab', label: 'Labs' },
  { id: 'department', label: 'Departments' },
  { id: 'library', label: 'Library' },
  { id: 'canteen', label: 'Food & Cafes' },
  { id: 'sports', label: 'Sports' },
  { id: 'auditorium', label: 'Auditoriums' },
  { id: 'admin', label: 'Admin' },
  { id: 'medical', label: 'Health' },
  { id: 'parking', label: 'Parking' },
]

export const MapPage: React.FC = () => {
  const { locationId } = useParams<{ locationId?: string }>()
  const navigate = useNavigate()

  const locations = useContentStore((state) => state.locations)
  const { savedLocationIds, toggleSaveLocation } = useUserStore()
  const { push: pushToast } = useToastStore()

  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebounce(searchQuery, 200)

  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)

  // Sync route param :locationId if present
  useEffect(() => {
    if (locationId) {
      const match = locations.find((l) => l.id === locationId)
      if (match) {
        setSelectedLocation(match)
      }
    }
  }, [locationId, locations])

  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      // Type filter
      if (selectedType !== 'all' && loc.type !== selectedType) {
        return false
      }

      // Search filter
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase()
        const matchName = loc.name.toLowerCase().includes(q)
        const matchBuilding = loc.building.toLowerCase().includes(q)
        const matchDesc = loc.description.toLowerCase().includes(q)
        if (!matchName && !matchBuilding && !matchDesc) {
          return false
        }
      }

      return true
    })
  }, [locations, selectedType, debouncedSearch])

  const handleSelectLocation = (loc: Location) => {
    setSelectedLocation(loc)
    navigate(`/map/${loc.id}`, { replace: true })
  }

  const handleCloseDetail = () => {
    setSelectedLocation(null)
    navigate('/map', { replace: true })
  }

  const handleToggleSave = (loc: Location, e: React.MouseEvent) => {
    e.stopPropagation()
    const result = toggleSaveLocation(loc.id)
    pushToast({
      type: 'success',
      message: result.saved
        ? `Saved ${loc.name} to bookmarks.`
        : `Removed ${loc.name} from bookmarks.`,
    })
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedType('all')
  }

  return (
    <div className="space-y-6 pb-16 text-left">
      <PageHeader
        title="Interactive Campus Map & Directions"
        subtitle="Explore lecture halls, computing labs, facilities, and turn by turn walking routes."
      />

      {/* Main Split Layout: Left Results List (380px) & Right Map Canvas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (5 cols on lg screen): Search + Type Filter Chips + Results List */}
        <div className="lg:col-span-5 space-y-4 flex flex-col max-h-[820px]">
          {/* Search Bar */}
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search rooms, labs, auditoriums..."
          />

          {/* Type Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
            {LOCATION_TYPES.map((t) => (
              <Chip
                key={t.id}
                label={t.label}
                selected={selectedType === t.id}
                onClick={() => setSelectedType(t.id as LocationType | 'all')}
              />
            ))}
          </div>

          {/* Results count & Clear */}
          <div className="flex items-center justify-between text-caption text-text-muted px-1">
            <span>
              Showing {filteredLocations.length} of {locations.length} campus places
            </span>
            {(Boolean(searchQuery) || selectedType !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                leftIcon={<X className="w-3.5 h-3.5" />}
              >
                Reset
              </Button>
            )}
          </div>

          {/* Results List */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 max-h-[600px]">
            {filteredLocations.length === 0 ? (
              <EmptyState
                icon={<MapPin className="w-8 h-8 text-primary-600" />}
                title="No Locations Found"
                description="No campus places match your query. Try broadening your keywords."
                action={
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                }
              />
            ) : (
              filteredLocations.map((loc) => (
                <LocationCard
                  key={loc.id}
                  location={loc}
                  isSelected={selectedLocation?.id === loc.id}
                  isSaved={savedLocationIds.includes(loc.id)}
                  onSelect={() => handleSelectLocation(loc)}
                  onToggleSave={(e) => handleToggleSave(loc, e)}
                />
              ))
            )}
          </div>
        </div>

        {/* Right Column (7 cols on lg screen): Interactive Map Canvas & Detail Side Panel */}
        <div className="lg:col-span-7 flex flex-col gap-6 relative">
          {/* Map Canvas */}
          <div className="w-full h-[480px] sm:h-[620px]">
            <CampusMapCanvas
              locations={filteredLocations}
              selectedLocationId={selectedLocation?.id || null}
              onSelectLocation={handleSelectLocation}
            />
          </div>

          {/* Location Detail Panel (Renders when a place is selected) */}
          {selectedLocation && (
            <div className="w-full">
              <LocationDetailPanel
                location={selectedLocation}
                onClose={handleCloseDetail}
                onSelectLocation={handleSelectLocation}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
