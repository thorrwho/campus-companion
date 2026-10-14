import React, { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Plus,
  Building,
  Clock,
  Trash2,
  Copy,
  Edit,
  ExternalLink,
  Sliders,
  CheckCircle2,
  XCircle,
  RotateCcw,
} from 'lucide-react'
import { useContentStore } from '@/store/useContentStore'
import { useActivityLogStore } from '@/store/useActivityLogStore'
import { useToastStore } from '@/store/useToastStore'
import { useAdminAuthStore } from '@/store/useAdminAuthStore'
import { Facility } from '@/types'
import {
  DataTable,
  DataTableColumn,
  ConfirmDialog,
} from '@/components/admin'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { computeFacilityStatus } from '@/components/domain/FacilityCard'

export const FacilitiesListPage: React.FC = () => {
  const navigate = useNavigate()
  const {
    facilities,
    locations,
    createItem,
    updateItem,
    deleteWithIntegrity,
    getDependents,
  } = useContentStore()

  const { adminUser } = useAdminAuthStore()
  const { addActivity } = useActivityLogStore()
  const { push: pushToast } = useToastStore()

  // Filters
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  // Modals
  const [itemToDelete, setItemToDelete] = useState<Facility | null>(null)
  const [bulkItemsToDelete, setBulkItemsToDelete] = useState<Facility[]>([])
  const [isDeleting, setIsDeleting] = useState(false)

  // Quick Override Modal
  const [overrideFacility, setOverrideFacility] = useState<Facility | null>(null)
  const [selectedOverride, setSelectedOverride] = useState<'auto' | 'force_open' | 'force_closed' | 'limited'>('auto')
  const [overrideMessage, setOverrideMessage] = useState('')

  // Map of location names
  const locationMap = useMemo(() => {
    const map = new Map<string, string>()
    locations.forEach((l) => map.set(l.id, `${l.name} (${l.building})`))
    return map
  }, [locations])

  // Overview Metrics
  const metrics = useMemo(() => {
    const total = facilities.length
    let openCount = 0
    let overriddenCount = 0

    facilities.forEach((f) => {
      const computed = computeFacilityStatus(f)
      if (computed.status === 'open') openCount++
      if (f.statusOverride && f.statusOverride !== 'auto') overriddenCount++
    })

    const allServices = new Set<string>()
    facilities.forEach((f) => f.services?.forEach((s) => allServices.add(s)))

    return { total, openCount, overriddenCount, servicesCount: allServices.size }
  }, [facilities])

  // Distinct types
  const uniqueTypes = useMemo(() => {
    const set = new Set<string>()
    facilities.forEach((f) => {
      if (f.type) set.add(f.type)
    })
    return Array.from(set).sort()
  }, [facilities])

  // Filtered Data
  const filteredData = useMemo(() => {
    return facilities.filter((item) => {
      if (typeFilter !== 'all' && item.type.toLowerCase() !== typeFilter.toLowerCase()) {
        return false
      }
      if (statusFilter !== 'all') {
        if (statusFilter === 'override') {
          if (!item.statusOverride || item.statusOverride === 'auto') return false
        } else {
          const computed = computeFacilityStatus(item)
          if (computed.status !== statusFilter) return false
        }
      }
      return true
    })
  }, [facilities, typeFilter, statusFilter])

  // Delete Handlers
  const handleConfirmSingleDelete = () => {
    if (!itemToDelete) return
    setIsDeleting(true)
    try {
      useActivityLogStore.getState().setLastDeleted({
        itemType: 'facilities',
        itemData: itemToDelete,
        timestamp: Date.now(),
      })
      deleteWithIntegrity('facilities', itemToDelete.id)
      addActivity({
        userEmail: adminUser?.email || 'admin@demo.edu',
        userName: adminUser?.name || 'Administrator',
        action: 'delete',
        itemType: 'facility',
        itemId: itemToDelete.id,
        itemName: itemToDelete.name,
        summary: `Deleted facility "${itemToDelete.name}" and unlinked dependents`,
      })
      pushToast({
        type: 'success',
        message: `Deleted "${itemToDelete.name}".`,
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
        deleteWithIntegrity('facilities', item.id)
        addActivity({
          userEmail: adminUser?.email || 'admin@demo.edu',
          userName: adminUser?.name || 'Administrator',
          action: 'bulk_delete',
          itemType: 'facility',
          itemId: item.id,
          itemName: item.name,
          summary: `Bulk deleted facility "${item.name}"`,
        })
      })
      pushToast({
        type: 'success',
        message: `Permanently deleted ${bulkItemsToDelete.length} facilities.`,
      })
      setBulkItemsToDelete([])
    } finally {
      setIsDeleting(false)
    }
  }

  // Bulk Override Changes
  const handleBulkSetOverride = (items: Facility[], override: 'auto' | 'force_open' | 'force_closed') => {
    items.forEach((item) => {
      updateItem('facilities', item.id, { statusOverride: override }, adminUser?.email)
      addActivity({
        userEmail: adminUser?.email || 'admin@demo.edu',
        userName: adminUser?.name || 'Administrator',
        action: 'update',
        itemType: 'facility',
        itemId: item.id,
        itemName: item.name,
        summary: `Set status override for "${item.name}" to ${override}`,
      })
    })
    pushToast({
      type: 'success',
      message: `Updated status override for ${items.length} facilities to ${override}.`,
    })
  }

  // Quick Override Submit
  const handleSaveQuickOverride = () => {
    if (!overrideFacility) return
    updateItem(
      'facilities',
      overrideFacility.id,
      {
        statusOverride: selectedOverride,
        statusMessage: overrideMessage.trim() || undefined,
      },
      adminUser?.email
    )
    addActivity({
      userEmail: adminUser?.email || 'admin@demo.edu',
      userName: adminUser?.name || 'Administrator',
      action: 'update',
      itemType: 'facility',
      itemId: overrideFacility.id,
      itemName: overrideFacility.name,
      summary: `Set status override to ${selectedOverride}${overrideMessage ? ` (${overrideMessage})` : ''}`,
    })
    pushToast({
      type: 'success',
      message: `Updated override for "${overrideFacility.name}".`,
    })
    setOverrideFacility(null)
  }

  // Duplicate Facility
  const handleDuplicate = (facility: Facility) => {
    const cloneData: Omit<Facility, 'id' | 'createdAt' | 'updatedAt'> = {
      ...facility,
      name: `Copy of ${facility.name}`,
      statusOverride: 'auto',
      statusMessage: undefined,
    }
    const created = createItem('facilities', cloneData, adminUser?.email)
    addActivity({
      userEmail: adminUser?.email || 'admin@demo.edu',
      userName: adminUser?.name || 'Administrator',
      action: 'create',
      itemType: 'facility',
      itemId: created.id,
      itemName: created.name,
      summary: `Duplicated facility "${facility.name}" as "${created.name}"`,
    })
    pushToast({
      type: 'success',
      message: `Created duplicate facility "${created.name}".`,
    })
    navigate(`/admin/facilities/${created.id}/edit`)
  }

  // Dependents for current item to delete
  const dependents = useMemo(() => {
    if (!itemToDelete) return null
    return getDependents('facilities', itemToDelete.id)
  }, [itemToDelete, getDependents])

  // Table Columns
  const columns: DataTableColumn<Facility>[] = [
    {
      key: 'name',
      header: 'Facility',
      sortable: true,
      sortValue: (item) => item.name,
      render: (item) => (
        <div className="flex items-center gap-3 py-1">
          <div className="w-9 h-9 rounded-lg bg-primary-50 dark:bg-primary-950/40 text-primary-600 flex items-center justify-center shrink-0 border border-black/5">
            <Building className="w-5 h-5" />
          </div>
          <div className="space-y-0.5 max-w-xs sm:max-w-md">
            <Link
              to={`/admin/facilities/${item.id}/edit`}
              className="font-semibold text-text-primary hover:text-primary-600 transition-colors text-sm line-clamp-1"
            >
              {item.name}
            </Link>
            <div className="text-xs text-text-muted flex items-center gap-2">
              <span className="capitalize">{item.type}</span>
              {item.contact && (
                <>
                  <span>•</span>
                  <span>{item.contact}</span>
                </>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Campus Location',
      sortable: true,
      sortValue: (item) => locationMap.get(item.locationId) || '',
      render: (item) => (
        <span className="text-xs text-text-secondary">
          {locationMap.get(item.locationId) || 'Location not set'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Operational Status',
      sortable: true,
      sortValue: (item) => item.statusOverride || 'auto',
      render: (item) => {
        const computed = computeFacilityStatus(item)
        const isOverridden = item.statusOverride && item.statusOverride !== 'auto'

        return (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                  computed.status === 'open'
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                    : computed.status === 'limited'
                    ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300'
                    : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300'
                }`}
              >
                {computed.label}
              </span>

              {isOverridden && (
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                  Override
                </span>
              )}
            </div>

            {item.statusMessage && (
              <p className="text-[11px] text-text-muted italic max-w-xs truncate">
                {item.statusMessage}
              </p>
            )}
          </div>
        )
      },
    },
    {
      key: 'hours',
      header: "Today's Schedule",
      hideOnMobile: true,
      render: (item) => {
        const now = new Date()
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
        const todayDay = days[now.getDay()]
        const hoursStr = item.openHours?.[todayDay] || 'Check full schedule'
        return <span className="text-xs text-text-muted">{hoursStr}</span>
      },
    },
    {
      key: 'services',
      header: 'Services',
      hideOnMobile: true,
      render: (item) => (
        <span className="text-xs text-text-muted">
          {item.services?.length || 0} service{(item.services?.length || 0) === 1 ? '' : 's'}
        </span>
      ),
    },
  ]

  return (
    <div className="space-y-6 text-left pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Campus Facilities ({facilities.length})
          </h1>
          <p className="text-caption text-text-secondary mt-1">
            Manage student dining, libraries, clinics, operational hours, and real-time status overrides.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            onClick={() => window.open('/facilities', '_blank')}
            className="flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4 text-text-secondary" />
            <span>View in App</span>
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/admin/facilities/new')}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Facility</span>
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-card border border-border bg-surface shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-950/40 text-primary-600 flex items-center justify-center shrink-0">
            <Building className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">{metrics.total}</div>
            <div className="text-xs text-text-muted">Total Facilities</div>
          </div>
        </div>

        <div className="p-4 rounded-card border border-border bg-surface shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">{metrics.openCount}</div>
            <div className="text-xs text-text-muted">Open Right Now</div>
          </div>
        </div>

        <div className="p-4 rounded-card border border-border bg-surface shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center shrink-0">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">{metrics.overriddenCount}</div>
            <div className="text-xs text-text-muted">Active Overrides</div>
          </div>
        </div>

        <div className="p-4 rounded-card border border-border bg-surface shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">{metrics.servicesCount}</div>
            <div className="text-xs text-text-muted">Distinct Services</div>
          </div>
        </div>
      </div>

      {/* Main DataTable */}
      <DataTable
        data={filteredData}
        columns={columns}
        keyField="id"
        searchPlaceholder="Search facilities by name, type, services, or contact..."
        searchFilter={(item, q) =>
          Boolean(
            item.name.toLowerCase().includes(q) ||
            item.type.toLowerCase().includes(q) ||
            item.contact.toLowerCase().includes(q) ||
            (item.notes && item.notes.toLowerCase().includes(q)) ||
            (item.services && item.services.some((s) => s.toLowerCase().includes(q)))
          )
        }
        filters={[
          {
            key: 'status',
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All Statuses', value: 'all' },
              { label: 'Open Now', value: 'open' },
              { label: 'Closed', value: 'closed' },
              { label: 'Limited Hours', value: 'limited' },
              { label: 'Manual Overrides', value: 'override' },
            ],
          },
          {
            key: 'type',
            label: 'Facility Type',
            value: typeFilter,
            onChange: setTypeFilter,
            options: [
              { label: 'All Types', value: 'all' },
              ...uniqueTypes.map((t) => ({ label: t, value: t })),
            ],
          },
        ]}
        bulkActions={[
          {
            label: 'Reset to Auto Schedule',
            icon: <RotateCcw className="w-4 h-4" />,
            onClick: (items) => handleBulkSetOverride(items, 'auto'),
          },
          {
            label: 'Force Open',
            icon: <CheckCircle2 className="w-4 h-4" />,
            onClick: (items) => handleBulkSetOverride(items, 'force_open'),
          },
          {
            label: 'Force Closed',
            icon: <XCircle className="w-4 h-4" />,
            onClick: (items) => handleBulkSetOverride(items, 'force_closed'),
          },
          {
            label: 'Delete Selected',
            icon: <Trash2 className="w-4 h-4" />,
            variant: 'danger',
            onClick: (items) => setBulkItemsToDelete(items),
          },
        ]}
        rowActions={(item) => [
          {
            label: 'Quick Override Status',
            icon: <Sliders className="w-4 h-4" />,
            onClick: () => {
              setOverrideFacility(item)
              setSelectedOverride(item.statusOverride || 'auto')
              setOverrideMessage(item.statusMessage || '')
            },
          },
          {
            label: 'View in Student App',
            icon: <ExternalLink className="w-4 h-4" />,
            onClick: () => window.open(`/facilities/${item.id}`, '_blank'),
          },
          {
            label: 'Edit Facility',
            icon: <Edit className="w-4 h-4" />,
            onClick: () => navigate(`/admin/facilities/${item.id}/edit`),
          },
          {
            label: 'Duplicate',
            icon: <Copy className="w-4 h-4" />,
            onClick: () => handleDuplicate(item),
          },
          {
            label: 'Delete Facility',
            icon: <Trash2 className="w-4 h-4" />,
            variant: 'danger',
            onClick: () => setItemToDelete(item),
          },
        ]}
        emptyState={{
          title: 'No facilities found',
          message: 'Get started by creating your first campus facility or dining hall.',
          actionLabel: 'New Facility',
          onAction: () => navigate('/admin/facilities/new'),
        }}
      />

      {/* Quick Override Modal */}
      <Modal
        isOpen={Boolean(overrideFacility)}
        onClose={() => setOverrideFacility(null)}
        title={`Status Override: ${overrideFacility?.name || ''}`}
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2.5 w-full">
            <Button
              variant="outline"
              size="md"
              onClick={() => setOverrideFacility(null)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleSaveQuickOverride}
            >
              Apply Override
            </Button>
          </div>
        }
      >
        <div className="space-y-4 pt-1 text-left">
          <p className="text-caption text-text-secondary leading-relaxed">
            Instantly override the computed opening hours for this facility. Overrides take precedence immediately in the student app.
          </p>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-text-primary">
              Override Setting
            </label>
            <select
              value={selectedOverride}
              onChange={(e) => setSelectedOverride(e.target.value as any)}
              className="w-full min-h-[42px] px-3.5 py-2 text-sm rounded-card border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-600"
            >
              <option value="auto">Auto (Calculate status strictly from weekly hours)</option>
              <option value="force_open">Force Open (Show as Open regardless of schedule)</option>
              <option value="force_closed">Force Closed (Show as Closed regardless of schedule)</option>
              <option value="limited">Limited Operations (Show warning banner)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-text-primary">
              Optional Student Notice Message
            </label>
            <input
              type="text"
              value={overrideMessage}
              onChange={(e) => setOverrideMessage(e.target.value)}
              placeholder="e.g. Closed today for scheduled maintenance"
              className="w-full min-h-[42px] px-3.5 py-2 text-sm rounded-card border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-600"
            />
          </div>
        </div>
      </Modal>

      {/* Single Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmSingleDelete}
        title="Delete Facility"
        itemName={itemToDelete?.name}
        message={
          dependents?.hasDependents
            ? `Are you sure you want to delete "${itemToDelete?.name}"? Warning: ${dependents.description} Deleting will automatically unlink this record.`
            : `Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be immediately reversed.`
        }
        confirmText="Delete Facility"
        isLoading={isDeleting}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={bulkItemsToDelete.length > 0}
        onClose={() => setBulkItemsToDelete([])}
        onConfirm={handleConfirmBulkDelete}
        title="Delete Multiple Facilities"
        itemCount={bulkItemsToDelete.length}
        message={`You are about to permanently delete ${bulkItemsToDelete.length} facilities.`}
        confirmText={`Delete ${bulkItemsToDelete.length} Facilities`}
        isLoading={isDeleting}
      />
    </div>
  )
}
