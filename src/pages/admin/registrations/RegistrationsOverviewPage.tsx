import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar,
  CheckCircle,
  XCircle,
  Download,
  Users,
  Check,
  Clock,
  Trash2,
  ExternalLink,
  Sparkles,
} from 'lucide-react'
import { useContentStore } from '@/store/useContentStore'
import { useActivityLogStore } from '@/store/useActivityLogStore'
import { useToastStore } from '@/store/useToastStore'
import { useAdminAuthStore } from '@/store/useAdminAuthStore'
import { EventRegistration, Student, Event } from '@/types'
import {
  DataTable,
  DataTableColumn,
  DataTableFilter,
  ConfirmDialog,
} from '@/components/admin'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'

interface JoinedRegistrationItem {
  id: string
  registration: EventRegistration
  student: Student | null
  event: Event | null
}

export const RegistrationsOverviewPage: React.FC = () => {
  const {
    events,
    students,
    eventRegistrations,
    departments,
    updateItem,
    removeItem,
    bulkRemove,
  } = useContentStore()

  const { adminUser } = useAdminAuthStore()
  const { addActivity } = useActivityLogStore()
  const { push: pushToast } = useToastStore()

  // Filter states
  const [eventFilter, setEventFilter] = useState<string>('all')
  const [deptFilter, setDeptFilter] = useState<string>('all')
  const [attendanceFilter, setAttendanceFilter] = useState<string>('all')
  const [timeframeFilter, setTimeframeFilter] = useState<string>('all')

  // Registration to delete
  const [itemToDelete, setItemToDelete] = useState<JoinedRegistrationItem | null>(null)

  // Bulk actions state
  const [selectedItems, setSelectedItems] = useState<JoinedRegistrationItem[]>([])
  const [bulkActionType, setBulkActionType] = useState<'attend' | 'unattend' | 'delete' | null>(null)

  // Join registrations with students and events
  const joinedData = useMemo<JoinedRegistrationItem[]>(() => {
    return eventRegistrations.map((reg) => {
      const student = students.find((s) => s.id === reg.studentId) || null
      const event = events.find((e) => e.id === reg.eventId) || null
      return {
        id: reg.id,
        registration: reg,
        student,
        event,
      }
    })
  }, [eventRegistrations, students, events])

  // Filtered registrations
  const filteredData = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10)

    return joinedData.filter(({ registration, student, event }) => {
      // Event filter
      if (eventFilter !== 'all' && registration.eventId !== eventFilter) {
        return false
      }

      // Department filter
      if (deptFilter !== 'all') {
        if (!student || student.department !== deptFilter) return false
      }

      // Attendance filter
      if (attendanceFilter === 'attended' && !registration.attended) return false
      if (attendanceFilter === 'unattended' && registration.attended) return false

      // Timeframe filter
      if (timeframeFilter === 'upcoming') {
        if (!event || event.date < todayStr) return false
      } else if (timeframeFilter === 'past') {
        if (!event || event.date >= todayStr) return false
      }

      return true
    })
  }, [joinedData, eventFilter, deptFilter, attendanceFilter, timeframeFilter])

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = eventRegistrations.length
    const attendedCount = eventRegistrations.filter((r) => r.attended).length
    const rate = total > 0 ? Math.round((attendedCount / total) * 100) : 0
    const distinctStudents = new Set(eventRegistrations.map((r) => r.studentId)).size
    const distinctEvents = new Set(eventRegistrations.map((r) => r.eventId)).size

    return {
      total,
      attendedCount,
      rate,
      distinctStudents,
      distinctEvents,
    }
  }, [eventRegistrations])

  // Filters definition for DataTable
  const filters: DataTableFilter[] = [
    {
      key: 'event',
      label: 'Campus Event',
      value: eventFilter,
      onChange: setEventFilter,
      options: [
        { label: 'All Events', value: 'all' },
        ...events.map((e) => ({ label: e.title, value: e.id })),
      ],
    },
    {
      key: 'department',
      label: 'Student Department',
      value: deptFilter,
      onChange: setDeptFilter,
      options: [
        { label: 'All Departments', value: 'all' },
        ...departments.map((d) => ({ label: `${d.name} (${d.code})`, value: d.code })),
      ],
    },
    {
      key: 'attendance',
      label: 'Attendance Status',
      value: attendanceFilter,
      onChange: setAttendanceFilter,
      options: [
        { label: 'All Statuses', value: 'all' },
        { label: 'Attended', value: 'attended' },
        { label: 'Pending / Unattended', value: 'unattended' },
      ],
    },
    {
      key: 'timeframe',
      label: 'Event Timeframe',
      value: timeframeFilter,
      onChange: setTimeframeFilter,
      options: [
        { label: 'All Dates', value: 'all' },
        { label: 'Upcoming Events', value: 'upcoming' },
        { label: 'Past Events', value: 'past' },
      ],
    },
  ]

  // Toggle single attendance
  const handleToggleAttendance = (item: JoinedRegistrationItem) => {
    const nextAttended = !item.registration.attended

    updateItem(
      'eventRegistrations',
      item.registration.id,
      { attended: nextAttended },
      adminUser?.email
    )

    addActivity({
      userEmail: adminUser?.email || 'admin@demo.edu',
      userName: adminUser?.name || 'Administrator',
      action: 'update',
      itemType: 'registration',
      itemId: item.registration.id,
      itemName: `${item.student?.name || 'Student'} in ${item.event?.title || 'Event'}`,
      summary: `Marked attendance as ${nextAttended ? 'Attended' : 'Unattended'}`,
    })

    pushToast({
      type: 'success',
      message: `Updated attendance to ${nextAttended ? 'Attended' : 'Unattended'}.`,
    })
  }

  // Delete single registration
  const handleDeleteRegistration = () => {
    if (!itemToDelete) return

    removeItem('eventRegistrations', itemToDelete.registration.id)

    // Unlink from student
    if (itemToDelete.student) {
      const updatedEvents = (itemToDelete.student.registeredEventIds || []).filter(
        (eid) => eid !== itemToDelete.registration.eventId
      )
      updateItem(
        'students',
        itemToDelete.student.id,
        { registeredEventIds: updatedEvents },
        adminUser?.email
      )
    }

    addActivity({
      userEmail: adminUser?.email || 'admin@demo.edu',
      userName: adminUser?.name || 'Administrator',
      action: 'delete',
      itemType: 'registration',
      itemId: itemToDelete.registration.id,
      itemName: `${itemToDelete.student?.name || 'Student'} in ${itemToDelete.event?.title || 'Event'}`,
      summary: `Removed event registration record`,
    })

    pushToast({
      type: 'info',
      message: 'Removed registration record.',
    })

    setItemToDelete(null)
  }

  // Handle Bulk Action
  const handleExecuteBulkAction = () => {
    if (selectedItems.length === 0 || !bulkActionType) return

    if (bulkActionType === 'delete') {
      const regIds = selectedItems.map((item) => item.registration.id)
      bulkRemove('eventRegistrations', regIds)

      addActivity({
        userEmail: adminUser?.email || 'admin@demo.edu',
        userName: adminUser?.name || 'Administrator',
        action: 'bulk_delete',
        itemType: 'registration',
        itemId: `bulk-reg-${Date.now()}`,
        itemName: `${selectedItems.length} registrations`,
        summary: `Bulk deleted ${selectedItems.length} event registrations`,
      })

      pushToast({
        type: 'info',
        message: `Removed ${selectedItems.length} registrations.`,
      })
    } else {
      const isAttended = bulkActionType === 'attend'
      selectedItems.forEach((item) => {
        updateItem(
          'eventRegistrations',
          item.registration.id,
          { attended: isAttended },
          adminUser?.email
        )
      })

      addActivity({
        userEmail: adminUser?.email || 'admin@demo.edu',
        userName: adminUser?.name || 'Administrator',
        action: 'update',
        itemType: 'registration',
        itemId: `bulk-reg-${Date.now()}`,
        itemName: `${selectedItems.length} registrations`,
        summary: `Marked ${selectedItems.length} registrations as ${isAttended ? 'Attended' : 'Unattended'}`,
      })

      pushToast({
        type: 'success',
        message: `Marked ${selectedItems.length} registrations as ${isAttended ? 'Attended' : 'Unattended'}.`,
      })
    }

    setBulkActionType(null)
    setSelectedItems([])
  }

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Student Name',
      'Roll Number',
      'Student Email',
      'Department',
      'Semester',
      'Event Title',
      'Event Category',
      'Event Date',
      'Event Venue',
      'Registered At',
      'Attended',
    ]

    const rows = filteredData.map(({ registration, student, event }) => {
      return [
        `"${(student?.name || 'Unknown Student').replace(/"/g, '""')}"`,
        `"${student?.rollNo || 'N/A'}"`,
        `"${student?.email || 'N/A'}"`,
        `"${student?.department || 'N/A'}"`,
        `"${student?.semester || 'N/A'}"`,
        `"${(event?.title || 'Unknown Event').replace(/"/g, '""')}"`,
        `"${event?.category || 'General'}"`,
        `"${event?.date || 'N/A'}"`,
        `"${(event?.locationId || 'Campus').replace(/"/g, '""')}"`,
        `"${registration.registeredAt ? registration.registeredAt.slice(0, 10) : 'N/A'}"`,
        registration.attended ? 'Yes' : 'No',
      ].join(',')
    })

    const csvContent = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `campus_event_registrations_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    addActivity({
      userEmail: adminUser?.email || 'admin@demo.edu',
      userName: adminUser?.name || 'Administrator',
      action: 'update',
      itemType: 'registration',
      itemId: `export-reg-${Date.now()}`,
      itemName: 'Event Registrations Database',
      summary: `Exported ${filteredData.length} registration records to CSV`,
    })

    pushToast({
      type: 'success',
      message: `Exported ${filteredData.length} registration records to CSV.`,
    })
  }

  // Table Columns
  const columns: DataTableColumn<JoinedRegistrationItem>[] = [
    {
      key: 'student',
      header: 'Student',
      sortable: true,
      sortValue: (item) => item.student?.name || '',
      render: (item) => {
        if (!item.student) {
          return <span className="text-text-muted italic text-xs">Unlinked Student</span>
        }
        return (
          <div className="flex items-center gap-2.5">
            <Avatar
              initials={item.student.avatarInitials}
              size="sm"
              className="shrink-0 font-bold"
            />
            <div>
              <Link
                to={`/admin/students/${item.student.id}`}
                className="font-semibold text-text-primary hover:text-primary-600 transition-colors block text-xs"
              >
                {item.student.name}
              </Link>
              <span className="font-mono text-[11px] text-text-muted">{item.student.rollNo}</span>
            </div>
          </div>
        )
      },
    },
    {
      key: 'event',
      header: 'Event',
      sortable: true,
      sortValue: (item) => item.event?.title || '',
      render: (item) => {
        if (!item.event) {
          return <span className="text-text-muted italic text-xs">Unlinked Event</span>
        }
        return (
          <div>
            <Link
              to={`/admin/events/${item.event.id}/registrations`}
              className="font-semibold text-text-primary hover:text-primary-600 transition-colors block text-xs truncate max-w-[200px]"
              title={item.event.title}
            >
              {item.event.title}
            </Link>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Badge variant="neutral" className="text-[10px] capitalize px-1.5 py-0">
                {item.event.category}
              </Badge>
              <span className="text-[11px] text-text-muted">
                {item.event.date}
              </span>
            </div>
          </div>
        )
      },
    },
    {
      key: 'department',
      header: 'Branch & Sem',
      sortable: true,
      sortValue: (item) => item.student?.department || '',
      render: (item) => {
        if (!item.student) return <span className="text-text-muted text-xs">N/A</span>
        return (
          <div className="text-xs">
            <span className="font-semibold text-text-primary">{item.student.department}</span>
            <span className="text-text-muted ml-1.5">Sem {item.student.semester}</span>
          </div>
        )
      },
    },
    {
      key: 'eventDate',
      header: 'Event Schedule',
      sortable: true,
      sortValue: (item) => item.event?.date || '',
      render: (item) => {
        if (!item.event) return <span className="text-text-muted text-xs">TBD</span>
        return (
          <div className="text-xs text-text-secondary">
            <div className="flex items-center gap-1 font-medium text-text-primary">
              <Calendar className="w-3 h-3 text-text-muted" aria-hidden="true" />
              <span>{item.event.date}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-text-muted mt-0.5">
              <Clock className="w-3 h-3 text-text-muted" aria-hidden="true" />
              <span>
                {item.event.startTime} to {item.event.endTime}
              </span>
            </div>
          </div>
        )
      },
    },
    {
      key: 'registeredAt',
      header: 'Registered Date',
      sortable: true,
      sortValue: (item) => item.registration.registeredAt || '',
      render: (item) => (
        <span className="text-xs text-text-muted">
          {item.registration.registeredAt ? item.registration.registeredAt.slice(0, 10) : 'N/A'}
        </span>
      ),
    },
    {
      key: 'attended',
      header: 'Attendance',
      sortable: true,
      sortValue: (item) => (item.registration.attended ? 1 : 0),
      render: (item) => {
        const isAttended = item.registration.attended
        return (
          <button
            type="button"
            onClick={() => handleToggleAttendance(item)}
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer shadow-xs',
              isAttended
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                : 'bg-canvas text-text-muted border-border hover:bg-surface hover:text-text-primary'
            )}
            title="Click to toggle attendance"
          >
            {isAttended ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" aria-hidden="true" />
                <span>Attended</span>
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-text-muted/50" aria-hidden="true" />
                <span>Unattended</span>
              </>
            )}
          </button>
        )
      },
    },
  ]

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface p-6 rounded-card border border-border shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-h1 font-bold text-text-primary tracking-tight">
              Event Registrations Registry
            </h1>
            <Badge variant="primary">Campus Participation</Badge>
          </div>
          <p className="text-small text-text-secondary mt-1">
            Unified cross-event database of student enrollments, attendance check-ins, and participant rosters.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportCSV}
            className="gap-2"
          >
            <Download className="w-4 h-4 text-text-muted" aria-hidden="true" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-surface p-3.5 rounded-card border border-border shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="text-caption text-text-muted font-medium">Total Registrations</div>
            <div className="text-h3 font-bold text-text-primary">{metrics.total}</div>
          </div>
        </div>

        <div className="bg-surface p-3.5 rounded-card border border-border shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="text-caption text-text-muted font-medium">Attended Count</div>
            <div className="text-h3 font-bold text-emerald-700">
              {metrics.attendedCount}{' '}
              <span className="text-xs font-normal text-text-muted">({metrics.rate}%)</span>
            </div>
          </div>
        </div>

        <div className="bg-surface p-3.5 rounded-card border border-border shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="text-caption text-text-muted font-medium">Enrolled Students</div>
            <div className="text-h3 font-bold text-text-primary">{metrics.distinctStudents}</div>
          </div>
        </div>

        <div className="bg-surface p-3.5 rounded-card border border-border shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="text-caption text-text-muted font-medium">Active Events</div>
            <div className="text-h3 font-bold text-text-primary">{metrics.distinctEvents}</div>
          </div>
        </div>
      </div>

      {/* Main DataTable */}
      <DataTable<JoinedRegistrationItem>
        data={filteredData}
        columns={columns}
        keyField="id"
        searchPlaceholder="Search by student name, roll number, or event title..."
        searchFilter={(item, q) =>
          (item.student?.name.toLowerCase().includes(q) || false) ||
          (item.student?.rollNo.toLowerCase().includes(q) || false) ||
          (item.student?.email.toLowerCase().includes(q) || false) ||
          (item.event?.title.toLowerCase().includes(q) || false) ||
          (item.student?.department.toLowerCase().includes(q) || false)
        }
        filters={filters}
        bulkActions={[
          {
            label: 'Mark Selected Attended',
            variant: 'primary',
            onClick: (selected) => {
              setSelectedItems(selected)
              setBulkActionType('attend')
            },
          },
          {
            label: 'Mark Selected Unattended',
            variant: 'secondary',
            onClick: (selected) => {
              setSelectedItems(selected)
              setBulkActionType('unattend')
            },
          },
          {
            label: 'Remove Selected',
            variant: 'danger',
            onClick: (selected) => {
              setSelectedItems(selected)
              setBulkActionType('delete')
            },
          },
        ]}
        rowActions={(item) => [
          {
            label: item.registration.attended ? 'Mark Unattended' : 'Mark Attended',
            icon: item.registration.attended ? (
              <XCircle className="w-4 h-4 text-text-muted" aria-hidden="true" />
            ) : (
              <CheckCircle className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            ),
            onClick: () => handleToggleAttendance(item),
          },
          ...(item.student
            ? [
                {
                  label: 'View Student Profile',
                  icon: <ExternalLink className="w-4 h-4" aria-hidden="true" />,
                  onClick: () => window.open(`/admin/students/${item.student?.id}`, '_self'),
                },
              ]
            : []),
          ...(item.event
            ? [
                {
                  label: 'View Event Roster',
                  icon: <Calendar className="w-4 h-4" aria-hidden="true" />,
                  onClick: () => window.open(`/admin/events/${item.event?.id}/registrations`, '_self'),
                },
              ]
            : []),
          {
            label: 'Remove Registration',
            icon: <Trash2 className="w-4 h-4 text-status-error" aria-hidden="true" />,
            variant: 'danger',
            onClick: () => setItemToDelete(item),
          },
        ]}
        emptyState={{
          title: 'No registration records match your filter criteria',
          message: 'Try clearing your filters to view all event registrations across campus.',
          actionLabel: 'Reset Filters',
          onAction: () => {
            setEventFilter('all')
            setDeptFilter('all')
            setAttendanceFilter('all')
            setTimeframeFilter('all')
          },
        }}
      />

      {/* ========================================================================= */}
      {/* Delete Registration Confirmation Dialog                                   */}
      {/* ========================================================================= */}
      <ConfirmDialog
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleDeleteRegistration}
        title="Remove Event Registration"
        message={`Are you sure you want to remove the registration of "${itemToDelete?.student?.name}" for "${itemToDelete?.event?.title}"?`}
        confirmText="Remove Registration"
        variant="danger"
      />

      {/* ========================================================================= */}
      {/* Bulk Action Confirmation Dialog                                           */}
      {/* ========================================================================= */}
      <ConfirmDialog
        isOpen={Boolean(bulkActionType)}
        onClose={() => {
          setBulkActionType(null)
          setSelectedItems([])
        }}
        onConfirm={handleExecuteBulkAction}
        title={
          bulkActionType === 'delete'
            ? `Delete ${selectedItems.length} Registrations`
            : `Update ${selectedItems.length} Registrations`
        }
        message={
          bulkActionType === 'delete'
            ? `Are you sure you want to permanently remove ${selectedItems.length} selected registration records?`
            : `Are you sure you want to mark ${selectedItems.length} registrations as ${bulkActionType === 'attend' ? 'Attended' : 'Unattended'}?`
        }
        itemCount={selectedItems.length}
        confirmText={
          bulkActionType === 'delete'
            ? 'Delete Registrations'
            : bulkActionType === 'attend'
            ? 'Mark Attended'
            : 'Mark Unattended'
        }
        variant={bulkActionType === 'delete' ? 'danger' : 'primary'}
      />
    </div>
  )
}
