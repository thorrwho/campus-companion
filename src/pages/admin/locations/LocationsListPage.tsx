import React, { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Plus,
  MapPin,
  Building2,
  BookOpen,
  Compass,
  Trash2,
  Copy,
  Edit,
  ExternalLink,
  Navigation,
} from 'lucide-react'
import { useContentStore } from '@/store/useContentStore'
import { useActivityLogStore } from '@/store/useActivityLogStore'
import { useToastStore } from '@/store/useToastStore'
import { useAdminAuthStore } from '@/store/useAdminAuthStore'
import { Location } from '@/types'
import {
  DataTable,
  DataTableColumn,
  ConfirmDialog,
} from '@/components/admin'
import { Button } from '@/components/ui/Button'

const LOCATION_TYPE_COLORS: Record<string, string> = {
  department: '#1D4ED8',
  classroom: '#0B1F44',
  lab: '#6366F1',
  library: '#0284C7',
  canteen: '#D97706',
  auditorium: '#7C3AED',
  parking: '#475569',
  admin: '#0F172A',
  medical: '#DC2626',
  sports: '#16A34A',
}

export const LocationsListPage: React.FC = () => {
  const navigate = useNavigate()
  const {
    locations,
    events,
    timetableSlots,
    facilities,
    faculty,
    createItem,
    deleteWithIntegrity,
    getDependents,
  } = useContentStore()

  const { adminUser } = useAdminAuthStore()
  const { addActivity } = useActivityLogStore()
  const { push: pushToast } = useToastStore()

  // Filter States
  const [typeFilter, setTypeFilter] = useState('all')
  const [buildingFilter, setBuildingFilter] = useState('all')

  // Deletion States
  const [itemToDelete, setItemToDelete] = useState<Location | null>(null)
  const [bulkItemsToDelete, setBulkItemsToDelete] = useState<Location[]>([])
  const [isDeleting, setIsDeleting] = useState(false)

  // Map of references count per location (events, slots, facilities, faculty offices)
  const locationUsageMap = useMemo(() => {
    const map = new Map<string, { total: number; events: number; slots: number; facilities: number; faculty: number }>()

    locations.forEach((loc) => {
      const evCount = events.filter((e) => e.locationId === loc.id).length
      const slotCount = timetableSlots.filter((t) => t.locationId === loc.id).length
      const facCount = facilities.filter((f) => f.locationId === loc.id).length
      const facOffCount = faculty.filter((fc) => fc.officeLocationId === loc.id).length
      map.set(loc.id, {
        total: evCount + slotCount + facCount + facOffCount,
        events: evCount,
        slots: slotCount,
        facilities: facCount,
        faculty: facOffCount,
      })
    })

    return map
  }, [locations, events, timetableSlots, facilities, faculty])

  // Unique buildings for filter
  const uniqueBuildings = useMemo(() => {
    const set = new Set<string>()
    locations.forEach((l) => {
      if (l.building) set.add(l.building)
    })
    return Array.from(set).sort()
  }, [locations])

  // Overview Metrics
  const metrics = useMemo(() => {
    const total = locations.length
    const departments = locations.filter((l) => l.type === 'department').length
    const academic = locations.filter((l) => l.type === 'classroom' || l.type === 'lab').length
    const amenities = locations.filter(
      (l) => ['canteen', 'library', 'sports', 'medical', 'auditorium'].includes(l.type)
    ).length
    return { total, departments, academic, amenities }
  }, [locations])

  // Filtered Data
  const filteredData = useMemo(() => {
    return locations.filter((item) => {
      if (typeFilter !== 'all' && item.type !== typeFilter) return false
      if (buildingFilter !== 'all' && item.building !== buildingFilter) return false
      return true
    })
  }, [locations, typeFilter, buildingFilter])

  // Delete Handlers
  const handleConfirmSingleDelete = () => {
    if (!itemToDelete) return
    setIsDeleting(true)
    try {
      useActivityLogStore.getState().setLastDeleted({
        itemType: 'locations',
        itemData: itemToDelete,
        timestamp: Date.now(),
      })
      deleteWithIntegrity('locations', itemToDelete.id)
      addActivity({
        userEmail: adminUser?.email || 'admin@demo.edu',
        userName: adminUser?.name || 'Administrator',
        action: 'delete',
        itemType: 'location',
        itemId: itemToDelete.id,
        itemName: itemToDelete.name,
        summary: `Deleted location "${itemToDelete.name}" and unlinked dependents`,
      })
      pushToast({
        type: 'success',
        message: `Deleted "${itemToDelete.name}". Dependent references have been unlinked safely.`,
      })
      setItemToDelete(null)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleConfirmBulkDelete = () => {
    if (bulkItemsToDelete.length === 0) return
    setIsDeleting(true)
    try {
      bulkItemsToDelete.forEach((item) => {
        deleteWithIntegrity('locations', item.id)
        addActivity({
          userEmail: adminUser?.email || 'admin@demo.edu',
          userName: adminUser?.name || 'Administrator',
          action: 'bulk_delete',
          itemType: 'location',
          itemId: item.id,
          itemName: item.name,
          summary: `Bulk deleted location "${item.name}"`,
        })
      })
      pushToast({
        type: 'success',
        message: `Permanently deleted ${bulkItemsToDelete.length} locations.`,
      })
      setBulkItemsToDelete([])
    } finally {
      setIsDeleting(false)
    }
  }

  // Duplicate Location
  const handleDuplicate = (location: Location) => {
    const cloneData: Omit<Location, 'id' | 'createdAt' | 'updatedAt'> = {
      ...location,
      name: `Copy of ${location.name}`,
      mapX: Math.min(95, location.mapX + 2),
      mapY: Math.min(95, location.mapY + 2),
    }
    const created = createItem('locations', cloneData, adminUser?.email)
    addActivity({
      userEmail: adminUser?.email || 'admin@demo.edu',
      userName: adminUser?.name || 'Administrator',
      action: 'create',
      itemType: 'location',
      itemId: created.id,
      itemName: created.name,
      summary: `Duplicated location "${location.name}" as "${created.name}"`,
    })
    pushToast({
      type: 'success',
      message: `Created duplicate location "${created.name}".`,
    })
    navigate(`/admin/locations/${created.id}/edit`)
  }

  // Dependents for current item to delete
  const dependents = useMemo(() => {
    if (!itemToDelete) return null
    return getDependents('locations', itemToDelete.id)
  }, [itemToDelete, getDependents])

  // Table Columns
  const columns: DataTableColumn<Location>[] = [
    {
      key: 'name',
      header: 'Location',
      sortable: true,
      sortValue: (item) => item.name,
      render: (item) => {
        const color = LOCATION_TYPE_COLORS[item.type] || '#1D4ED8'
        return (
          <div className="flex items-center gap-3 py-1">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-black/5"
              style={{ backgroundColor: `${color}18`, color: color }}
            >
              <MapPin className="w-5 h-5 fill-current/20" />
            </div>
            <div className="space-y-0.5 max-w-xs sm:max-w-md">
              <Link
                to={`/admin/locations/${item.id}/edit`}
                className="font-semibold text-text-primary hover:text-primary-600 transition-colors text-sm line-clamp-1"
              >
                {item.name}
              </Link>
              <div className="text-xs text-text-muted flex items-center gap-2">
                <span>{item.floor}</span>
                <span>•</span>
                <span>{item.building}</span>
              </div>
            </div>
          </div>
        )
      },
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      sortValue: (item) => item.type,
      render: (item) => {
        const color = LOCATION_TYPE_COLORS[item.type] || '#1D4ED8'
        return (
          <span
            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider"
            style={{ backgroundColor: `${color}15`, color: color }}
          >
            {item.type}
          </span>
        )
      },
    },
    {
      key: 'building',
      header: 'Building & Coordinates',
      sortable: true,
      sortValue: (item) => item.building,
      render: (item) => (
        <div className="space-y-0.5 text-xs">
          <div className="font-medium text-text-primary">{item.building}</div>
          <div className="font-mono text-[11px] text-text-muted">
            Pin: {item.mapX}%, {item.mapY}%
          </div>
        </div>
      ),
    },
    {
      key: 'usedBy',
      header: 'Used By',
      sortable: true,
      sortValue: (item) => locationUsageMap.get(item.id)?.total || 0,
      render: (item) => {
        const usage = locationUsageMap.get(item.id) || { total: 0, events: 0, slots: 0, facilities: 0, faculty: 0 }
        if (usage.total === 0) {
          return <span className="text-xs text-text-muted">0 linked items</span>
        }
        return (
          <div className="space-y-0.5 text-xs" title={`${usage.events} events, ${usage.slots} timetable slots, ${usage.facilities} facilities, ${usage.faculty} faculty offices`}>
            <span className="font-semibold text-primary-600 bg-primary-50 dark:bg-primary-950/40 px-2 py-0.5 rounded-full inline-block">
              {usage.total} linked items
            </span>
            <div className="text-[11px] text-text-muted truncate max-w-[160px]">
              {[
                usage.events > 0 && `${usage.events} ev`,
                usage.slots > 0 && `${usage.slots} slots`,
                usage.facilities > 0 && `${usage.facilities} fac`,
                usage.faculty > 0 && `${usage.faculty} prof`,
              ].filter(Boolean).join(', ')}
            </div>
          </div>
        )
      },
    },
    {
      key: 'directions',
      header: 'Directions',
      hideOnMobile: true,
      render: (item) => (
        <span className="text-xs text-text-muted">
          {item.directions?.length || 0} step{(item.directions?.length || 0) === 1 ? '' : 's'} from Main Gate
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6 text-left pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Campus Locations ({locations.length})
          </h1>
          <p className="text-caption text-text-secondary mt-1">
            Manage interactive map pins, academic buildings, departments, and step by step directions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            onClick={() => window.open('/map', '_blank')}
            className="flex items-center gap-2"
          >
            <Navigation className="w-4 h-4 text-text-secondary" />
            <span>Open Student Map</span>
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/admin/locations/new')}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Location</span>
          </Button>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-card border border-border bg-surface shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-950/40 text-primary-600 flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">{metrics.total}</div>
            <div className="text-xs text-text-muted">Total Locations</div>
          </div>
        </div>

        <div className="p-4 rounded-card border border-border bg-surface shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">{metrics.departments}</div>
            <div className="text-xs text-text-muted">Departments</div>
          </div>
        </div>

        <div className="p-4 rounded-card border border-border bg-surface shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">{metrics.academic}</div>
            <div className="text-xs text-text-muted">Labs & Classrooms</div>
          </div>
        </div>

        <div className="p-4 rounded-card border border-border bg-surface shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">{metrics.amenities}</div>
            <div className="text-xs text-text-muted">Student Amenities</div>
          </div>
        </div>
      </div>

      {/* Main DataTable */}
      <DataTable
        data={filteredData}
        columns={columns}
        keyField="id"
        searchPlaceholder="Search locations by name, building, floor, or description..."
        searchFilter={(item, q) =>
          Boolean(
            item.name.toLowerCase().includes(q) ||
            item.building.toLowerCase().includes(q) ||
            item.floor.toLowerCase().includes(q) ||
            item.type.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q)
          )
        }
        filters={[
          {
            key: 'type',
            label: 'Location Type',
            value: typeFilter,
            onChange: setTypeFilter,
            options: [
              { label: 'All Types', value: 'all' },
              { label: 'Department', value: 'department' },
              { label: 'Classroom', value: 'classroom' },
              { label: 'Lab', value: 'lab' },
              { label: 'Library', value: 'library' },
              { label: 'Canteen', value: 'canteen' },
              { label: 'Auditorium', value: 'auditorium' },
              { label: 'Parking', value: 'parking' },
              { label: 'Admin', value: 'admin' },
              { label: 'Medical', value: 'medical' },
              { label: 'Sports', value: 'sports' },
            ],
          },
          {
            key: 'building',
            label: 'Building',
            value: buildingFilter,
            onChange: setBuildingFilter,
            options: [
              { label: 'All Buildings', value: 'all' },
              ...uniqueBuildings.map((b) => ({ label: b, value: b })),
            ],
          },
        ]}
        bulkActions={[
          {
            label: 'Delete Selected',
            icon: <Trash2 className="w-4 h-4" />,
            variant: 'danger',
            onClick: (items) => setBulkItemsToDelete(items),
          },
        ]}
        rowActions={(item) => [
          {
            label: 'View on Campus Map',
            icon: <ExternalLink className="w-4 h-4" />,
            onClick: () => window.open(`/map?location=${item.id}`, '_blank'),
          },
          {
            label: 'Edit Location',
            icon: <Edit className="w-4 h-4" />,
            onClick: () => navigate(`/admin/locations/${item.id}/edit`),
          },
          {
            label: 'Duplicate',
            icon: <Copy className="w-4 h-4" />,
            onClick: () => handleDuplicate(item),
          },
          {
            label: 'Delete Location',
            icon: <Trash2 className="w-4 h-4" />,
            variant: 'danger',
            onClick: () => setItemToDelete(item),
          },
        ]}
        emptyState={{
          title: 'No locations found',
          message: 'Get started by creating your first campus building or room map pin.',
          actionLabel: 'New Location',
          onAction: () => navigate('/admin/locations/new'),
        }}
      />

      {/* Single Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmSingleDelete}
        title="Delete Location"
        itemName={itemToDelete?.name}
        message={
          dependents?.hasDependents
            ? `Are you sure you want to delete "${itemToDelete?.name}"? Warning: ${dependents.description} Deleting will automatically unlink this location from these records.`
            : `Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be immediately reversed.`
        }
        confirmText="Delete Location"
        isLoading={isDeleting}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={bulkItemsToDelete.length > 0}
        onClose={() => setBulkItemsToDelete([])}
        onConfirm={handleConfirmBulkDelete}
        title="Delete Multiple Locations"
        itemCount={bulkItemsToDelete.length}
        message={`You are about to permanently delete ${bulkItemsToDelete.length} locations. Associated events, timetable slots, facilities, and faculty office assignments will be unlinked.`}
        confirmText={`Delete ${bulkItemsToDelete.length} Locations`}
        isLoading={isDeleting}
      />
    </div>
  )
}
