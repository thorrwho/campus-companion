import React, { useState, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Download,
  UserPlus,
  Users,
  Building2,
  Trash2,
  GraduationCap,
} from 'lucide-react'
import { useContentStore } from '@/store/useContentStore'
import { useActivityLogStore } from '@/store/useActivityLogStore'
import { useToastStore } from '@/store/useToastStore'
import { useAdminAuthStore } from '@/store/useAdminAuthStore'
import { Student } from '@/types'
import {
  DataTable,
  DataTableColumn,
  ConfirmDialog,
  StatusBadge,
} from '@/components/admin'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Avatar } from '@/components/ui/Avatar'
import { SearchableSelect } from '@/components/admin/form/SearchableSelect'
import { CURATED_ICONS } from '@/components/admin/form/IconPicker'

export const ClubMembersPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const {
    clubs,
    students,
    departments,
    updateItem,
  } = useContentStore()

  const { adminUser } = useAdminAuthStore()
  const { addActivity } = useActivityLogStore()
  const { push: pushToast } = useToastStore()

  // Modals & Selection States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedStudentId, setSelectedStudentId] = useState('')
  const [memberToRemove, setMemberToRemove] = useState<Student | null>(null)
  const [bulkMembersToRemove, setBulkMembersToRemove] = useState<Student[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  // Filters
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [semesterFilter, setSemesterFilter] = useState('all')

  // Current Club
  const currentClub = useMemo(() => {
    return clubs.find((c) => c.id === id) || null
  }, [clubs, id])

  // Enrolled Students
  const enrolledStudents = useMemo(() => {
    if (!currentClub) return []
    return students.filter((s) => s.joinedClubIds?.includes(currentClub.id))
  }, [students, currentClub])

  // Overview Metrics
  const stats = useMemo(() => {
    const total = enrolledStudents.length
    const active = enrolledStudents.filter((s) => s.status !== 'Suspended').length
    const deptSet = new Set(enrolledStudents.map((s) => s.department))
    return {
      total,
      active,
      departmentsCount: deptSet.size,
    }
  }, [enrolledStudents])

  // Available students to add (not yet enrolled, not suspended)
  const availableStudentsToAdd = useMemo(() => {
    if (!currentClub) return []
    const enrolledIds = new Set(enrolledStudents.map((s) => s.id))
    return students
      .filter((s) => !enrolledIds.has(s.id) && s.status !== 'Suspended')
      .map((s) => ({
        value: s.id,
        label: `${s.name} (${s.rollNo})`,
        sublabel: `${s.department} Sem ${s.semester} - ${s.email}`,
      }))
  }, [students, currentClub, enrolledStudents])

  // Filtered enrolled students for table
  const filteredStudents = useMemo(() => {
    return enrolledStudents.filter((student) => {
      if (departmentFilter !== 'all' && student.department !== departmentFilter) {
        return false
      }
      if (semesterFilter !== 'all' && student.semester.toString() !== semesterFilter) {
        return false
      }
      return true
    })
  }, [enrolledStudents, departmentFilter, semesterFilter])

  // Single Member Removal
  const handleConfirmRemoveMember = () => {
    if (!memberToRemove || !currentClub) return
    setIsProcessing(true)
    try {
      // 1. Remove club ID from student
      const updatedJoined = (memberToRemove.joinedClubIds || []).filter((cId) => cId !== currentClub.id)
      updateItem('students', memberToRemove.id, { joinedClubIds: updatedJoined }, adminUser?.email)

      // 2. Decrement club memberCount
      const newCount = Math.max(0, (currentClub.memberCount || 1) - 1)
      updateItem('clubs', currentClub.id, { memberCount: newCount }, adminUser?.email)

      addActivity({
        userEmail: adminUser?.email || 'admin@demo.edu',
        userName: adminUser?.name || 'Administrator',
        action: 'update',
        itemType: 'club',
        itemId: currentClub.id,
        itemName: currentClub.name,
        summary: `Removed ${memberToRemove.name} from club "${currentClub.name}"`,
      })

      pushToast({
        type: 'success',
        message: `Removed ${memberToRemove.name} from ${currentClub.name}.`,
      })
      setMemberToRemove(null)
    } finally {
      setIsProcessing(false)
    }
  }

  // Bulk Member Removal
  const handleConfirmBulkRemove = () => {
    if (bulkMembersToRemove.length === 0 || !currentClub) return
    setIsProcessing(true)
    try {
      bulkMembersToRemove.forEach((student) => {
        const updatedJoined = (student.joinedClubIds || []).filter((cId) => cId !== currentClub.id)
        updateItem('students', student.id, { joinedClubIds: updatedJoined }, adminUser?.email)
      })

      const newCount = Math.max(0, (currentClub.memberCount || bulkMembersToRemove.length) - bulkMembersToRemove.length)
      updateItem('clubs', currentClub.id, { memberCount: newCount }, adminUser?.email)

      addActivity({
        userEmail: adminUser?.email || 'admin@demo.edu',
        userName: adminUser?.name || 'Administrator',
        action: 'update',
        itemType: 'club',
        itemId: currentClub.id,
        itemName: currentClub.name,
        summary: `Bulk removed ${bulkMembersToRemove.length} members from club "${currentClub.name}"`,
      })

      pushToast({
        type: 'success',
        message: `Removed ${bulkMembersToRemove.length} students from ${currentClub.name}.`,
      })
      setBulkMembersToRemove([])
    } finally {
      setIsProcessing(false)
    }
  }

  // Add Member
  const handleAddMember = () => {
    if (!selectedStudentId || !currentClub) return
    const student = students.find((s) => s.id === selectedStudentId)
    if (!student) return

    const existingJoined = student.joinedClubIds || []
    if (existingJoined.includes(currentClub.id)) {
      pushToast({ type: 'warning', message: 'Student is already a member.' })
      return
    }

    const updatedJoined = [...existingJoined, currentClub.id]
    updateItem('students', student.id, { joinedClubIds: updatedJoined }, adminUser?.email)

    const newCount = (currentClub.memberCount || 0) + 1
    updateItem('clubs', currentClub.id, { memberCount: newCount }, adminUser?.email)

    addActivity({
      userEmail: adminUser?.email || 'admin@demo.edu',
      userName: adminUser?.name || 'Administrator',
      action: 'update',
      itemType: 'club',
      itemId: currentClub.id,
      itemName: currentClub.name,
      summary: `Enrolled student ${student.name} in club "${currentClub.name}"`,
    })

    pushToast({
      type: 'success',
      message: `Enrolled ${student.name} in ${currentClub.name}.`,
    })

    setSelectedStudentId('')
    setIsAddModalOpen(false)
  }

  // Export CSV
  const handleExportCSV = () => {
    if (!currentClub || enrolledStudents.length === 0) {
      pushToast({ type: 'warning', message: 'No club members to export.' })
      return
    }

    const headers = ['Name', 'Roll Number', 'Email', 'Department', 'Semester', 'Status']
    const rows = enrolledStudents.map((s) => [
      `"${s.name.replace(/"/g, '""')}"`,
      `"${s.rollNo}"`,
      `"${s.email}"`,
      `"${s.department}"`,
      `"Semester ${s.semester}"`,
      `"${s.status || 'Active'}"`,
    ])

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const safeName = currentClub.name.toLowerCase().replace(/[^a-z0-9]/g, '-')
    link.setAttribute('href', url)
    link.setAttribute('download', `club-${safeName}-members.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    pushToast({
      type: 'success',
      message: `Exported ${enrolledStudents.length} members to CSV.`,
    })
  }

  // Table Columns
  const columns: DataTableColumn<Student>[] = [
    {
      key: 'student',
      header: 'Student',
      sortable: true,
      sortValue: (item) => item.name,
      render: (item) => (
        <div className="flex items-center gap-3 py-1">
          <Avatar
            initials={item.avatarInitials || item.name.slice(0, 2).toUpperCase()}
            name={item.name}
            size="sm"
          />
          <div className="space-y-0.5">
            <div className="font-semibold text-text-primary text-sm">
              {item.name}
            </div>
            <div className="text-xs text-text-muted">
              {item.email}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'rollNo',
      header: 'Roll No',
      sortable: true,
      sortValue: (item) => item.rollNo,
      render: (item) => (
        <span className="font-mono text-xs font-medium text-text-secondary">
          {item.rollNo}
        </span>
      ),
    },
    {
      key: 'department',
      header: 'Department & Semester',
      sortable: true,
      sortValue: (item) => `${item.department}-${item.semester}`,
      render: (item) => (
        <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
          <span className="font-semibold text-text-primary">{item.department}</span>
          <span>Semester {item.semester}</span>
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Account Status',
      sortable: true,
      sortValue: (item) => item.status || 'Active',
      render: (item) => (
        <StatusBadge status={item.status === 'Suspended' ? 'Archived' : 'Published'} />
      ),
    },
  ]

  if (!currentClub) {
    return (
      <div className="space-y-4 text-left py-12 text-center">
        <h2 className="text-xl font-bold text-text-primary">Club Not Found</h2>
        <p className="text-caption text-text-secondary">
          The requested club could not be found or has been removed.
        </p>
        <Button variant="primary" size="md" onClick={() => navigate('/admin/clubs')}>
          Back to Clubs
        </Button>
      </div>
    )
  }

  const IconComponent = currentClub.icon && CURATED_ICONS[currentClub.icon] ? CURATED_ICONS[currentClub.icon] : Users
  const clubColor = currentClub.color || '#2563eb'

  return (
    <div className="space-y-6 text-left pb-12">
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            to="/admin/clubs"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Clubs
          </Link>
          <div className="flex items-center gap-3 pt-1">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border border-black/5"
              style={{ backgroundColor: `${clubColor}18`, color: clubColor }}
            >
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-text-primary">
                  {currentClub.name}
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider bg-canvas border border-border text-text-secondary">
                  {currentClub.category}
                </span>
                <StatusBadge status={currentClub.status === 'Inactive' ? 'Archived' : 'Published'} />
              </div>
              <p className="text-caption text-text-secondary">
                Roster of enrolled students and active participants.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            onClick={handleExportCSV}
            disabled={enrolledStudents.length === 0}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-text-secondary" />
            <span>Export CSV</span>
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Member</span>
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-card border border-border bg-surface shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-950/40 text-primary-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">{stats.total}</div>
            <div className="text-xs text-text-muted">Total Enrolled Members</div>
          </div>
        </div>

        <div className="p-4 rounded-card border border-border bg-surface shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">{stats.active}</div>
            <div className="text-xs text-text-muted">Active Student Accounts</div>
          </div>
        </div>

        <div className="p-4 rounded-card border border-border bg-surface shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">{stats.departmentsCount}</div>
            <div className="text-xs text-text-muted">Departments Represented</div>
          </div>
        </div>
      </div>

      {/* Main Members Table */}
      <DataTable
        data={filteredStudents}
        columns={columns}
        keyField="id"
        searchPlaceholder="Search members by name, roll number, or email..."
        searchFilter={(item, q) =>
          Boolean(
            item.name.toLowerCase().includes(q) ||
            item.rollNo.toLowerCase().includes(q) ||
            item.email.toLowerCase().includes(q) ||
            item.department.toLowerCase().includes(q)
          )
        }
        filters={[
          {
            key: 'department',
            label: 'Department',
            value: departmentFilter,
            onChange: setDepartmentFilter,
            options: [
              { label: 'All Departments', value: 'all' },
              ...departments.map((d) => ({
                label: `${d.code} (${d.name})`,
                value: d.code,
              })),
            ],
          },
          {
            key: 'semester',
            label: 'Semester',
            value: semesterFilter,
            onChange: setSemesterFilter,
            options: [
              { label: 'All Semesters', value: 'all' },
              ...[1, 2, 3, 4, 5, 6, 7, 8].map((s) => ({
                label: `Semester ${s}`,
                value: s.toString(),
              })),
            ],
          },
        ]}
        bulkActions={[
          {
            label: 'Remove Selected Members',
            icon: <Trash2 className="w-4 h-4" />,
            variant: 'danger',
            onClick: (items) => setBulkMembersToRemove(items),
          },
        ]}
        rowActions={(item) => [
          {
            label: 'Remove from Club',
            icon: <Trash2 className="w-4 h-4" />,
            variant: 'danger',
            onClick: () => setMemberToRemove(item),
          },
        ]}
        emptyState={{
          title: 'No members in this club yet',
          message: 'Enroll your first student member or wait for students to join from the campus portal.',
          actionLabel: 'Add Member',
          onAction: () => setIsAddModalOpen(true),
        }}
      />

      {/* Single Remove Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(memberToRemove)}
        onClose={() => setMemberToRemove(null)}
        onConfirm={handleConfirmRemoveMember}
        title="Remove Member from Club"
        itemName={memberToRemove?.name}
        message={`Are you sure you want to remove ${memberToRemove?.name || 'this student'} from "${currentClub.name}"? They can re-join later if membership remains open.`}
        confirmText="Remove Member"
        isLoading={isProcessing}
      />

      {/* Bulk Remove Confirmation Dialog */}
      <ConfirmDialog
        isOpen={bulkMembersToRemove.length > 0}
        onClose={() => setBulkMembersToRemove([])}
        onConfirm={handleConfirmBulkRemove}
        title="Remove Selected Members"
        itemCount={bulkMembersToRemove.length}
        message={`Are you sure you want to remove ${bulkMembersToRemove.length} students from "${currentClub.name}"?`}
        confirmText={`Remove ${bulkMembersToRemove.length} Members`}
        isLoading={isProcessing}
      />

      {/* Add Member Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Enroll Student in Club"
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2.5 w-full">
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleAddMember}
              disabled={!selectedStudentId}
            >
              Add Member
            </Button>
          </div>
        }
      >
        <div className="space-y-4 pt-1 text-left">
          <p className="text-caption text-text-secondary leading-relaxed">
            Select an active student to add to &quot;{currentClub.name}&quot;. They will immediately gain access to club member activities and announcements.
          </p>

          <SearchableSelect
            label="Select Student"
            value={selectedStudentId}
            onChange={setSelectedStudentId}
            options={availableStudentsToAdd}
            placeholder="Search student by name or roll number..."
            helperText={`${availableStudentsToAdd.length} eligible students not currently in this club.`}
            required
          />
        </div>
      </Modal>
    </div>
  )
}
