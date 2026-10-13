import React, { useState, useMemo } from 'react'
import { BookOpen, X } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { SearchBar } from '@/components/ui/SearchBar'
import { Chip } from '@/components/ui/Chip'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { SkeletonCard } from '@/components/ui/Skeleton'
import { FacultyCard } from '@/components/domain/FacultyCard'
import { useToastStore } from '@/store/useToastStore'
import { useSimulatedLoad } from '@/hooks/useSimulatedLoad'
import { useDebounce } from '@/hooks/useDebounce'
import { FACULTY } from '@/data/faculty'
import { DepartmentCode } from '@/types'

const DEPT_FILTERS: { id: string; label: string }[] = [
  { id: 'all', label: 'All Departments' },
  { id: 'CSE', label: 'CSE' },
  { id: 'CSE-AIML', label: 'CSE-AIML' },
  { id: 'ECE', label: 'ECE' },
  { id: 'EEE', label: 'EEE' },
  { id: 'MECH', label: 'MECH' },
  { id: 'CIVIL', label: 'CIVIL' },
]

export const FacultyPage: React.FC = () => {
  const { push: pushToast } = useToastStore()
  const { isLoading, hasError, retry } = useSimulatedLoad({ duration: 500 })

  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebounce(searchQuery, 200)

  const [selectedDept, setSelectedDept] = useState<string>('all')

  const filteredFaculty = useMemo(() => {
    return FACULTY.filter((prof) => {
      // Dept filter
      if (selectedDept !== 'all' && prof.departmentId !== selectedDept) {
        return false
      }

      // Search filter
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase()
        const matchName = prof.name.toLowerCase().includes(q)
        const matchDesig = prof.designation.toLowerCase().includes(q)
        const matchEmail = prof.email.toLowerCase().includes(q)
        const matchSubjects = prof.subjects.some((s) => s.toLowerCase().includes(q))
        if (!matchName && !matchDesig && !matchEmail && !matchSubjects) {
          return false
        }
      }

      return true
    })
  }, [selectedDept, debouncedSearch])

  const handleCopyEmail = (email: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (navigator.clipboard) {
      navigator.clipboard.writeText(email)
      pushToast({
        type: 'success',
        message: `Copied ${email} to clipboard.`,
      })
    }
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedDept('all')
  }

  const hasActiveFilters = Boolean(searchQuery) || selectedDept !== 'all'

  if (hasError) {
    return (
      <div className="py-8">
        <ErrorState
          title="Failed to Load Faculty Directory"
          message="Could not load faculty profiles. Please try again."
          onRetry={retry}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-16 text-left">
      <PageHeader
        title="Faculty Directory"
        subtitle="Search professors by name, teaching subjects, consultation hours, and department."
      />

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by professor name or subject (e.g. Deep Learning)..."
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

      {/* Department Chips */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        {DEPT_FILTERS.map((dept) => (
          <Chip
            key={dept.id}
            label={dept.label}
            selected={selectedDept === dept.id}
            onClick={() => setSelectedDept(dept.id as DepartmentCode | 'all')}
          />
        ))}
      </div>

      {/* Faculty Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredFaculty.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="w-8 h-8 text-primary-600" />}
          title="No Faculty Members Found"
          description="No professors match your search criteria. Try checking for typos or resetting department filters."
          action={
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Reset Filters
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
          {filteredFaculty.map((prof) => (
            <FacultyCard
              key={prof.id}
              faculty={prof}
              onCopyEmail={handleCopyEmail}
            />
          ))}
        </div>
      )}
    </div>
  )
}
