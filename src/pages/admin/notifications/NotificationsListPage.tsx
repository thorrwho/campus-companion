import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Send,
  Bell,
  Clock,
  RotateCcw,
  Trash2,
  Users,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { useContentStore } from '@/store/useContentStore'
import { useUserStore } from '@/store/useUserStore'
import { useActivityLogStore } from '@/store/useActivityLogStore'
import { useToastStore } from '@/store/useToastStore'
import { useAdminAuthStore } from '@/store/useAdminAuthStore'
import { BroadcastNotification } from '@/types'
import {
  DataTable,
  DataTableColumn,
  StatusBadge,
  ConfirmDialog,
} from '@/components/admin'
import { Button } from '@/components/ui/Button'

export const NotificationsListPage: React.FC = () => {
  const navigate = useNavigate()
  const { notifications, updateItem, removeItem, createItem, students } =
    useContentStore()
  const { addNotification } = useUserStore()
  const { addActivity, setLastDeleted } = useActivityLogStore()
  const { push: pushToast } = useToastStore()
  const { adminUser } = useAdminAuthStore()

  // Filter states
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedType, setSelectedType] = useState('all')

  // Deletion dialog states
  const [itemToDelete, setItemToDelete] = useState<BroadcastNotification | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Overall metrics calculation
  const metrics = useMemo(() => {
    const total = notifications.length
    const sentList = notifications.filter((n) => n.status === 'sent')
    const scheduledCount = notifications.filter((n) => n.status === 'scheduled').length

    const totalReach = sentList.reduce((acc, curr) => acc + (curr.recipientsCount || 0), 0)
    const totalReads = sentList.reduce((acc, curr) => acc + (curr.readCount || 0), 0)
    const avgReadRate = totalReach > 0 ? Math.round((totalReads / totalReach) * 100) : 0

    return {
      total,
      sentCount: sentList.length,
      scheduledCount,
      totalReach,
      avgReadRate,
    }
  }, [notifications])

  // Audience label formatter
  const formatAudience = (audience: BroadcastNotification['audience']) => {
    if (!audience || audience.type === 'all') return `All Students (${students.length})`
    const parts: string[] = []
    if (audience.departments && audience.departments.length > 0) {
      parts.push(audience.departments.join(', '))
    }
    if (audience.semesters && audience.semesters.length > 0) {
      parts.push(`Sem ${audience.semesters.join(', ')}`)
    }
    return parts.length > 0 ? parts.join(' - ') : 'Targeted Group'
  }

  // Handle single delete
  const handleConfirmDelete = () => {
    if (!itemToDelete) return
    setIsDeleting(true)
    try {
      setLastDeleted({
        itemType: 'notifications',
        itemData: itemToDelete,
        timestamp: Date.now(),
      })
      removeItem('notifications', itemToDelete.id)
      addActivity({
        userEmail: adminUser?.email || 'admin@demo.edu',
        userName: adminUser?.name || 'Administrator',
        action: 'delete',
        itemType: 'notification',
        itemId: itemToDelete.id,
        itemName: itemToDelete.title,
        summary: `Deleted notification "${itemToDelete.title}"`,
      })
      pushToast({
        type: 'success',
        message: `Deleted notification "${itemToDelete.title}".`,
      })
      setItemToDelete(null)
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle recall
  const handleRecall = (notif: BroadcastNotification) => {
    updateItem('notifications', notif.id, { status: 'recalled' }, adminUser?.email)
    addActivity({
      userEmail: adminUser?.email || 'admin@demo.edu',
      userName: adminUser?.name || 'Administrator',
      action: 'cancel',
      itemType: 'notification',
      itemId: notif.id,
      itemName: notif.title,
      summary: `Recalled broadcast "${notif.title}"`,
    })
    pushToast({
      type: 'info',
      message: `Broadcast "${notif.title}" has been recalled.`,
    })
  }

  // Handle resend broadcast
  const handleResend = (notif: BroadcastNotification) => {
    const cloneData: Omit<BroadcastNotification, 'id' | 'createdAt' | 'updatedAt'> = {
      title: notif.title,
      message: notif.message,
      type: notif.type,
      link: notif.link,
      audience: notif.audience,
      status: 'sent',
      sentAt: new Date().toISOString(),
      recipientsCount: notif.recipientsCount || students.length,
      readCount: 0,
    }
    const created = createItem('notifications', cloneData, adminUser?.email)

    // Add to student active notifications
    addNotification({
      id: created.id,
      type: notif.type,
      title: notif.title,
      body: notif.message,
      createdAt: new Date().toISOString(),
      read: false,
      link: notif.link || '/notifications',
    })

    addActivity({
      userEmail: adminUser?.email || 'admin@demo.edu',
      userName: adminUser?.name || 'Administrator',
      action: 'create',
      itemType: 'notification',
      itemId: created.id,
      itemName: created.title,
      summary: `Resent broadcast notification to ${created.recipientsCount} students`,
    })

    pushToast({
      type: 'success',
      message: `Resent broadcast "${notif.title}" to ${created.recipientsCount} recipients.`,
    })
  }

  // Filtered dataset
  const filteredData = useMemo(() => {
    return notifications.filter((item) => {
      const matchesStatus = selectedStatus === 'all' || item.status === selectedStatus
      const matchesType = selectedType === 'all' || item.type === selectedType
      return matchesStatus && matchesType
    })
  }, [notifications, selectedStatus, selectedType])

  // Table columns
  const columns: DataTableColumn<BroadcastNotification>[] = [
    {
      key: 'title',
      header: 'Notification',
      sortable: true,
      render: (item) => (
        <div className="space-y-1 py-1 max-w-sm">
          <div className="font-semibold text-text-primary text-sm">
            {item.title}
          </div>
          <p className="text-xs text-text-muted line-clamp-1 leading-normal">
            {item.message}
          </p>
          {item.link && (
            <span className="text-[11px] text-primary-600 font-mono">
              Action link: {item.link}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (item) => (
        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent-100 text-primary-700 capitalize">
          {item.type}
        </span>
      ),
    },
    {
      key: 'audience',
      header: 'Target Audience',
      render: (item) => (
        <span className="text-xs text-text-secondary">
          {formatAudience(item.audience)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (item) => (
        <StatusBadge
          status={
            item.status === 'sent'
              ? 'Published'
              : item.status === 'scheduled'
              ? 'Scheduled'
              : 'Cancelled'
          }
          size="sm"
        />
      ),
    },
    {
      key: 'delivery',
      header: 'Delivery Timing',
      sortable: true,
      render: (item) => {
        const dateStr = item.sentAt || item.scheduledFor
        const formatted = dateStr ? dateStr.slice(0, 16).replace('T', ' ') : 'N/A'
        return (
          <span className="text-xs font-mono text-text-muted">
            {formatted}
          </span>
        )
      },
    },
    {
      key: 'reach',
      header: 'Read Rate',
      render: (item) => {
        if (item.status !== 'sent') {
          return <span className="text-xs text-text-muted">Pending send</span>
        }
        const pct =
          item.recipientsCount > 0
            ? Math.round((item.readCount / item.recipientsCount) * 100)
            : 0
        return (
          <div className="space-y-1">
            <div className="text-xs font-medium text-text-primary">
              {item.readCount} / {item.recipientsCount}{' '}
              <span className="text-text-muted">({pct}%)</span>
            </div>
            <div className="w-24 h-1.5 rounded-full bg-border overflow-hidden">
              <div
                className="h-full bg-primary-600 rounded-full"
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
            Broadcast Notifications
          </h1>
          <p className="text-caption text-text-secondary mt-1">
            Dispatch urgent push alerts, event reminders, and official notices directly to student devices.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/admin/notifications/new')}
          leftIcon={<Send className="w-4 h-4" />}
        >
          Send Broadcast
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-card border border-border bg-surface shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">{metrics.total}</div>
            <div className="text-xs text-text-muted">Total Broadcasts</div>
          </div>
        </div>

        <div className="p-4 rounded-card border border-border bg-surface shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">{metrics.totalReach}</div>
            <div className="text-xs text-text-muted">Total Reach</div>
          </div>
        </div>

        <div className="p-4 rounded-card border border-border bg-surface shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">{metrics.avgReadRate}%</div>
            <div className="text-xs text-text-muted">Average Read Rate</div>
          </div>
        </div>

        <div className="p-4 rounded-card border border-border bg-surface shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sky-50 dark:bg-sky-950/40 text-sky-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">{metrics.scheduledCount}</div>
            <div className="text-xs text-text-muted">Scheduled</div>
          </div>
        </div>
      </div>

      {/* Main DataTable */}
      <DataTable
        data={filteredData}
        columns={columns}
        keyField="id"
        searchPlaceholder="Search by title, message, or link..."
        searchFilter={(item, q) =>
          item.title.toLowerCase().includes(q) ||
          item.message.toLowerCase().includes(q) ||
          (item.link && item.link.toLowerCase().includes(q)) ||
          item.type.toLowerCase().includes(q)
        }
        filters={[
          {
            key: 'status',
            label: 'Status',
            value: selectedStatus,
            onChange: setSelectedStatus,
            options: [
              { label: 'Sent', value: 'sent' },
              { label: 'Scheduled', value: 'scheduled' },
              { label: 'Recalled', value: 'recalled' },
            ],
          },
          {
            key: 'type',
            label: 'Type',
            value: selectedType,
            onChange: setSelectedType,
            options: [
              { label: 'Announcement', value: 'announcement' },
              { label: 'Event', value: 'event' },
              { label: 'Reminder', value: 'reminder' },
              { label: 'System', value: 'system' },
            ],
          },
        ]}
        rowActions={(item) => [
          {
            label: 'Resend Broadcast',
            icon: <RotateCcw className="w-4 h-4" />,
            onClick: () => handleResend(item),
          },
          ...(item.status !== 'recalled'
            ? [
                {
                  label: 'Recall Broadcast',
                  icon: <AlertCircle className="w-4 h-4" />,
                  onClick: () => handleRecall(item),
                },
              ]
            : []),
          {
            label: 'Delete',
            icon: <Trash2 className="w-4 h-4" />,
            variant: 'danger' as const,
            onClick: () => setItemToDelete(item),
          },
        ]}
        emptyState={{
          title: 'No broadcast notifications found',
          message: 'Compose your first broadcast to deliver alerts directly to student devices.',
          actionLabel: 'Send Broadcast',
          onAction: () => navigate('/admin/notifications/new'),
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        itemName={itemToDelete?.title}
        isLoading={isDeleting}
      />
    </div>
  )
}
