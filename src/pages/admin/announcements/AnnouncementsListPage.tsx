import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Pin,
  AlertTriangle,
  Edit2,
  Copy,
  ExternalLink,
  Trash2,
  Tag,
  Radio,
  Clock,
  FileText,
} from 'lucide-react'
import { useContentStore } from '@/store/useContentStore'
import { useActivityLogStore } from '@/store/useActivityLogStore'
import { useToastStore } from '@/store/useToastStore'
import { useAdminAuthStore } from '@/store/useAdminAuthStore'
import { Announcement } from '@/types'
import {
  DataTable,
  DataTableColumn,
  StatusBadge,
  ConfirmDialog,
} from '@/components/admin'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { TextField } from '@/components/admin/form/TextField'

export const AnnouncementsListPage: React.FC = () => {
  const navigate = useNavigate()
  const { announcements, announcementCategories, departments, updateItem, removeItem, bulkRemove, createItem, addAnnouncementCategory } =
    useContentStore()
  const { addActivity, setLastDeleted } = useActivityLogStore()
  const { push: pushToast } = useToastStore()
  const { adminUser } = useAdminAuthStore()

  // Filters state
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Deletion dialog states
  const [itemToDelete, setItemToDelete] = useState<Announcement | null>(null)
  const [bulkItemsToDelete, setBulkItemsToDelete] = useState<Announcement[]>([])
  const [isDeleting, setIsDeleting] = useState(false)

  // Category manager modal
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [newCategoryLabel, setNewCategoryLabel] = useState('')

  // Overview metrics
  const stats = useMemo(() => {
    const total = announcements.length
    const published = announcements.filter((a) => (a.status || 'Published') === 'Published').length
    const scheduled = announcements.filter((a) => a.status === 'Scheduled').length
    const draft = announcements.filter((a) => a.status === 'Draft').length
    return { total, published, scheduled, draft }
  }, [announcements])

  // Audience format helper
  const formatAudience = (audience?: Announcement['targetAudience']) => {
    if (!audience || audience.type === 'all') return 'All Students'
    const parts: string[] = []
    if (audience.departments && audience.departments.length > 0) {
      const deptLabels = audience.departments.map((dVal) => {
        const found = departments.find((d) => d.id === dVal || d.code === dVal)
        return found ? found.code : dVal
      })
      parts.push(deptLabels.join(', '))
    }
    if (audience.semesters && audience.semesters.length > 0) {
      parts.push(`Sem ${audience.semesters.join(', ')}`)
    }
    return parts.length > 0 ? parts.join(' : ') : 'Specific'
  }

  // Handle single deletion
  const handleConfirmSingleDelete = () => {
    if (!itemToDelete) return
    setIsDeleting(true)
    try {
      setLastDeleted({
        itemType: 'announcements',
        itemData: itemToDelete,
        timestamp: Date.now(),
      })
      removeItem('announcements', itemToDelete.id)
      addActivity({
        userEmail: adminUser?.email || 'admin@demo.edu',
        userName: adminUser?.name || 'Administrator',
        action: 'delete',
        itemType: 'announcement',
        itemId: itemToDelete.id,
        itemName: itemToDelete.title,
        summary: `Deleted announcement "${itemToDelete.title}"`,
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
      const ids = bulkItemsToDelete.map((item) => item.id)
      bulkRemove('announcements', ids)
      bulkItemsToDelete.forEach((item) => {
        addActivity({
          userEmail: adminUser?.email || 'admin@demo.edu',
          userName: adminUser?.name || 'Administrator',
          action: 'delete',
          itemType: 'announcement',
          itemId: item.id,
          itemName: item.title,
          summary: `Bulk deleted announcement "${item.title}"`,
        })
      })
      pushToast({
        type: 'success',
        message: `Permanently deleted ${bulkItemsToDelete.length} announcements.`,
      })
      setBulkItemsToDelete([])
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle bulk status change
  const handleBulkStatusChange = (items: Announcement[], newStatus: 'Published' | 'Archived') => {
    items.forEach((item) => {
      updateItem('announcements', item.id, { status: newStatus }, adminUser?.email)
      addActivity({
        userEmail: adminUser?.email || 'admin@demo.edu',
        userName: adminUser?.name || 'Administrator',
        action: newStatus === 'Published' ? 'publish' : 'update',
        itemType: 'announcement',
        itemId: item.id,
        itemName: item.title,
        summary: `Changed announcement status to ${newStatus}`,
      })
    })
    pushToast({
      type: 'success',
      message: `Updated ${items.length} announcements to ${newStatus}.`,
    })
  }

  // Duplicate announcement
  const handleDuplicate = (announcement: Announcement) => {
    const cloneData: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'> = {
      ...announcement,
      title: `Copy of ${announcement.title}`,
      status: 'Draft',
      postedAt: new Date().toISOString().slice(0, 10),
      readCount: 0,
    }
    const created = createItem('announcements', cloneData, adminUser?.email)
    addActivity({
      userEmail: adminUser?.email || 'admin@demo.edu',
      userName: adminUser?.name || 'Administrator',
      action: 'create',
      itemType: 'announcement',
      itemId: created.id,
      itemName: created.title,
      summary: `Duplicated announcement from "${announcement.title}"`,
    })
    pushToast({
      type: 'success',
      message: `Created duplicate "${created.title}".`,
    })
  }

  // Add category
  const handleAddCategory = () => {
    const label = newCategoryLabel.trim()
    if (!label) return
    const id = label.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    addAnnouncementCategory({ id, label })
    pushToast({ type: 'success', message: `Added category "${label}".` })
    setNewCategoryLabel('')
    setIsCategoryModalOpen(false)
  }

  // Filtered dataset
  const filteredData = useMemo(() => {
    return announcements.filter((item) => {
      const itemStatus = item.status || 'Published'
      const matchesStatus = selectedStatus === 'all' || itemStatus === selectedStatus
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
      return matchesStatus && matchesCategory
    })
  }, [announcements, selectedStatus, selectedCategory])

  // Table columns
  const columns: DataTableColumn<Announcement>[] = [
    {
      key: 'title',
      header: 'Announcement',
      sortable: true,
      render: (item) => (
        <div className="space-y-1 py-1">
          <div className="flex items-center gap-2 flex-wrap">
            {item.pinned && (
              <span
                title="Pinned Announcement"
                className="inline-flex items-center text-amber-600 bg-amber-50 dark:bg-amber-950/40 p-0.5 rounded"
              >
                <Pin className="w-3.5 h-3.5" />
              </span>
            )}
            {item.isImportant && (
              <span
                title="Urgent Announcement"
                className="inline-flex items-center text-red-600 bg-red-50 dark:bg-red-950/40 p-0.5 rounded"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
              </span>
            )}
            <button
              type="button"
              onClick={() => navigate(`/admin/announcements/${item.id}/edit`)}
              className="font-semibold text-text-primary hover:text-primary-600 text-left transition-colors"
            >
              {item.title}
            </button>
          </div>
          <p className="text-xs text-text-muted line-clamp-1 max-w-md">
            {Array.isArray(item.body) ? item.body[0] : item.body}
          </p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (item) => (
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent-100 text-primary-700 capitalize">
          {item.category}
        </span>
      ),
    },
    {
      key: 'targetAudience',
      header: 'Audience',
      sortable: true,
      render: (item) => (
        <span className="text-xs text-text-secondary">
          {formatAudience(item.targetAudience)}
        </span>
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
      key: 'postedAt',
      header: 'Date',
      sortable: true,
      render: (item) => (
        <span className="text-xs font-mono text-text-muted">{item.postedAt}</span>
      ),
    },
    {
      key: 'postedBy',
      header: 'Author',
      hideOnMobile: true,
      render: (item) => (
        <span className="text-xs text-text-secondary">{item.postedBy}</span>
      ),
    },
  ]

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Announcements Management
          </h1>
          <p className="text-caption text-text-secondary mt-1">
            Create, schedule, target, and publish official campus circulars for students.
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
            onClick={() => navigate('/admin/announcements/new')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            New Announcement
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-card border border-border bg-surface shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">{stats.total}</div>
            <div className="text-xs text-text-muted">Total Circulars</div>
          </div>
        </div>

        <div className="p-4 rounded-card border border-border bg-surface shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">{stats.published}</div>
            <div className="text-xs text-text-muted">Active Published</div>
          </div>
        </div>

        <div className="p-4 rounded-card border border-border bg-surface shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sky-50 dark:bg-sky-950/40 text-sky-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">{stats.scheduled}</div>
            <div className="text-xs text-text-muted">Scheduled</div>
          </div>
        </div>

        <div className="p-4 rounded-card border border-border bg-surface shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">{stats.draft}</div>
            <div className="text-xs text-text-muted">Drafts</div>
          </div>
        </div>
      </div>

      {/* Main DataTable */}
      <DataTable
        data={filteredData}
        columns={columns}
        keyField="id"
        searchPlaceholder="Search by title, author, or content..."
        searchFilter={(item, q) =>
          item.title.toLowerCase().includes(q) ||
          item.postedBy.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          (Array.isArray(item.body)
            ? item.body.join(' ').toLowerCase().includes(q)
            : item.body.toLowerCase().includes(q))
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
              { label: 'Scheduled', value: 'Scheduled' },
              { label: 'Archived', value: 'Archived' },
            ],
          },
          {
            key: 'category',
            label: 'Category',
            value: selectedCategory,
            onChange: setSelectedCategory,
            options: announcementCategories.map((c) => ({
              label: c.label,
              value: c.id,
            })),
          },
        ]}
        bulkActions={[
          {
            label: 'Publish Selected',
            onClick: (items) => handleBulkStatusChange(items, 'Published'),
          },
          {
            label: 'Archive Selected',
            onClick: (items) => handleBulkStatusChange(items, 'Archived'),
          },
          {
            label: 'Delete Selected',
            variant: 'danger',
            onClick: (items) => setBulkItemsToDelete(items),
          },
        ]}
        rowActions={(item) => [
          {
            label: 'Edit',
            icon: <Edit2 className="w-4 h-4" />,
            onClick: () => navigate(`/admin/announcements/${item.id}/edit`),
          },
          {
            label: 'Duplicate',
            icon: <Copy className="w-4 h-4" />,
            onClick: () => handleDuplicate(item),
          },
          {
            label: 'View in App',
            icon: <ExternalLink className="w-4 h-4" />,
            onClick: () => navigate(`/announcements/${item.id}`),
          },
          {
            label: 'Delete',
            icon: <Trash2 className="w-4 h-4" />,
            variant: 'danger',
            onClick: () => setItemToDelete(item),
          },
        ]}
        emptyState={{
          title: 'No announcements found',
          message: 'No circulars match your current search or filter criteria.',
          actionLabel: 'Create Announcement',
          onAction: () => navigate('/admin/announcements/new'),
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

      {/* Delete Bulk Confirmation Dialog (requires DELETE word when > 5) */}
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
        title="Manage Announcement Categories"
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
            Categories classify announcements on both the student mobile app and admin feeds.
          </p>

          <div className="flex items-center gap-2">
            <TextField
              value={newCategoryLabel}
              onChange={(e) => setNewCategoryLabel(e.target.value)}
              placeholder="New category name (e.g. Examinations, Library)"
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
              Existing Categories ({announcementCategories.length})
            </h4>
            <div className="flex flex-wrap items-center gap-2">
              {announcementCategories.map((cat) => (
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
