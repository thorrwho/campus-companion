import React, { useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Download,
  UserPlus,
  Users,
  CheckCircle,
  XCircle,
  Calendar,
  MapPin,
  Trash2,
  Check,
  Clock,
} from 'lucide-react'
import { useContentStore } from '@/store/useContentStore'
import { useActivityLogStore } from '@/store/useActivityLogStore'
import { useToastStore } from '@/store/useToastStore'
import { useAdminAuthStore } from '@/store/useAdminAuthStore'
import { Student, EventRegistration } from '@/types'
import {
  DataTable,
  DataTableColumn,
  ConfirmDialog,
} from '@/components/admin'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Avatar } from '@/components/ui/Avatar'
import { SearchableSelect } from '@/components/admin/form/SearchableSelect'

interface JoinedRegistration {
  registration: EventRegistration
  student: Student | null
}

export const EventRegistrationsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const {
    events,
    eventRegistrations,
    students,
    locations,
    createItem,
    updateItem,
    removeItem,
  } = useContentStore()
  const { addActivity } = useActivityLogStore()
  const { push: pushToast } = useToastStore()
  const { adminUser } = useAdminAuthStore()

  // Current event
  const currentEvent = useMemo(() => {
    return events.find((e) => e.id === id)
  }, [events, id])

  const venueName = useMemo(() => {
    if (!currentEvent) return 'Campus'
    const loc = locations.find((l) => l.id === currentEvent.locationId)
    return loc ? `${loc.name} (${loc.building})` : 'Campus'
  }, [locations, currentEvent])

  // Filters
  const [attendanceFilter, setAttendanceFilter] = useState('all')

  // Modals state
  const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [registrationToDelete, setRegistrationToDelete] = useState<JoinedRegistration | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Joined registrations dataset
  const joinedRegistrations: JoinedRegistration[] = useMemo(() => {
    if (!id) return []
    const matching = eventRegistrations.filter((r) => r.eventId === id)
    const studentMap = new Map<string, Student>()
    students.forEach((s) => studentMap.set(s.id, s))

    return matching.map((reg) => ({
      registration: reg,
      student: studentMap.get(reg.studentId) || null,
    }))
  }, [eventRegistrations, students, id])

  // Overview metrics
  const stats = useMemo(() => {
    const total = joinedRegistrations.length
    const attended = joinedRegistrations.filter((r) => r.registration.attended).length
    const pending = total - attended
    const capacity = currentEvent?.capacity || 0
    const remaining = Math.max(0, capacity - total)

    return { total, attended, pending, capacity, remaining }
  }, [joinedRegistrations, currentEvent])

  // Toggle attendance status
  const handleToggleAttendance = (joined: JoinedRegistration) => {
    const newAttended = !joined.registration.attended
    updateItem('eventRegistrations', joined.registration.id, { attended: newAttended }, adminUser?.email)

    const studentName = joined.student ? joined.student.name : 'Student'
    addActivity({
      userEmail: adminUser?.email || 'admin@demo.edu',
      userName: adminUser?.name || 'Administrator',
      action: 'update',
      itemType: 'event',
      itemId: joined.registration.eventId,
      itemName: currentEvent?.title || 'Event',
      summary: `Marked ${studentName} as ${newAttended ? 'Attended' : 'Absent'}`,
    })

    pushToast({
      type: 'success',
      message: `${studentName} marked as ${newAttended ? 'Attended' : 'Absent'}.`,
    })
  }

  // Remove student registration
  const handleConfirmRemoveRegistration = () => {
    if (!registrationToDelete || !currentEvent) return
    setIsDeleting(true)
    try {
      removeItem('eventRegistrations', registrationToDelete.registration.id)

      // Decrement event registeredCount
      const newCount = Math.max(0, (currentEvent.registeredCount || 0) - 1)
      updateItem('events', currentEvent.id, { registeredCount: newCount }, adminUser?.email)

      const studentName = registrationToDelete.student
        ? registrationToDelete.student.name
        : 'Student'
      addActivity({
        userEmail: adminUser?.email || 'admin@demo.edu',
        userName: adminUser?.name || 'Administrator',
        action: 'delete',
        itemType: 'event',
        itemId: currentEvent.id,
        itemName: currentEvent.title,
        summary: `Cancelled event registration for ${studentName}`,
      })

      pushToast({
        type: 'success',
        message: `Cancelled registration for ${studentName}.`,
      })
      setRegistrationToDelete(null)
    } finally {
      setIsDeleting(false)
    }
  }

  // Manual Enroll student
  const handleEnrollStudent = () => {
    if (!selectedStudentId || !currentEvent) return

    const student = students.find((s) => s.id === selectedStudentId)
    if (!student) return

    const newReg: Omit<EventRegistration, 'id'> = {
      eventId: currentEvent.id,
      studentId: student.id,
      registeredAt: new Date().toISOString(),
      attended: false,
    }

    createItem('eventRegistrations', newReg, adminUser?.email)

    // Increment event registeredCount
    const newCount = (currentEvent.registeredCount || 0) + 1
    updateItem('events', currentEvent.id, { registeredCount: newCount }, adminUser?.email)

    addActivity({
      userEmail: adminUser?.email || 'admin@demo.edu',
      userName: adminUser?.name || 'Administrator',
      action: 'create',
      itemType: 'event',
      itemId: currentEvent.id,
      itemName: currentEvent.title,
      summary: `Manually enrolled ${student.name} in event`,
    })

    pushToast({
      type: 'success',
      message: `Enrolled ${student.name} successfully.`,
    })

    setSelectedStudentId('')
    setIsEnrollModalOpen(false)
  }

  // Export to CSV
  const handleExportCSV = () => {
    if (!currentEvent) return
    const headers = [
      'Student Name',
      'Roll Number',
      'Department',
      'Semester',
      'Email',
      'Registered At',
      'Attendance Status',
    ]

    const rows = joinedRegistrations.map((item) => {
      const s = item.student
      const attendedStr = item.registration.attended ? 'Attended' : 'Absent'
      const registeredStr = item.registration.registeredAt
        ? item.registration.registeredAt.replace('T', ' ').slice(0, 19)
        : 'N/A'

      return [
        `"${s?.name || 'Unknown'}"`,
        `"${s?.rollNo || 'N/A'}"`,
        `"${s?.department || 'N/A'}"`,
        `"${s?.semester || 'N/A'}"`,
        `"${s?.email || 'N/A'}"`,
        `"${registeredStr}"`,
        `"${attendedStr}"`,
      ].join(',')
    })

    const csvContent = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `event-${currentEvent.id}-registrations.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    pushToast({
      type: 'success',
      message: `Exported ${joinedRegistrations.length} registrations to CSV.`,
    })
  }

  // Filtered dataset
  const filteredData = useMemo(() => {
    return joinedRegistrations.filter((item) => {
      if (attendanceFilter === 'attended') {
        return item.registration.attended
      } else if (attendanceFilter === 'pending') {
        return !item.registration.attended
      }
      return true
    })
  }, [joinedRegistrations, attendanceFilter])

  // Available students to manually enroll
  const availableStudentsForEnroll = useMemo(() => {
    const enrolledStudentIds = new Set(joinedRegistrations.map((r) => r.registration.studentId))
    return students
      .filter((s) => !enrolledStudentIds.has(s.id) && s.status !== 'Suspended')
      .map((s) => ({
        value: s.id,
        label: `${s.name} (${s.rollNo})`,
        sublabel: `${s.department} Sem ${s.semester} - ${s.email}`,
      }))
  }, [students, joinedRegistrations])

  // Table columns
  const columns: DataTableColumn<JoinedRegistration>[] = [
    {
      key: 'student',
      header: 'Student',
      sortable: true,
      sortValue: (item) => item.student?.name || '',
      render: (item) => (
        <div className="flex items-center gap-3 py-1">
          <Avatar
            initials={
              item.student?.avatarInitials ||
              (item.student?.name
                ? item.student.name.slice(0, 2).toUpperCase()
                : 'ST')
            }
            name={item.student?.name || 'Student'}
            size="sm"
          />
          <div className="space-y-0.5">
            <div className="font-semibold text-text-primary text-sm">
              {item.student?.name || 'Unknown Student'}
            </div>
            <div className="text-xs text-text-muted">
              {item.student?.email || 'No email registered'}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'rollNo',
      header: 'Roll No',
      sortable: true,
      sortValue: (item) => item.student?.rollNo || '',
      render: (item) => (
        <span className="font-mono text-xs text-text-primary font-medium">
          {item.student?.rollNo || 'N/A'}
        </span>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      sortable: true,
      sortValue: (item) => item.student?.department || '',
      render: (item) => (
        <div className="text-xs space-y-0.5">
          <div className="font-medium text-text-primary">
            {item.student?.department || 'N/A'}
          </div>
          <div className="text-text-muted">Sem {item.student?.semester || '1'}</div>
        </div>
      ),
    },
    {
      key: 'registeredAt',
      header: 'Registered On',
      sortable: true,
      sortValue: (item) => item.registration.registeredAt,
      render: (item) => {
        const d = item.registration.registeredAt
        return (
          <span className="text-xs font-mono text-text-muted">
            {d ? d.slice(0, 16).replace('T', ' ') : 'N/A'}
          </span>
        )
      },
    },
    {
      key: 'attendance',
      header: 'Attendance',
      sortable: true,
      sortValue: (item) => (item.registration.attended ? 1 : 0),
      render: (item) => {
        const isAttended = item.registration.attended
        return (
          <button
            type="button"
            onClick={() => handleToggleAttendance(item)}
            className={
              isAttended
                ? 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors'
                : 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-canvas text-text-secondary border border-border hover:bg-surface transition-colors'
            }
          >
            {isAttended ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>Attended</span>
              </>
            ) : (
              <>
                <XCircle className="w-3.5 h-3.5 text-text-muted" />
                <span>Mark Present</span>
              </>
            )}
          </button>
        )
      },
    },
  ]

  if (!currentEvent) {
    return (
      <div className="space-y-4 text-left py-12 text-center">
        <h2 className="text-xl font-bold text-text-primary">Event Not Found</h2>
        <p className="text-caption text-text-secondary">
          The requested event could not be found or has been removed.
        </p>
        <Button variant="primary" size="md" onClick={() => navigate('/admin/events')}>
          Back to Events
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 text-left">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            to="/admin/events"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Events
          </Link>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl font-bold text-text-primary tracking-tight">
              {currentEvent.title}
            </h1>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-accent-100 text-primary-700 capitalize">
              {currentEvent.category}
            </span>
          </div>
          <div className="flex items-center gap-4 text-xs text-text-muted pt-0.5">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {currentEvent.date} ({currentEvent.startTime} to {currentEvent.endTime})
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {venueName}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            onClick={handleExportCSV}
            leftIcon={<Download className="w-4 h-4" />}
            disabled={joinedRegistrations.length === 0}
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsEnrollModalOpen(true)}
            leftIcon={<UserPlus className="w-4 h-4" />}
          >
            Enroll Student
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-card border border-border bg-surface shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">
              {stats.total} <span className="text-sm font-normal text-text-muted">/ {stats.capacity}</span>
            </div>
            <div className="text-xs text-text-muted">Total Enrolled</div>
          </div>
        </div>

        <div className="p-4 rounded-card border border-border bg-surface shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">{stats.attended}</div>
            <div className="text-xs text-text-muted">Attended</div>
          </div>
        </div>

        <div className="p-4 rounded-card border border-border bg-surface shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">{stats.pending}</div>
            <div className="text-xs text-text-muted">Pending Attendance</div>
          </div>
        </div>

        <div className="p-4 rounded-card border border-border bg-surface shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">{stats.remaining}</div>
            <div className="text-xs text-text-muted">Spots Available</div>
          </div>
        </div>
      </div>

      {/* Main Registrations Table */}
      <DataTable
        data={filteredData}
        columns={columns}
        keyField={(item) => item.registration.id}
        searchPlaceholder="Search attendees by name, roll number, or email..."
        searchFilter={(item, q) => {
          const s = item.student
          if (!s) return false
          return (
            s.name.toLowerCase().includes(q) ||
            s.rollNo.toLowerCase().includes(q) ||
            s.email.toLowerCase().includes(q) ||
            s.department.toLowerCase().includes(q)
          )
        }}
        filters={[
          {
            key: 'attendance',
            label: 'Attendance',
            value: attendanceFilter,
            onChange: setAttendanceFilter,
            options: [
              { label: 'Attended', value: 'attended' },
              { label: 'Pending / Absent', value: 'pending' },
            ],
          },
        ]}
        rowActions={(item) => [
          {
            label: item.registration.attended ? 'Mark as Absent' : 'Mark as Attended',
            icon: <Check className="w-4 h-4" />,
            onClick: () => handleToggleAttendance(item),
          },
          {
            label: 'Remove Registration',
            icon: <Trash2 className="w-4 h-4" />,
            variant: 'danger',
            onClick: () => setRegistrationToDelete(item),
          },
        ]}
        emptyState={{
          title: 'No registrations found',
          message: 'No students have enrolled in this event yet.',
          actionLabel: 'Enroll Student',
          onAction: () => setIsEnrollModalOpen(true),
        }}
      />

      {/* Delete / Cancel Registration Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(registrationToDelete)}
        onClose={() => setRegistrationToDelete(null)}
        onConfirm={handleConfirmRemoveRegistration}
        title="Cancel Student Registration?"
        itemName={registrationToDelete?.student?.name}
        message={`Are you sure you want to cancel ${registrationToDelete?.student?.name || 'this student'}'s registration? This will free up 1 spot for other attendees.`}
        confirmText="Remove Registration"
        isLoading={isDeleting}
      />

      {/* Manual Enroll Modal */}
      <Modal
        isOpen={isEnrollModalOpen}
        onClose={() => setIsEnrollModalOpen(false)}
        title="Enroll Student in Event"
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2.5 w-full">
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsEnrollModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleEnrollStudent}
              disabled={!selectedStudentId}
            >
              Confirm Enrollment
            </Button>
          </div>
        }
      >
        <div className="space-y-4 pt-1">
          <p className="text-caption text-text-secondary leading-relaxed">
            Select a student from the active directory to manually enroll them in this event.
          </p>

          <SearchableSelect
            label="Select Student"
            value={selectedStudentId}
            onChange={setSelectedStudentId}
            options={availableStudentsForEnroll}
            placeholder="Search student by name or roll number..."
            helperText={`${availableStudentsForEnroll.length} eligible students not yet registered.`}
            required
          />

          {stats.remaining <= 0 && (
            <div className="p-3 rounded-card bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200">
              Note: This event has reached capacity ({stats.capacity} seats). Enrolling will exceed the normal limit.
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}
