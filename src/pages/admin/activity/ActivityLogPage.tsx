import React, { useState, useMemo } from 'react'
import {
  RotateCcw,
  Trash2,
  Clock,
} from 'lucide-react'
import { useActivityLogStore } from '@/store/useActivityLogStore'
import { useToastStore } from '@/store/useToastStore'
import { ActivityLogItem } from '@/types'
import {
  DataTable,
  DataTableColumn,
  DataTableFilter,
  ConfirmDialog,
} from '@/components/admin'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export const ActivityLogPage: React.FC = () => {
  const {
    activities,
    lastDeleted,
    undoLastDelete,
    clearActivities,
  } = useActivityLogStore()

  const { push: pushToast } = useToastStore()

  // Filter states
  const [actionFilter, setActionFilter] = useState<string>('all')
  const [itemTypeFilter, setItemTypeFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')

  // Clear dialog state
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false)

  // Filter definition
  const filters: DataTableFilter[] = [
    {
      key: 'action',
      label: 'Admin Action',
      value: actionFilter,
      onChange: setActionFilter,
      options: [
        { label: 'All Actions', value: 'all' },
        { label: 'Create', value: 'create' },
        { label: 'Update', value: 'update' },
        { label: 'Delete', value: 'delete' },
        { label: 'Bulk Delete', value: 'bulk_delete' },
        { label: 'Publish', value: 'publish' },
        { label: 'Cancel', value: 'cancel' },
        { label: 'Suspend', value: 'suspend' },
        { label: 'Reactivate', value: 'reactivate' },
        { label: 'Restore', value: 'restore' },
      ],
    },
    {
      key: 'itemType',
      label: 'Content Entity',
      value: itemTypeFilter,
      onChange: setItemTypeFilter,
      options: [
        { label: 'All Entities', value: 'all' },
        { label: 'Announcement', value: 'announcement' },
        { label: 'Event', value: 'event' },
        { label: 'Club', value: 'club' },
        { label: 'Broadcast', value: 'notification' },
        { label: 'Location', value: 'location' },
        { label: 'Facility', value: 'facility' },
        { label: 'Faculty', value: 'faculty' },
        { label: 'Department', value: 'department' },
        { label: 'Timetable', value: 'timetable' },
        { label: 'Student', value: 'student' },
        { label: 'Registration', value: 'registration' },
      ],
    },
    {
      key: 'dateRange',
      label: 'Activity Date',
      value: dateFilter,
      onChange: setDateFilter,
      options: [
        { label: 'All Time', value: 'all' },
        { label: 'Today', value: 'today' },
        { label: 'Last 7 Days', value: '7days' },
        { label: 'Last 30 Days', value: '30days' },
      ],
    },
  ]

  // Filtered dataset
  const filteredActivities = useMemo(() => {
    const now = Date.now()
    const todayStr = new Date().toISOString().slice(0, 10)
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000

    return activities.filter((act) => {
      if (actionFilter !== 'all' && act.action !== actionFilter) return false
      if (itemTypeFilter !== 'all' && act.itemType !== itemTypeFilter) return false

      if (dateFilter === 'today') {
        if (!act.timestamp.startsWith(todayStr)) return false
      } else if (dateFilter === '7days') {
        if (new Date(act.timestamp).getTime() < sevenDaysAgo) return false
      } else if (dateFilter === '30days') {
        if (new Date(act.timestamp).getTime() < thirtyDaysAgo) return false
      }

      return true
    })
  }, [activities, actionFilter, itemTypeFilter, dateFilter])

  // Handle Undo
  const handleUndo = () => {
    const result = undoLastDelete()
    if (result.success) {
      pushToast({
        type: 'success',
        message: result.message,
      })
    } else {
      pushToast({
        type: 'error',
        message: result.message,
      })
    }
  }

  // Handle Clear
  const handleClearLog = () => {
    clearActivities()
    pushToast({
      type: 'info',
      message: 'Activity log history cleared.',
    })
    setIsClearConfirmOpen(false)
  }

  // Action Badge styling helper
  const getActionBadgeVariant = (action: string): 'primary' | 'success' | 'warning' | 'error' | 'neutral' => {
    switch (action) {
      case 'create':
      case 'restore':
      case 'reactivate':
        return 'success'
      case 'publish':
        return 'primary'
      case 'update':
        return 'neutral'
      case 'cancel':
      case 'suspend':
        return 'warning'
      case 'delete':
      case 'bulk_delete':
        return 'error'
      default:
        return 'neutral'
    }
  }

  // Columns definition
  const columns: DataTableColumn<ActivityLogItem>[] = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      sortable: true,
      sortValue: (act) => act.timestamp,
      render: (act) => (
        <div className="flex items-center gap-1.5 text-xs text-text-secondary font-mono">
          <Clock className="w-3.5 h-3.5 text-text-muted shrink-0" aria-hidden="true" />
          <span>
            {new Date(act.timestamp).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}{' '}
            {act.timestamp.slice(11, 16)}
          </span>
        </div>
      ),
    },
    {
      key: 'user',
      header: 'Administrator',
      sortable: true,
      sortValue: (act) => act.userName,
      render: (act) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-[10px] font-bold shrink-0">
            {act.userName ? act.userName[0] : 'A'}
          </div>
          <div>
            <div className="font-semibold text-text-primary text-xs">{act.userName}</div>
            <div className="text-[11px] text-text-muted font-mono">{act.userEmail}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      sortable: true,
      sortValue: (act) => act.action,
      render: (act) => (
        <Badge variant={getActionBadgeVariant(act.action)} className="uppercase text-[10px] font-mono">
          {act.action}
        </Badge>
      ),
    },
    {
      key: 'itemType',
      header: 'Entity Type',
      sortable: true,
      sortValue: (act) => act.itemType,
      render: (act) => (
        <span className="inline-block px-2 py-0.5 rounded bg-surface-secondary text-xs font-semibold text-text-secondary border border-border capitalize">
          {act.itemType}
        </span>
      ),
    },
    {
      key: 'itemName',
      header: 'Target Record',
      sortable: true,
      sortValue: (act) => act.itemName,
      render: (act) => (
        <div className="font-semibold text-text-primary text-xs truncate max-w-[200px]" title={act.itemName}>
          {act.itemName}
        </div>
      ),
    },
    {
      key: 'summary',
      header: 'Mutation Summary',
      sortable: false,
      render: (act) => (
        <p className="text-caption text-text-secondary line-clamp-2 max-w-sm">
          {act.summary}
        </p>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface p-6 rounded-card border border-border shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-h1 font-bold text-text-primary tracking-tight">
              Administrative Audit Log
            </h1>
            <Badge variant="primary">Security & Safety</Badge>
          </div>
          <p className="text-small text-text-secondary mt-1">
            Chronological record of every administrative content mutation, publishing action, and account change.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsClearConfirmOpen(true)}
            disabled={activities.length === 0}
            className="gap-2 text-status-error hover:bg-status-error-bg"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
            <span>Clear Log</span>
          </Button>
        </div>
      </div>

      {/* Undo Banner if recently deleted item exists */}
      {lastDeleted && (
        <div className="p-4 rounded-card bg-primary-50 border border-primary-300 text-primary-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-card animate-pulse">
          <div className="flex items-center gap-2.5">
            <RotateCcw className="w-5 h-5 text-primary-600 shrink-0" aria-hidden="true" />
            <div className="text-small">
              <span className="font-semibold">Recent Deletion Available for Undo: </span>
              <span>
                "{lastDeleted.itemData.name || lastDeleted.itemData.title || lastDeleted.itemData.subject || 'Record'}" ({lastDeleted.itemType})
              </span>
            </div>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleUndo}
            className="gap-1.5 shrink-0 self-start sm:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Undo Deletion</span>
          </Button>
        </div>
      )}

      {/* Main Activity DataTable */}
      <DataTable<ActivityLogItem>
        data={filteredActivities}
        columns={columns}
        keyField="id"
        searchPlaceholder="Search audit log by record name, admin email, or summary..."
        searchFilter={(act, q) =>
          act.itemName.toLowerCase().includes(q) ||
          act.userEmail.toLowerCase().includes(q) ||
          act.userName.toLowerCase().includes(q) ||
          act.summary.toLowerCase().includes(q) ||
          act.itemType.toLowerCase().includes(q)
        }
        filters={filters}
        emptyState={{
          title: 'No activity log entries found',
          message: 'Try clearing your filters or performing administrative operations in the portal.',
          actionLabel: 'Reset Filters',
          onAction: () => {
            setActionFilter('all')
            setItemTypeFilter('all')
            setDateFilter('all')
          },
        }}
      />

      {/* Clear Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isClearConfirmOpen}
        onClose={() => setIsClearConfirmOpen(false)}
        onConfirm={handleClearLog}
        title="Clear Activity History"
        message="Are you sure you want to clear the administrative audit history? This action cannot be undone."
        confirmText="Clear History"
        variant="danger"
      />
    </div>
  )
}
