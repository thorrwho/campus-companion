import React, { useState, useMemo } from 'react'
import { Building2, X } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { SearchBar } from '@/components/ui/SearchBar'
import { Chip } from '@/components/ui/Chip'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { FacilityCard } from '@/components/domain/FacilityCard'
import { useSimulatedLoad } from '@/hooks/useSimulatedLoad'
import { useDebounce } from '@/hooks/useDebounce'
import { FACILITIES } from '@/data/facilities'

const FACILITY_TYPES = [
  { id: 'all', label: 'All Facilities' },
  { id: 'library', label: 'Library' },
  { id: 'dining', label: 'Dining & Cafes' },
  { id: 'sports', label: 'Sports & Fitness' },
  { id: 'medical', label: 'Healthcare' },
  { id: 'admin', label: 'Housing & Services' },
]

export const FacilitiesPage: React.FC = () => {
  const { isLoading, hasError, retry } = useSimulatedLoad({ duration: 500 })

  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebounce(searchQuery, 200)

  const [selectedType, setSelectedType] = useState<string>('all')

  const filteredFacilities = useMemo(() => {
    return FACILITIES.filter((fac) => {
      // Type filter
      if (selectedType !== 'all') {
        const typeLower = fac.type.toLowerCase()
        if (selectedType === 'library' && !typeLower.includes('library')) return false
        if (selectedType === 'dining' && !typeLower.includes('dining') && !typeLower.includes('coffee')) return false
        if (selectedType === 'sports' && !typeLower.includes('sports') && !typeLower.includes('athletics')) return false
        if (selectedType === 'medical' && !typeLower.includes('health') && !typeLower.includes('clinic')) return false
        if (selectedType === 'admin' && !typeLower.includes('housing') && !typeLower.includes('career') && !typeLower.includes('parking') && !typeLower.includes('workshop')) return false
      }

      // Search filter
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase()
        const matchName = fac.name.toLowerCase().includes(q)
        const matchType = fac.type.toLowerCase().includes(q)
        const matchServices = fac.services.some((s) => s.toLowerCase().includes(q))
        if (!matchName && !matchType && !matchServices) {
          return false
        }
      }

      return true
    })
  }, [selectedType, debouncedSearch])

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedType('all')
  }

  const hasActiveFilters = Boolean(searchQuery) || selectedType !== 'all'

  if (hasError) {
    return (
      <div className="py-8">
        <ErrorState
          title="Failed to Load Facilities"
          message="Could not load facility operational schedules. Please try again."
          onRetry={retry}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-16 text-left">
      <PageHeader
        title="Campus Facilities & Services"
        subtitle="Live operating status, dining hours, sports arenas, health center, and student housing helpdesks."
      />

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search facilities or services (e.g. library, gym, food)..."
          />
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            leftIcon={<X className="w-4 h-4" />}
          >
            Clear Filters
          </Button>
        )}
      </div>

      {/* Type Filter Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {FACILITY_TYPES.map((t) => (
          <Chip
            key={t.id}
            label={t.label}
            selected={selectedType === t.id}
            onClick={() => setSelectedType(t.id)}
          />
        ))}
      </div>

      {/* Facilities Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredFacilities.length === 0 ? (
        <EmptyState
          icon={<Building2 className="w-8 h-8 text-primary-600" />}
          title="No Facilities Found"
          description="No campus services match your current search and type filters."
          action={
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear Filters
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {filteredFacilities.map((fac) => (
            <FacilityCard key={fac.id} facility={fac} />
          ))}
        </div>
      )}
    </div>
  )
}
