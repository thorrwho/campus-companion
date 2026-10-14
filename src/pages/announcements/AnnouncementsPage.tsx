import React, { useState, useMemo } from 'react'
import { Bell, CheckCheck, X } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { SearchBar } from '@/components/ui/SearchBar'
import { Tabs } from '@/components/ui/Tabs'
import { Toggle } from '@/components/ui/Toggle'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Skeleton } from '@/components/ui/Skeleton'
import { AnnouncementRow } from '@/components/domain/AnnouncementRow'
import { useUserStore } from '@/store/useUserStore'
import { useToastStore } from '@/store/useToastStore'
import { useAuthStore } from '@/store/useAuthStore'
import { useContentStore } from '@/store/useContentStore'
import { useSimulatedLoad } from '@/hooks/useSimulatedLoad'
import { useDebounce } from '@/hooks/useDebounce'

export const AnnouncementsPage: React.FC = () => {
  const { user } = useAuthStore()
  const announcements = useContentStore((state) => state.announcements)
  const announcementCategories = useContentStore((state) => state.announcementCategories)
  const { readAnnouncementIds, markAnnouncementRead, markAllAnnouncementsRead } = useUserStore()
  const { push: pushToast } = useToastStore()
  const { isLoading, hasError, retry } = useSimulatedLoad({ duration: 500 })

  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearch = useDebounce(searchQuery, 250)

  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [unreadOnly, setUnreadOnly] = useState<boolean>(false)

  const userDept = user?.department || 'CSE-AIML'
  const userSem = user?.semester || 5
  const departments = useContentStore((state) => state.departments)

  // Filter visible announcements for current student
  const visibleAnnouncements = useMemo(() => {
    const now = new Date()
    return announcements.filter((a) => {
      // Status filter: only published or scheduled past
      if (a.status === 'Draft') return false
      if (a.status === 'Scheduled' && a.publishDateTime && new Date(a.publishDateTime) > now) return false

      // Expiry filter
      if (a.expiryDate && new Date(a.expiryDate) < now) return false

      // Audience targeting
      if (a.targetAudience && a.targetAudience.type === 'specific') {
        const targetDepts = a.targetAudience.departments || []
        const targetSems = a.targetAudience.semesters || []

        const deptMatch =
          targetDepts.length === 0 ||
          targetDepts.some((selectedId) => {
            const deptObj = departments.find(
              (d) => d.id === selectedId || d.code === selectedId
            )
            return deptObj ? deptObj.code === userDept : selectedId === userDept
          })

        const semMatch =
          targetSems.length === 0 ||
          targetSems.includes(userSem) ||
          targetSems.includes(Number(userSem))

        if (!deptMatch || !semMatch) return false
      }

      return true
    })
  }, [announcements, departments, userDept, userSem])

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: visibleAnnouncements.length }
    visibleAnnouncements.forEach((a) => {
      counts[a.category] = (counts[a.category] || 0) + 1
    })
    return counts
  }, [visibleAnnouncements])

  const categoryTabs = useMemo(() => {
    return [
      { id: 'all', label: 'All Notices', count: categoryCounts.all || 0 },
      ...announcementCategories.map((c) => ({
        id: c.id,
        label: c.label,
        count: categoryCounts[c.id] || 0,
      })),
    ]
  }, [announcementCategories, categoryCounts])

  const filteredAnnouncements = useMemo(() => {
    return visibleAnnouncements.filter((ann) => {
      // Category filter
      if (selectedCategory !== 'all' && ann.category !== selectedCategory) {
        return false
      }

      // Unread only filter
      const isRead = readAnnouncementIds.includes(ann.id)
      if (unreadOnly && isRead) {
        return false
      }

      // Search filter
      if (debouncedSearch.trim()) {
        const q = debouncedSearch.toLowerCase()
        const matchesTitle = ann.title.toLowerCase().includes(q)
        const bodyText = Array.isArray(ann.body) ? ann.body.join(' ') : ann.body
        const matchesBody = bodyText.toLowerCase().includes(q)
        const matchesBy = ann.postedBy.toLowerCase().includes(q)
        if (!matchesTitle && !matchesBody && !matchesBy) {
          return false
        }
      }

      return true
    }).sort((a, b) => {
      // Pinned and important announcements at the top
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      if (a.isImportant && !b.isImportant) return -1
      if (!a.isImportant && b.isImportant) return 1
      return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()
    })
  }, [visibleAnnouncements, selectedCategory, unreadOnly, debouncedSearch, readAnnouncementIds])

  const handleMarkAllRead = () => {
    markAllAnnouncementsRead(visibleAnnouncements.map((a) => a.id))
    pushToast({
      type: 'info',
      message: 'All announcements marked as read.',
    })
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('all')
    setUnreadOnly(false)
  }

  const hasActiveFilters = Boolean(searchQuery) || selectedCategory !== 'all' || unreadOnly

  if (hasError) {
    return (
      <div className="py-8">
        <ErrorState
          title="Failed to Load Announcements"
          message="Could not load academic notices. Please try again."
          onRetry={retry}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-16 text-left">
      <PageHeader
        title="Official Announcements"
        subtitle="Academic circulars, examination schedules, placement updates, and campus advisories."
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkAllRead}
            leftIcon={<CheckCheck className="w-4 h-4 text-primary-600" />}
          >
            Mark All as Read
          </Button>
        }
      />

      {/* Category Tabs */}
      <div className="border-b border-border">
        <Tabs
          activeTab={selectedCategory}
          onChange={setSelectedCategory}
          tabs={categoryTabs}
        />
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1 max-w-md">
          <SearchBar
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search circulars by subject, keyword, or issuer..."
          />
        </div>

        <div className="flex items-center gap-4">
          <Toggle
            label="Unread only"
            checked={unreadOnly}
            onChange={setUnreadOnly}
          />

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              leftIcon={<X className="w-4 h-4" />}
            >
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Announcements List */}
      {isLoading ? (
        <div className="space-y-3 pt-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-card border border-border bg-surface flex items-center justify-between"
            >
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-1/4" />
                <Skeleton className="h-4 w-3/4" />
              </div>
              <Skeleton className="w-4 h-4 rounded-full ml-4" />
            </div>
          ))}
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <EmptyState
          icon={<Bell className="w-8 h-8 text-primary-600" />}
          title="No Announcements Found"
          description={
            unreadOnly
              ? "You're all caught up! You have no unread notices in this category."
              : 'No circulars match your current search and category filters.'
          }
          action={
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Reset Filters
            </Button>
          }
        />
      ) : (
        <div className="space-y-3 pt-2">
          {filteredAnnouncements.map((ann) => (
            <AnnouncementRow
              key={ann.id}
              announcement={ann}
              isRead={readAnnouncementIds.includes(ann.id)}
              onClick={() => markAnnouncementRead(ann.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
