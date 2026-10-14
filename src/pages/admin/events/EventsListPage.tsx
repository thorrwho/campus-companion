import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Calendar,
  Users,
  Clock,
  MapPin,
  ExternalLink,
  Edit2,
  Copy,
  Trash2,
  Tag,
  AlertCircle,
  ClipboardList,
} from 'lucide-react'
import { useContentStore } from '@/store/useContentStore'
import { useActivityLogStore } from '@/store/useActivityLogStore'
import { useToastStore } from '@/store/useToastStore'
import { useAdminAuthStore } from '@/store/useAdminAuthStore'
import { Event } from '@/types'
import {
  DataTable,
  DataTableColumn,
  StatusBadge,
  ConfirmDialog,
} from '@/components/admin'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { TextField } from '@/components/admin/form/TextField'

export const EventsListPage: React.FC = () => {
  const navigate = useNavigate()
  const {
    events,
    eventCategories,
    locations,
    clubs,
    createItem,
    updateItem,
    deleteWithIntegrity,
    addEventCategory,
  } = useContentStore()
  const { addActivity, setLastDeleted } = useActivityLogStore()
  const { push: pushToast } = useToastStore()
  const { adminUser } = useAdminAuthStore()

  // Filters state
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedTimeframe, setSelectedTimeframe] = useState('all')

  // Deletion dialog states
  const [itemToDelete, setItemToDelete] = useState<Event | null>(null)
  const [bulkItemsToDelete, setBulkItemsToDelete] = useState<Event[]>([])
  const [isDeleting, setIsDeleting] = useState(false)

  // Category manager modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [newCategoryLabel, setNewCategoryLabel] = useState('')

  // Venue & Club lookup maps
  const locationMap = useMemo(() => {
    const map = new Map<string, string>()
    locations.forEach((l) => map.set(l.id, `${l.name} (${l.building})`))
    return map
  }, [locations])

  const clubMap = useMemo(() => {
    const map = new Map<string, string>()
    clubs.forEach((c) => map.set(c.id, c.name))
    return map
  }, [clubs])

  // Overview metrics calculation
  const metrics = useMemo(() => {
    const total = events.length
    const todayStr = new Date().toISOString().slice(0, 10)
    const upcoming = events.filter((e) => e.date >= todayStr && e.status !== 'Cancelled').length
    const cancelled = events.filter((e) => e.status === 'Cancelled').length
    const totalRegistrations = events.reduce((acc, curr) => acc + (curr.registeredCount || 0), 0)

    return {
      total,
      upcoming,
      cancelled,
      totalRegistrations,
    }
  }, [events])

  // Handle single deletion with integrity
  const handleConfirmSingleDelete = () => {
    if (!itemToDelete) return
    setIsDeleting(true)
    try {
      setLastDeleted({
        itemType: 'events',
        itemData: itemToDelete,
        timestamp: Date.now(),
      })
      deleteWithIntegrity('events', itemToDelete.id)
      addActivity({
        userEmail: adminUser?.email || 'admin@demo.edu',
        userName: adminUser?.name || 'Administrator',
        action: 'delete',
        itemType: 'event',
        itemId: itemToDelete.id,
        itemName: itemToDelete.title,
        summary: `Deleted event "${itemToDelete.title}" and unlinked dependents`,
      })
      pushToast({
        type: 'success',
        message: `Deleted "${itemToDelete.title}". You can undo this from the Activity Log.`,
      })
      setItemToDelete(null)
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle bulk deletion
  const handleConfirmBulkDelete = () => {
    if (bulkItemsToDelete.length === 0) return
    setIsDeleting(true)
    try {
      bulkItemsToDelete.forEach((item) => {
        deleteWithIntegrity('events', item.id)
        addActivity({
          userEmail: adminUser?.email || 'admin@demo.edu',
          userName: adminUser?.name || 'Administrator',
          action: 'delete',
          itemType: 'event',
          itemId: item.id,
          itemName: item.title,
          summary: `Bulk deleted event "${item.title}"`,
        })
      })
      pushToast({
        type: 'success',
        message: `Permanently deleted ${bulkItemsToDelete.length} events.`,
      })
      setBulkItemsToDelete([])
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle bulk status change
  const handleBulkStatusChange = (items: Event[], newStatus: 'Published' | 'Cancelled') => {
    items.forEach((item) => {
      updateItem('events', item.id, { status: newStatus }, adminUser?.email)
      addActivity({
        userEmail: adminUser?.email || 'admin@demo.edu',
        userName: adminUser?.name || 'Administrator',
        action: newStatus === 'Published' ? 'publish' : 'cancel',
        itemType: 'event',
        itemId: item.id,
        itemName: item.title,
        summary: `Changed event status to ${newStatus}`,
      })
    })
    pushToast({
      type: 'success',
      message: `Updated ${items.length} events to ${newStatus}.`,
    })
  }

  // Duplicate event
  const handleDuplicate = (event: Event) => {
    const cloneData: Omit<Event, 'id' | 'createdAt' | 'updatedAt'> = {
      ...event,
      title: `Copy of ${event.title}`,
      status: 'Draft',
      registeredCount: 0,
      registrationOpen: true,
    }
    const created = createItem('events', cloneData, adminUser?.email)
    addActivity({
      userEmail: adminUser?.email || 'admin@demo.edu',
      userName: adminUser?.name || 'Administrator',
      action: 'create',
      itemType: 'event',
      itemId: created.id,
      itemName: created.title,
      summary: `Duplicated event from "${event.title}"`,
    })
    pushToast({
      type: 'success',
      message: `Created duplicate "${created.title}".`,
    })
  }

  // Add event category
  const handleAddCategory = () => {
    const label = newCategoryLabel.trim()
    if (!label) return
    const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    addEventCategory({ id, label })
    pushToast({ type: 'success', message: `Added category "${label}".` })
    setNewCategoryLabel('')
    setIsCategoryModalOpen(false)
  }

  // Filtered dataset
  const filteredData = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10)
    return events.filter((item) => {
      const itemStatus = item.status || 'Published'
      const matchesStatus = selectedStatus === 'all' || itemStatus === selectedStatus
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory

      let matchesTimeframe = true
      if (selectedTimeframe === 'upcoming') {
        matchesTimeframe = item.date >= todayStr
      } else if (selectedTimeframe === 'past') {
        matchesTimeframe = item.date < todayStr
      } else if (selectedTimeframe === 'today') {
        matchesTimeframe = item.date === todayStr
      }

      return matchesStatus && matchesCategory && matchesTimeframe
    })
  }, [events, selectedStatus, selectedCategory, selectedTimeframe])

  // Table columns
  const columns: DataTableColumn<Event>[] = [
    {
      key: 'title',
      header: 'Event',
      sortable: true,
      render: (item) => (
        <div className="space-y-1 py-1 max-w-xs sm:max-w-sm">
          <div className="flex items-center gap-2">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: item.bannerColor || '#2563eb' }}
            />
            <button
              type="button"
              onClick={() => navigate(`/admin/events/${item.id}/edit`)}
              className="font-semibold text-text-primary hover:text-primary-600 text-left transition-colors"
            >
              {item.title}
            </button>
          </div>
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <span className="capitalize">{item.category}</span>
            {item.organizerClubId && clubMap.has(item.organizerClubId) && (
              <>
                <span>-</span>
                <span>By {clubMap.get(item.organizerClubId)}</span>
              </>
            )}
          </div>
          {item.cancellationReason && item.status === 'Cancelled' && (
            <p className="text-[11px] text-status-error font-medium italic">
              Cancelled: {item.cancellationReason}
            </p>
          )}
        </div>
      ),
    },
    {
      key: 'date',
      header: 'Schedule',
      sortable: true,
      render: (item) => (
        <div className="space-y-0.5 text-xs">
          <div className="font-mono text-text-primary font-medium">{item.date}</div>
          <div className="text-text-muted font-mono">
            {item.startTime} to {item.endTime}
          </div>
        </div>
      ),
    },
    {
      key: 'locationId',
      header: 'Venue',
      sortable: true,
      render: (item) => (
        <div className="flex items-center gap-1.5 text-xs text-text-secondary max-w-[180px]">
          <MapPin className="w-3.5 h-3.5 text-text-muted shrink-0" />
          <span className="truncate">
            {locationMap.get(item.locationId) || 'Campus Ground'}
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (item) => (
        <StatusBadge status={item.status || 'Published'} size="sm" />
      ),
    },
    {
      key: 'capacity',
      header: 'Registration',
      sortable: true,
      sortValue: (item) => item.registeredCount,
      render: (item) => {
        const pct = Math.min(100, Math.round((item.registeredCount / (item.capacity || 1)) * 100))
        const isFull = item.registeredCount >= item.capacity
        return (
          <div className="space-y-1 w-28">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-text-primary font-mono">
                {item.registeredCount} / {item.capacity}
              </span>
              {isFull && (
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-1 rounded">
                  Full
                </span>
              )}
            </div>
            <div className="w-full h-1.5 rounded-full bg-border overflow-hidden">
              <div
                className={
                  isFull
                    ? 'h-full bg-amber-500 rounded-full'
                    : 'h-full bg-primary-600 rounded-full'
                }
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      },
    },
  ]

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Events Management
          </h1>
          <p className="text-caption text-text-secondary mt-1">
            Create, schedule, and oversee campus workshops, hackathons, seminars, and attendee registrations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            onClick={() => setIsCategoryModalOpen(true)}
            leftIcon={<Tag className="w-4 h-4" />}
          >
            Categories
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/admin/events/new')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Event
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-card border border-border bg-surface shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">{metrics.total}</div>
            <div className="text-xs text-text-muted">Total Events</div>
          </div>
        </div>

        <div className="p-4 rounded-card border border-border bg-surface shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">{metrics.upcoming}</div>
            <div className="text-xs text-text-muted">Active Upcoming</div>
          </div>
        </div>

        <div className="p-4 rounded-card border border-border bg-surface shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">{metrics.totalRegistrations}</div>
            <div className="text-xs text-text-muted">Enrolled Attendees</div>
          </div>
        </div>

        <div className="p-4 rounded-card border border-border bg-surface shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">{metrics.cancelled}</div>
            <div className="text-xs text-text-muted">Cancelled</div>
          </div>
        </div>
      </div>

      {/* Main DataTable */}
      <DataTable
        data={filteredData}
        columns={columns}
        keyField="id"
        searchPlaceholder="Search by title, location, club, or tags..."
        searchFilter={(item, q) =>
          Boolean(
            item.title.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q) ||
            (item.tags && item.tags.some((t) => t.toLowerCase().includes(q))) ||
            (locationMap.get(item.locationId) || '').toLowerCase().includes(q) ||
            (item.organizerClubId && (clubMap.get(item.organizerClubId) || '').toLowerCase().includes(q))
          )
        }
        filters={[
          {
            key: 'status',
            label: 'Status',
            value: selectedStatus,
            onChange: setSelectedStatus,
            options: [
              { label: 'Published', value: 'Published' },
              { label: 'Draft', value: 'Draft' },
              { label: 'Cancelled', value: 'Cancelled' },
            ],
          },
          {
            key: 'category',
            label: 'Category',
            value: selectedCategory,
            onChange: setSelectedCategory,
            options: eventCategories.map((c) => ({
              label: c.label,
              value: c.id,
            })),
          },
          {
            key: 'timeframe',
            label: 'Timeframe',
            value: selectedTimeframe,
            onChange: setSelectedTimeframe,
            options: [
              { label: 'Upcoming', value: 'upcoming' },
              { label: 'Today', value: 'today' },
              { label: 'Past', value: 'past' },
            ],
          },
        ]}
        bulkActions={[
          {
            label: 'Publish Selected',
            onClick: (items) => handleBulkStatusChange(items, 'Published'),
          },
          {
            label: 'Cancel Selected',
            onClick: (items) => handleBulkStatusChange(items, 'Cancelled'),
          },
          {
            label: 'Delete Selected',
            variant: 'danger',
            onClick: (items) => setBulkItemsToDelete(items),
          },
        ]}
        rowActions={(item) => [
          {
            label: 'Edit Event',
            icon: <Edit2 className="w-4 h-4" />,
            onClick: () => navigate(`/admin/events/${item.id}/edit`),
          },
          {
            label: 'Registrations',
            icon: <ClipboardList className="w-4 h-4" />,
            onClick: () => navigate(`/admin/events/${item.id}/registrations`),
          },
          {
            label: 'Duplicate',
            icon: <Copy className="w-4 h-4" />,
            onClick: () => handleDuplicate(item),
          },
          {
            label: 'View in App',
            icon: <ExternalLink className="w-4 h-4" />,
            onClick: () => navigate(`/events/${item.id}`),
          },
          {
            label: 'Delete',
            icon: <Trash2 className="w-4 h-4" />,
            variant: 'danger',
            onClick: () => setItemToDelete(item),
          },
        ]}
        emptyState={{
          title: 'No events found',
          message: 'No campus events match your selected filters or search terms.',
          actionLabel: 'Create Event',
          onAction: () => navigate('/admin/events/new'),
        }}
      />

      {/* Delete Single Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmSingleDelete}
        itemName={itemToDelete?.title}
        isLoading={isDeleting}
      />

      {/* Delete Bulk Confirmation Dialog */}
      <ConfirmDialog
        isOpen={bulkItemsToDelete.length > 0}
        onClose={() => setBulkItemsToDelete([])}
        onConfirm={handleConfirmBulkDelete}
        itemCount={bulkItemsToDelete.length}
        isLoading={isDeleting}
      />

      {/* Category Manager Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Manage Event Categories"
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsCategoryModalOpen(false)}
            >
              Close
            </Button>
          </div>
        }
      >
        <div className="space-y-4 pt-1">
          <p className="text-caption text-text-secondary leading-relaxed">
            Configure event categories displayed in search filters and student schedule views.
          </p>

          <div className="flex items-center gap-2">
            <TextField
              value={newCategoryLabel}
              onChange={(e) => setNewCategoryLabel(e.target.value)}
              placeholder="New category name (e.g. Hackathon, Webinar)"
              className="flex-1"
            />
            <Button
              variant="primary"
              size="md"
              onClick={handleAddCategory}
              disabled={!newCategoryLabel.trim()}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add
            </Button>
          </div>

          <div className="pt-2">
            <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              Current Categories ({eventCategories.length})
            </h4>
            <div className="flex flex-wrap items-center gap-2">
              {eventCategories.map((cat) => (
                <span
                  key={cat.id}
                  className="px-3 py-1.5 rounded-card border border-border bg-surface text-sm font-medium text-text-primary flex items-center gap-1.5"
                >
                  <Tag className="w-3.5 h-3.5 text-primary-600" />
                  <span>{cat.label}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
