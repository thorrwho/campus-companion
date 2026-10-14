import React, { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Plus,
  Users,
  Calendar,
  Building2,
  CheckCircle2,
  Trash2,
  Copy,
  Edit,
  ExternalLink,
  Tag,
  AlertCircle,
} from 'lucide-react'
import { useContentStore } from '@/store/useContentStore'
import { useActivityLogStore } from '@/store/useActivityLogStore'
import { useToastStore } from '@/store/useToastStore'
import { useAdminAuthStore } from '@/store/useAdminAuthStore'
import { Club } from '@/types'
import {
  DataTable,
  DataTableColumn,
  StatusBadge,
  ConfirmDialog,
} from '@/components/admin'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { CURATED_ICONS } from '@/components/admin/form/IconPicker'

export const ClubsListPage: React.FC = () => {
  const navigate = useNavigate()
  const {
    clubs,
    events,
    students,
    createItem,
    updateItem,
    deleteWithIntegrity,
    getDependents,
    clubCategories,
    addClubCategory,
    removeClubCategory,
  } = useContentStore()

  const { adminUser } = useAdminAuthStore()
  const { addActivity } = useActivityLogStore()
  const { push: pushToast } = useToastStore()

  // Filter States
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [membershipFilter, setMembershipFilter] = useState('all')

  // Modal States
  const [itemToDelete, setItemToDelete] = useState<Club | null>(null)
  const [bulkItemsToDelete, setBulkItemsToDelete] = useState<Club[]>([])
  const [isDeleting, setIsDeleting] = useState(false)
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')

  // Map of upcoming events per club
  const clubEventsCountMap = useMemo(() => {
    const map = new Map<string, number>()
    events.forEach((ev) => {
      if (ev.organizerClubId && ev.status !== 'Cancelled') {
        map.set(ev.organizerClubId, (map.get(ev.organizerClubId) || 0) + 1)
      }
    })
    return map
  }, [events])

  // Real member count from students joinedClubIds
  const clubActualMembersMap = useMemo(() => {
    const map = new Map<string, number>()
    students.forEach((st) => {
      if (st.joinedClubIds) {
        st.joinedClubIds.forEach((clubId) => {
          map.set(clubId, (map.get(clubId) || 0) + 1)
        })
      }
    })
    return map
  }, [students])

  // Overview Metrics
  const metrics = useMemo(() => {
    const totalClubs = clubs.length
    const activeClubs = clubs.filter((c) => c.status !== 'Inactive').length
    const totalMembers = clubs.reduce((acc, c) => {
      const realCount = clubActualMembersMap.get(c.id)
      return acc + (realCount !== undefined ? realCount : c.memberCount || 0)
    }, 0)
    const upcomingEvents = events.filter((e) => e.organizerClubId && e.status !== 'Cancelled').length

    return { totalClubs, activeClubs, totalMembers, upcomingEvents }
  }, [clubs, clubActualMembersMap, events])

  // Filtered Data
  const filteredData = useMemo(() => {
    return clubs.filter((item) => {
      if (categoryFilter !== 'all' && item.category.toLowerCase() !== categoryFilter.toLowerCase()) {
        return false
      }
      if (statusFilter !== 'all') {
        const itemStatus = item.status || 'Active'
        if (itemStatus.toLowerCase() !== statusFilter.toLowerCase()) return false
      }
      if (membershipFilter !== 'all') {
        const isOpen = item.acceptingMembers !== false
        if (membershipFilter === 'open' && !isOpen) return false
        if (membershipFilter === 'closed' && isOpen) return false
      }
      return true
    })
  }, [clubs, categoryFilter, statusFilter, membershipFilter])

  // Delete Handlers
  const handleConfirmSingleDelete = () => {
    if (!itemToDelete) return
    setIsDeleting(true)
    try {
      useActivityLogStore.getState().setLastDeleted({
        itemType: 'clubs',
        itemData: itemToDelete,
        timestamp: Date.now(),
      })
      deleteWithIntegrity('clubs', itemToDelete.id)
      addActivity({
        userEmail: adminUser?.email || 'admin@demo.edu',
        userName: adminUser?.name || 'Administrator',
        action: 'delete',
        itemType: 'club',
        itemId: itemToDelete.id,
        itemName: itemToDelete.name,
        summary: `Deleted club "${itemToDelete.name}" and updated member enrollments`,
      })
      pushToast({
        type: 'success',
        message: `Deleted "${itemToDelete.name}". You can undo this action from the Activity Log.`,
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
        deleteWithIntegrity('clubs', item.id)
        addActivity({
          userEmail: adminUser?.email || 'admin@demo.edu',
          userName: adminUser?.name || 'Administrator',
          action: 'bulk_delete',
          itemType: 'club',
          itemId: item.id,
          itemName: item.name,
          summary: `Bulk deleted club "${item.name}"`,
        })
      })
      pushToast({
        type: 'success',
        message: `Permanently deleted ${bulkItemsToDelete.length} clubs.`,
      })
      setBulkItemsToDelete([])
    } finally {
      setIsDeleting(false)
    }
  }

  // Bulk Status Changes
  const handleBulkStatusChange = (items: Club[], newStatus: 'Active' | 'Inactive') => {
    items.forEach((item) => {
      updateItem('clubs', item.id, { status: newStatus }, adminUser?.email)
      addActivity({
        userEmail: adminUser?.email || 'admin@demo.edu',
        userName: adminUser?.name || 'Administrator',
        action: newStatus === 'Active' ? 'reactivate' : 'suspend',
        itemType: 'club',
        itemId: item.id,
        itemName: item.name,
        summary: `Changed club status to ${newStatus}`,
      })
    })
    pushToast({
      type: 'success',
      message: `Updated ${items.length} clubs to ${newStatus}.`,
    })
  }

  // Duplicate Club
  const handleDuplicate = (club: Club) => {
    const cloneData: Omit<Club, 'id' | 'createdAt' | 'updatedAt'> = {
      ...club,
      name: `Copy of ${club.name}`,
      status: 'Active',
      memberCount: 0,
      upcomingEventIds: [],
    }
    const created = createItem('clubs', cloneData, adminUser?.email)
    addActivity({
      userEmail: adminUser?.email || 'admin@demo.edu',
      userName: adminUser?.name || 'Administrator',
      action: 'create',
      itemType: 'club',
      itemId: created.id,
      itemName: created.name,
      summary: `Duplicated club "${club.name}" as "${created.name}"`,
    })
    pushToast({
      type: 'success',
      message: `Created duplicate club "${created.name}".`,
    })
    navigate(`/admin/clubs/${created.id}/edit`)
  }

  // Category Management
  const handleAddCategory = () => {
    const trimmed = newCategoryName.trim().toLowerCase()
    if (!trimmed) return
    if (clubCategories.some((c) => c.id.toLowerCase() === trimmed || c.label.toLowerCase() === trimmed)) {
      pushToast({ type: 'warning', message: 'Category already exists.' })
      return
    }
    addClubCategory({
      id: trimmed,
      label: trimmed.charAt(0).toUpperCase() + trimmed.slice(1),
      icon: 'Tag',
      color: '#4f46e5',
    })
    setNewCategoryName('')
    pushToast({ type: 'success', message: `Added category "${trimmed}".` })
  }

  const handleDeleteCategory = (catId: string) => {
    const inUse = clubs.some((c) => c.category.toLowerCase() === catId.toLowerCase())
    if (inUse) {
      pushToast({
        type: 'error',
        message: `Cannot delete category "${catId}" because it is in use by one or more clubs.`,
      })
      return
    }
    removeClubCategory(catId)
    pushToast({ type: 'success', message: `Deleted category "${catId}".` })
  }

  // Dependents for current item to delete
  const dependents = useMemo(() => {
    if (!itemToDelete) return null
    return getDependents('clubs', itemToDelete.id)
  }, [itemToDelete, getDependents])

  // Table Columns
  const columns: DataTableColumn<Club>[] = [
    {
      key: 'name',
      header: 'Club',
      sortable: true,
      sortValue: (item) => item.name,
      render: (item) => {
        const IconComponent = item.icon && CURATED_ICONS[item.icon] ? CURATED_ICONS[item.icon] : Users
        const color = item.color || '#4f46e5'
        return (
          <div className="flex items-center gap-3 py-1">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-black/5"
              style={{ backgroundColor: `${color}18`, color: color }}
            >
              <IconComponent className="w-5 h-5" />
            </div>
            <div className="space-y-0.5 max-w-xs sm:max-w-md">
              <Link
                to={`/admin/clubs/${item.id}/edit`}
                className="font-semibold text-text-primary hover:text-primary-600 transition-colors text-sm line-clamp-1"
              >
                {item.name}
              </Link>
              <p className="text-xs text-text-muted line-clamp-1">
                {item.shortDescription || 'No description provided'}
              </p>
            </div>
          </div>
        )
      },
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      sortValue: (item) => item.category,
      render: (item) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider bg-canvas border border-border text-text-secondary">
          {item.category}
        </span>
      ),
    },
    {
      key: 'leadership',
      header: 'Coordinator & Lead',
      hideOnMobile: true,
      render: (item) => (
        <div className="space-y-0.5 text-xs">
          <div className="text-text-primary font-medium">
            {item.coordinator || 'No coordinator assigned'}
          </div>
          <div className="text-text-muted">
            Lead: {item.studentLeadName || 'Not specified'}
          </div>
        </div>
      ),
    },
    {
      key: 'members',
      header: 'Members',
      sortable: true,
      sortValue: (item) => {
        const real = clubActualMembersMap.get(item.id)
        return real !== undefined ? real : item.memberCount || 0
      },
      render: (item) => {
        const count = clubActualMembersMap.get(item.id) ?? item.memberCount ?? 0
        return (
          <Link
            to={`/admin/clubs/${item.id}/members`}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-card bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 hover:bg-primary-100 transition-colors text-xs font-semibold"
            title="Manage club members"
          >
            <Users className="w-3.5 h-3.5" />
            <span>{count}</span>
          </Link>
        )
      },
    },
    {
      key: 'events',
      header: 'Upcoming Events',
      sortable: true,
      sortValue: (item) => clubEventsCountMap.get(item.id) || 0,
      render: (item) => {
        const count = clubEventsCountMap.get(item.id) || 0
        if (count === 0) {
          return <span className="text-xs text-text-muted">0 events</span>
        }
        return (
          <Link
            to={`/admin/events?search=${encodeURIComponent(item.name)}`}
            className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-400 hover:underline"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{count} upcoming</span>
          </Link>
        )
      },
    },
    {
      key: 'acceptingMembers',
      header: 'Join Status',
      sortable: true,
      sortValue: (item) => (item.acceptingMembers !== false ? 1 : 0),
      render: (item) => {
        const isOpen = item.acceptingMembers !== false
        return (
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
              isOpen
                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
          >
            {isOpen ? 'Open' : 'Closed'}
          </span>
        )
      },
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      sortValue: (item) => item.status || 'Active',
      render: (item) => (
        <StatusBadge status={item.status === 'Inactive' ? 'Archived' : 'Published'} />
      ),
    },
  ]

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary">
              Clubs ({clubs.length})
            </h1>
          </div>
          <p className="text-caption text-text-secondary mt-1">
            Manage student clubs, organizations, faculty coordinators, and member rosters.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            onClick={() => setIsCategoryModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Tag className="w-4 h-4 text-text-secondary" />
            <span>Categories</span>
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/admin/clubs/new')}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Club</span>
          </Button>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-card border border-border bg-surface shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-950/40 text-primary-600 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">{metrics.totalClubs}</div>
            <div className="text-xs text-text-muted">Total Clubs</div>
          </div>
        </div>

        <div className="p-4 rounded-card border border-border bg-surface shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">{metrics.activeClubs}</div>
            <div className="text-xs text-text-muted">Active Clubs</div>
          </div>
        </div>

        <div className="p-4 rounded-card border border-border bg-surface shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">{metrics.totalMembers}</div>
            <div className="text-xs text-text-muted">Student Memberships</div>
          </div>
        </div>

        <div className="p-4 rounded-card border border-border bg-surface shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">{metrics.upcomingEvents}</div>
            <div className="text-xs text-text-muted">Organized Events</div>
          </div>
        </div>
      </div>

      {/* Main DataTable */}
      <DataTable
        data={filteredData}
        columns={columns}
        keyField="id"
        searchPlaceholder="Search by club name, coordinator, lead, or description..."
        searchFilter={(item, q) =>
          Boolean(
            item.name.toLowerCase().includes(q) ||
            item.shortDescription.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q) ||
            (item.coordinator && item.coordinator.toLowerCase().includes(q)) ||
            (item.studentLeadName && item.studentLeadName.toLowerCase().includes(q))
          )
        }
        filters={[
          {
            key: 'category',
            label: 'Category',
            value: categoryFilter,
            onChange: setCategoryFilter,
            options: [
              { label: 'All Categories', value: 'all' },
              ...clubCategories.map((c) => ({
                label: c.label,
                value: c.id,
              })),
            ],
          },
          {
            key: 'status',
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All Statuses', value: 'all' },
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ],
          },
          {
            key: 'membership',
            label: 'Join Status',
            value: membershipFilter,
            onChange: setMembershipFilter,
            options: [
              { label: 'All Join Statuses', value: 'all' },
              { label: 'Accepting Members', value: 'open' },
              { label: 'Closed', value: 'closed' },
            ],
          },
        ]}
        bulkActions={[
          {
            label: 'Activate Selected',
            icon: <CheckCircle2 className="w-4 h-4" />,
            onClick: (items) => handleBulkStatusChange(items, 'Active'),
          },
          {
            label: 'Deactivate Selected',
            icon: <AlertCircle className="w-4 h-4" />,
            onClick: (items) => handleBulkStatusChange(items, 'Inactive'),
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
            label: 'View in Student App',
            icon: <ExternalLink className="w-4 h-4" />,
            onClick: () => window.open(`/clubs/${item.id}`, '_blank'),
          },
          {
            label: 'Manage Members',
            icon: <Users className="w-4 h-4" />,
            onClick: () => navigate(`/admin/clubs/${item.id}/members`),
          },
          {
            label: 'Edit Club',
            icon: <Edit className="w-4 h-4" />,
            onClick: () => navigate(`/admin/clubs/${item.id}/edit`),
          },
          {
            label: 'Duplicate',
            icon: <Copy className="w-4 h-4" />,
            onClick: () => handleDuplicate(item),
          },
          {
            label: item.status === 'Inactive' ? 'Activate Club' : 'Deactivate Club',
            icon: <CheckCircle2 className="w-4 h-4" />,
            onClick: () => {
              const newStatus = item.status === 'Inactive' ? 'Active' : 'Inactive'
              updateItem('clubs', item.id, { status: newStatus }, adminUser?.email)
              pushToast({
                type: 'success',
                message: `Set "${item.name}" to ${newStatus}.`,
              })
            },
          },
          {
            label: 'Delete Club',
            icon: <Trash2 className="w-4 h-4" />,
            variant: 'danger',
            onClick: () => setItemToDelete(item),
          },
        ]}
        emptyState={{
          title: 'No clubs found',
          message: 'Get started by creating your first student club or organization.',
          actionLabel: 'New Club',
          onAction: () => navigate('/admin/clubs/new'),
        }}
      />

      {/* Single Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmSingleDelete}
        title="Delete Club"
        itemName={itemToDelete?.name}
        message={
          dependents?.hasDependents
            ? `Are you sure you want to delete "${itemToDelete?.name}"? Warning: ${dependents.description} Deleting will automatically unlink these dependent records.`
            : `Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be immediately reversed.`
        }
        confirmText="Delete Club"
        isLoading={isDeleting}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={bulkItemsToDelete.length > 0}
        onClose={() => setBulkItemsToDelete([])}
        onConfirm={handleConfirmBulkDelete}
        title="Delete Multiple Clubs"
        itemCount={bulkItemsToDelete.length}
        message={`You are about to permanently delete ${bulkItemsToDelete.length} clubs. Associated member registrations and event associations will be unlinked.`}
        confirmText={`Delete ${bulkItemsToDelete.length} Clubs`}
        isLoading={isDeleting}
      />

      {/* Category Management Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Manage Club Categories"
        maxWidth="md"
      >
        <div className="space-y-4 pt-1 text-left">
          <p className="text-caption text-text-secondary leading-relaxed">
            Configure dynamic club categories. Categories in use cannot be deleted until all clubs are reassigned.
          </p>

          {/* Add Category Input */}
          <div className="flex gap-2 items-center">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="e.g. entrepreneurship, robotics, arts..."
              className="flex-1 min-h-[40px] px-3 text-sm rounded-card border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-600"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddCategory()
                }
              }}
            />
            <Button
              variant="primary"
              size="md"
              onClick={handleAddCategory}
              disabled={!newCategoryName.trim()}
            >
              Add
            </Button>
          </div>

          {/* Category List */}
          <div className="border border-border rounded-card divide-y divide-border overflow-hidden max-h-60 overflow-y-auto">
            {clubCategories.map((cat) => {
              const inUseCount = clubs.filter((c) => c.category.toLowerCase() === cat.id.toLowerCase()).length
              return (
                <div
                  key={cat.id}
                  className="flex items-center justify-between px-3.5 py-2.5 bg-surface hover:bg-canvas transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-text-primary capitalize">{cat.label}</span>
                    <span className="text-xs text-text-muted">({inUseCount} clubs)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(cat.id)}
                    className="text-text-muted hover:text-status-error p-1 rounded transition-colors"
                    title={inUseCount > 0 ? 'Cannot delete category in use' : 'Delete category'}
                    disabled={inUseCount > 0}
                  >
                    <Trash2 className={`w-4 h-4 ${inUseCount > 0 ? 'opacity-30 cursor-not-allowed' : ''}`} />
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      </Modal>
    </div>
  )
}
