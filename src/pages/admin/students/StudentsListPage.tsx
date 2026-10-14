import React, { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Users,
  UserPlus,
  Download,
  Building2,
  Mail,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Edit,
  ExternalLink,
  Copy,
  Check,
  Calendar,
} from 'lucide-react'
import { useContentStore } from '@/store/useContentStore'
import { useActivityLogStore } from '@/store/useActivityLogStore'
import { useToastStore } from '@/store/useToastStore'
import { useAdminAuthStore } from '@/store/useAdminAuthStore'
import { Student, DepartmentCode } from '@/types'
import {
  DataTable,
  DataTableColumn,
  DataTableFilter,
  ConfirmDialog,
  TextField,
  SelectField,
} from '@/components/admin'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'

interface NewStudentForm {
  name: string
  email: string
  rollNo: string
  department: DepartmentCode
  semester: number
  section: string
  password: string
  status: 'Active' | 'Suspended'
}

const INITIAL_STUDENT_FORM: NewStudentForm = {
  name: '',
  email: '',
  rollNo: '',
  department: 'CSE-AIML',
  semester: 5,
  section: 'A',
  password: 'Student@1234',
  status: 'Active',
}

export const StudentsListPage: React.FC = () => {
  const navigate = useNavigate()
  const {
    students,
    departments,
    eventRegistrations,
    createItem,
    updateItem,
    removeItem,
    bulkRemove,
  } = useContentStore()

  const { adminUser } = useAdminAuthStore()
  const { addActivity } = useActivityLogStore()
  const { push: pushToast } = useToastStore()

  // Filter states
  const [deptFilter, setDeptFilter] = useState<string>('all')
  const [semFilter, setSemFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [studentForm, setStudentForm] = useState<NewStudentForm>(INITIAL_STUDENT_FORM)
  const [createdCredentials, setCreatedCredentials] = useState<{
    name: string
    email: string
    rollNo: string
    password: string
  } | null>(null)
  const [hasCopiedCreds, setHasCopiedCreds] = useState(false)

  // Single delete
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null)

  // Bulk actions state
  const [bulkActionType, setBulkActionType] = useState<'suspend' | 'reactivate' | 'delete' | null>(null)
  const [selectedBulkStudents, setSelectedBulkStudents] = useState<Student[]>([])

  // Quick edit dept/sem modal
  const [editingStudentDeptSem, setEditingStudentDeptSem] = useState<Student | null>(null)
  const [quickDept, setQuickDept] = useState<DepartmentCode>('CSE')
  const [quickSem, setQuickSem] = useState<number>(1)

  // Filter options for DataTable
  const filters: DataTableFilter[] = [
    {
      key: 'department',
      label: 'Department',
      value: deptFilter,
      onChange: setDeptFilter,
      options: [
        { label: 'All Departments', value: 'all' },
        ...departments.map((d) => ({ label: `${d.name} (${d.code})`, value: d.code })),
      ],
    },
    {
      key: 'semester',
      label: 'Semester',
      value: semFilter,
      onChange: setSemFilter,
      options: [
        { label: 'All Semesters', value: 'all' },
        ...Array.from({ length: 8 }, (_, i) => ({
          label: `Semester ${i + 1}`,
          value: String(i + 1),
        })),
      ],
    },
    {
      key: 'status',
      label: 'Account Status',
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { label: 'All Statuses', value: 'all' },
        { label: 'Active', value: 'Active' },
        { label: 'Suspended', value: 'Suspended' },
      ],
    },
  ]

  // Filtered dataset
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      if (deptFilter !== 'all' && s.department !== deptFilter) return false
      if (semFilter !== 'all' && String(s.semester) !== semFilter) return false
      if (statusFilter !== 'all' && s.status !== statusFilter) return false
      return true
    })
  }, [students, deptFilter, semFilter, statusFilter])

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = students.length
    const active = students.filter((s) => s.status !== 'Suspended').length
    const suspended = students.filter((s) => s.status === 'Suspended').length
    const deptsCount = new Set(students.map((s) => s.department)).size
    return { total, active, suspended, deptsCount }
  }, [students])

  // Generate initials
  const getInitials = (name: string): string => {
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  // Handle Add Student
  const handleCreateStudent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentForm.name.trim() || !studentForm.email.trim() || !studentForm.rollNo.trim()) {
      pushToast({
        type: 'error',
        message: 'Name, email, and roll number are required fields.',
      })
      return
    }

    // Check rollNo uniqueness
    const cleanRollNo = studentForm.rollNo.trim().toUpperCase()
    if (students.some((s) => s.rollNo.toUpperCase() === cleanRollNo)) {
      pushToast({
        type: 'error',
        message: `Roll number "${cleanRollNo}" is already assigned to another student.`,
      })
      return
    }

    const initials = getInitials(studentForm.name)
    const newStudent = createItem(
      'students',
      {
        name: studentForm.name.trim(),
        email: studentForm.email.trim().toLowerCase(),
        rollNo: cleanRollNo,
        department: studentForm.department,
        semester: Number(studentForm.semester),
        section: studentForm.section.trim() || 'A',
        avatarInitials: initials,
        status: studentForm.status,
        role: 'student',
        joinedAt: new Date().toISOString(),
        registeredEventIds: [],
        joinedClubIds: [],
        savedLocationIds: [],
      },
      adminUser?.email
    )

    addActivity({
      userEmail: adminUser?.email || 'admin@demo.edu',
      userName: adminUser?.name || 'Administrator',
      action: 'create',
      itemType: 'student',
      itemId: newStudent.id,
      itemName: `${newStudent.name} (${newStudent.rollNo})`,
      summary: `Created student record in ${newStudent.department} Semester ${newStudent.semester}`,
    })

    pushToast({
      type: 'success',
      message: `Enrolled student ${newStudent.name} (${newStudent.rollNo}).`,
    })

    // Store credentials for one-time display modal
    setCreatedCredentials({
      name: newStudent.name,
      email: newStudent.email,
      rollNo: newStudent.rollNo,
      password: studentForm.password,
    })

    setIsAddModalOpen(false)
    setStudentForm(INITIAL_STUDENT_FORM)
  }

  // Copy credentials to clipboard
  const handleCopyCredentials = () => {
    if (!createdCredentials) return
    const text = `Campus Companion Student Credentials\nName: ${createdCredentials.name}\nEmail: ${createdCredentials.email}\nRoll Number: ${createdCredentials.rollNo}\nTemporary Password: ${createdCredentials.password}`
    navigator.clipboard.writeText(text)
    setHasCopiedCreds(true)
    setTimeout(() => setHasCopiedCreds(false), 2000)
    pushToast({
      type: 'info',
      message: 'Credentials copied to clipboard.',
    })
  }

  // Toggle Single Student Suspension
  const handleToggleSuspend = (student: Student) => {
    const isCurrentlySuspended = student.status === 'Suspended'
    const newStatus = isCurrentlySuspended ? 'Active' : 'Suspended'

    updateItem(
      'students',
      student.id,
      { status: newStatus },
      adminUser?.email
    )

    addActivity({
      userEmail: adminUser?.email || 'admin@demo.edu',
      userName: adminUser?.name || 'Administrator',
      action: isCurrentlySuspended ? 'reactivate' : 'suspend',
      itemType: 'student',
      itemId: student.id,
      itemName: `${student.name} (${student.rollNo})`,
      summary: isCurrentlySuspended
        ? 'Reactivated student account access'
        : 'Suspended student account access (login restricted)',
    })

    pushToast({
      type: isCurrentlySuspended ? 'success' : 'info',
      message: `${student.name} is now ${newStatus.toLowerCase()}.`,
    })
  }

  // Handle Single Delete Student
  const handleDeleteStudent = () => {
    if (!studentToDelete) return

    removeItem('students', studentToDelete.id)

    addActivity({
      userEmail: adminUser?.email || 'admin@demo.edu',
      userName: adminUser?.name || 'Administrator',
      action: 'delete',
      itemType: 'student',
      itemId: studentToDelete.id,
      itemName: `${studentToDelete.name} (${studentToDelete.rollNo})`,
      summary: `Permanently removed student profile and unlinked registrations`,
    })

    pushToast({
      type: 'info',
      message: `Deleted student ${studentToDelete.name}.`,
    })

    setStudentToDelete(null)
  }

  // Handle Quick Save Dept & Sem
  const handleSaveQuickDeptSem = () => {
    if (!editingStudentDeptSem) return

    updateItem(
      'students',
      editingStudentDeptSem.id,
      {
        department: quickDept,
        semester: quickSem,
      },
      adminUser?.email
    )

    addActivity({
      userEmail: adminUser?.email || 'admin@demo.edu',
      userName: adminUser?.name || 'Administrator',
      action: 'update',
      itemType: 'student',
      itemId: editingStudentDeptSem.id,
      itemName: `${editingStudentDeptSem.name} (${editingStudentDeptSem.rollNo})`,
      summary: `Updated department to ${quickDept} and semester to Sem ${quickSem}`,
    })

    pushToast({
      type: 'success',
      message: `Updated academic record for ${editingStudentDeptSem.name}.`,
    })

    setEditingStudentDeptSem(null)
  }

  // Handle Bulk Suspend / Reactivate / Delete
  const handleExecuteBulkAction = () => {
    if (selectedBulkStudents.length === 0 || !bulkActionType) return

    if (bulkActionType === 'delete') {
      const ids = selectedBulkStudents.map((s) => s.id)
      bulkRemove('students', ids)

      addActivity({
        userEmail: adminUser?.email || 'admin@demo.edu',
        userName: adminUser?.name || 'Administrator',
        action: 'bulk_delete',
        itemType: 'student',
        itemId: `bulk-student-${Date.now()}`,
        itemName: `${ids.length} students`,
        summary: `Bulk deleted ${ids.length} student records and unlinked registrations`,
      })

      pushToast({
        type: 'info',
        message: `Deleted ${ids.length} students.`,
      })
    } else {
      const newStatus = bulkActionType === 'suspend' ? 'Suspended' : 'Active'
      selectedBulkStudents.forEach((student) => {
        updateItem(
          'students',
          student.id,
          { status: newStatus },
          adminUser?.email
        )
      })

      addActivity({
        userEmail: adminUser?.email || 'admin@demo.edu',
        userName: adminUser?.name || 'Administrator',
        action: bulkActionType === 'suspend' ? 'suspend' : 'reactivate',
        itemType: 'student',
        itemId: `bulk-student-${Date.now()}`,
        itemName: `${selectedBulkStudents.length} students`,
        summary: `Bulk ${bulkActionType}ed ${selectedBulkStudents.length} student accounts`,
      })

      pushToast({
        type: 'success',
        message: `${bulkActionType === 'suspend' ? 'Suspended' : 'Reactivated'} ${selectedBulkStudents.length} student accounts.`,
      })
    }

    setBulkActionType(null)
    setSelectedBulkStudents([])
  }

  // Export CSV
  const handleExportCSV = () => {
    const headers = [
      'Name',
      'Roll Number',
      'Email',
      'Department',
      'Semester',
      'Status',
      'Joined Clubs',
      'Registered Events',
      'Date Enrolled',
    ]

    const rows = filteredStudents.map((s) => {
      const clubsCount = s.joinedClubIds?.length || 0
      const eventsCount = eventRegistrations.filter((r) => r.studentId === s.id).length
      const joinedStr = s.joinedAt ? s.joinedAt.slice(0, 10) : 'N/A'
      return [
        `"${s.name.replace(/"/g, '""')}"`,
        `"${s.rollNo}"`,
        `"${s.email}"`,
        `"${s.department}"`,
        `"${s.semester}"`,
        `"${s.status || 'Active'}"`,
        clubsCount,
        eventsCount,
        `"${joinedStr}"`,
      ].join(',')
    })

    const csvContent = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `students_registry_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    addActivity({
      userEmail: adminUser?.email || 'admin@demo.edu',
      userName: adminUser?.name || 'Administrator',
      action: 'update',
      itemType: 'student',
      itemId: `export-${Date.now()}`,
      itemName: 'Students Registry',
      summary: `Exported ${filteredStudents.length} students to CSV`,
    })

    pushToast({
      type: 'success',
      message: `Exported ${filteredStudents.length} student records to CSV.`,
    })
  }

  // DataTable Columns
  const columns: DataTableColumn<Student>[] = [
    {
      key: 'student',
      header: 'Student',
      sortable: true,
      sortValue: (s: Student) => s.name,
      render: (s: Student) => (
        <div className="flex items-center gap-3">
          <Avatar
            initials={s.avatarInitials || getInitials(s.name)}
            size="md"
            className="shrink-0 font-bold"
          />
          <div>
            <Link
              to={`/admin/students/${s.id}`}
              className="font-semibold text-text-primary hover:text-primary-600 transition-colors"
            >
              {s.name}
            </Link>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="font-mono text-xs text-text-muted">{s.rollNo}</span>
              {s.section && (
                <span className="text-[11px] text-text-secondary bg-surface-secondary px-1.5 py-0.2 rounded border border-border">
                  Sec {s.section}
                </span>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email Address',
      sortable: true,
      sortValue: (s: Student) => s.email,
      render: (s: Student) => (
        <div className="flex items-center gap-1.5 text-xs text-text-secondary font-mono">
          <Mail className="w-3.5 h-3.5 text-text-muted shrink-0" aria-hidden="true" />
          <span className="truncate max-w-[180px]">{s.email}</span>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      sortable: true,
      sortValue: (s: Student) => s.department,
      render: (s: Student) => (
        <span className="inline-block px-2 py-0.5 rounded bg-surface-secondary text-xs font-semibold text-text-primary border border-border">
          {s.department}
        </span>
      ),
    },
    {
      key: 'semester',
      header: 'Semester',
      sortable: true,
      sortValue: (s: Student) => s.semester,
      render: (s: Student) => (
        <Badge variant="neutral">Sem {s.semester}</Badge>
      ),
    },
    {
      key: 'clubs',
      header: 'Clubs',
      sortable: true,
      sortValue: (s: Student) => s.joinedClubIds?.length || 0,
      render: (s: Student) => {
        const count = s.joinedClubIds?.length || 0
        return (
          <span className="text-xs font-medium text-text-secondary">
            {count} {count === 1 ? 'club' : 'clubs'}
          </span>
        )
      },
    },
    {
      key: 'events',
      header: 'Registrations',
      sortable: true,
      sortValue: (s: Student) => {
        return eventRegistrations.filter((r) => r.studentId === s.id).length
      },
      render: (s: Student) => {
        const count = eventRegistrations.filter((r) => r.studentId === s.id).length
        return (
          <span className="text-xs font-medium text-text-secondary">
            {count} {count === 1 ? 'event' : 'events'}
          </span>
        )
      },
    },
    {
      key: 'status',
      header: 'Account Status',
      sortable: true,
      sortValue: (s: Student) => s.status || 'Active',
      render: (s: Student) => {
        const isSuspended = s.status === 'Suspended'
        return (
          <Badge variant={isSuspended ? 'error' : 'success'} dot>
            {isSuspended ? 'Suspended' : 'Active'}
          </Badge>
        )
      },
    },
    {
      key: 'joinedAt',
      header: 'Enrolled Date',
      sortable: true,
      sortValue: (s: Student) => s.joinedAt || '',
      render: (s: Student) => (
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{s.joinedAt ? s.joinedAt.slice(0, 10) : 'Initial Seed'}</span>
        </div>
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
              Students Registry
            </h1>
            <Badge variant="primary">Campus Directory</Badge>
          </div>
          <p className="text-small text-text-secondary mt-1">
            Enrolled student profiles, academic branch assignments, account authorization, and event records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportCSV}
            className="gap-2"
          >
            <Download className="w-4 h-4 text-text-muted" aria-hidden="true" />
            <span>Export CSV</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setStudentForm(INITIAL_STUDENT_FORM)
              setIsAddModalOpen(true)
            }}
            className="gap-2"
          >
            <UserPlus className="w-4 h-4" aria-hidden="true" />
            <span>Add Student</span>
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
            <div className="text-caption text-text-muted font-medium">Total Students</div>
            <div className="text-h3 font-bold text-text-primary">{metrics.total}</div>
          </div>
        </div>

        <div className="bg-surface p-3.5 rounded-card border border-border shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="text-caption text-text-muted font-medium">Active Accounts</div>
            <div className="text-h3 font-bold text-emerald-700">{metrics.active}</div>
          </div>
        </div>

        <div className="bg-surface p-3.5 rounded-card border border-border shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-50 text-status-error flex items-center justify-center shrink-0">
            <ShieldAlert className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="text-caption text-text-muted font-medium">Suspended</div>
            <div className="text-h3 font-bold text-status-error">{metrics.suspended}</div>
          </div>
        </div>

        <div className="bg-surface p-3.5 rounded-card border border-border shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="text-caption text-text-muted font-medium">Departments</div>
            <div className="text-h3 font-bold text-text-primary">{metrics.deptsCount} branches</div>
          </div>
        </div>
      </div>

      {/* Main Students DataTable */}
      <DataTable<Student>
        data={filteredStudents}
        columns={columns}
        keyField="id"
        searchPlaceholder="Search students by name, roll number, or email..."
        searchFilter={(s, q) =>
          s.name.toLowerCase().includes(q) ||
          s.rollNo.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.department.toLowerCase().includes(q)
        }
        filters={filters}
        onRowClick={(s) => navigate(`/admin/students/${s.id}`)}
        bulkActions={[
          {
            label: 'Suspend Selected',
            variant: 'secondary',
            onClick: (selected) => {
              setSelectedBulkStudents(selected)
              setBulkActionType('suspend')
            },
          },
          {
            label: 'Reactivate Selected',
            variant: 'secondary',
            onClick: (selected) => {
              setSelectedBulkStudents(selected)
              setBulkActionType('reactivate')
            },
          },
          {
            label: 'Delete Selected',
            variant: 'danger',
            onClick: (selected) => {
              setSelectedBulkStudents(selected)
              setBulkActionType('delete')
            },
          },
        ]}
        rowActions={(s) => [
          {
            label: 'View Student Profile',
            icon: <ExternalLink className="w-4 h-4" aria-hidden="true" />,
            onClick: () => navigate(`/admin/students/${s.id}`),
          },
          {
            label: 'Quick Edit Branch/Sem',
            icon: <Edit className="w-4 h-4" aria-hidden="true" />,
            onClick: () => {
              setEditingStudentDeptSem(s)
              setQuickDept(s.department)
              setQuickSem(s.semester)
            },
          },
          {
            label: s.status === 'Suspended' ? 'Reactivate Student' : 'Suspend Student',
            icon: s.status === 'Suspended' ? (
              <ShieldCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-amber-600" aria-hidden="true" />
            ),
            onClick: () => handleToggleSuspend(s),
          },
          {
            label: 'Delete Student',
            icon: <Trash2 className="w-4 h-4 text-status-error" aria-hidden="true" />,
            variant: 'danger',
            onClick: () => setStudentToDelete(s),
          },
        ]}
        emptyState={{
          title: 'No student accounts found',
          message: 'Try adjusting your department or semester filters, or enroll a new student.',
          actionLabel: 'Enroll New Student',
          onAction: () => {
            setStudentForm(INITIAL_STUDENT_FORM)
            setIsAddModalOpen(true)
          },
        }}
      />

      {/* ========================================================================= */}
      {/* Add Student Modal                                                         */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Enroll New Student"
        description="Register a student account manually. Credentials can be copied upon creation."
        maxWidth="lg"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsAddModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleCreateStudent}
            >
              Enroll Student
            </Button>
          </div>
        }
      >
        <form onSubmit={handleCreateStudent} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TextField
              label="Full Name"
              name="name"
              required
              placeholder="e.g. Maya Patel"
              value={studentForm.name}
              onChange={(e) => setStudentForm((prev) => ({ ...prev, name: e.target.value }))}
            />

            <TextField
              label="Roll Number"
              name="rollNo"
              required
              placeholder="e.g. 23CS105"
              value={studentForm.rollNo}
              onChange={(e) => setStudentForm((prev) => ({ ...prev, rollNo: e.target.value }))}
              helperText="Unique university roll identifier"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TextField
              label="Email Address"
              name="email"
              type="email"
              required
              placeholder="e.g. maya.patel@demo.edu"
              value={studentForm.email}
              onChange={(e) => setStudentForm((prev) => ({ ...prev, email: e.target.value }))}
            />

            <TextField
              label="Initial Password"
              name="password"
              required
              placeholder="e.g. Student@1234"
              value={studentForm.password}
              onChange={(e) => setStudentForm((prev) => ({ ...prev, password: e.target.value }))}
              helperText="Shared with the student on creation"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <SelectField
              label="Academic Department"
              name="department"
              required
              value={studentForm.department}
              onChange={(e) => setStudentForm((prev) => ({ ...prev, department: e.target.value as DepartmentCode }))}
              options={departments.map((d) => ({
                value: d.code,
                label: `${d.name} (${d.code})`,
              }))}
            />

            <SelectField
              label="Current Semester"
              name="semester"
              required
              value={String(studentForm.semester)}
              onChange={(e) => setStudentForm((prev) => ({ ...prev, semester: parseInt(e.target.value, 10) }))}
              options={Array.from({ length: 8 }, (_, i) => ({
                value: String(i + 1),
                label: `Semester ${i + 1}`,
              }))}
            />

            <TextField
              label="Class Section"
              name="section"
              placeholder="e.g. A"
              value={studentForm.section}
              onChange={(e) => setStudentForm((prev) => ({ ...prev, section: e.target.value }))}
            />
          </div>

          <div>
            <SelectField
              label="Account Authorization"
              name="status"
              required
              value={studentForm.status}
              onChange={(e) => setStudentForm((prev) => ({ ...prev, status: e.target.value as 'Active' | 'Suspended' }))}
              options={[
                { value: 'Active', label: 'Active - Full app access enabled' },
                { value: 'Suspended', label: 'Suspended - Login restricted' },
              ]}
            />
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* Generated Credentials Modal (Shown Once)                                  */}
      {/* ========================================================================= */}
      <Modal
        isOpen={Boolean(createdCredentials)}
        onClose={() => setCreatedCredentials(null)}
        title="Student Credentials Generated"
        description="Share these login credentials with the student. Note: prototype authentication is simulated."
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleCopyCredentials}
              className="gap-1.5"
            >
              {hasCopiedCreds ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-text-muted" aria-hidden="true" />
                  <span>Copy Credentials</span>
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => setCreatedCredentials(null)}
            >
              Done
            </Button>
          </div>
        }
      >
        {createdCredentials && (
          <div className="space-y-4">
            <div className="p-4 rounded-card bg-canvas border border-border space-y-2 text-small font-mono">
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Student Name:</span>
                <span className="font-semibold text-text-primary">{createdCredentials.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">University Roll:</span>
                <span className="font-semibold text-text-primary">{createdCredentials.rollNo}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted">Email Login:</span>
                <span className="font-semibold text-primary-600">{createdCredentials.email}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-text-muted">Temporary Password:</span>
                <span className="font-bold text-text-primary px-2 py-0.5 rounded bg-surface border border-border">
                  {createdCredentials.password}
                </span>
              </div>
            </div>

            <p className="text-xs text-text-secondary">
              The student can now sign in at the student login portal with this email and password.
            </p>
          </div>
        )}
      </Modal>

      {/* ========================================================================= */}
      {/* Quick Edit Dept/Sem Modal                                                 */}
      {/* ========================================================================= */}
      <Modal
        isOpen={Boolean(editingStudentDeptSem)}
        onClose={() => setEditingStudentDeptSem(null)}
        title="Update Academic Enrollment"
        description={`Modify department and semester for ${editingStudentDeptSem?.name} (${editingStudentDeptSem?.rollNo}).`}
        maxWidth="sm"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setEditingStudentDeptSem(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSaveQuickDeptSem}
            >
              Save Changes
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <SelectField
            label="Department"
            name="dept"
            required
            value={quickDept}
            onChange={(e) => setQuickDept(e.target.value as DepartmentCode)}
            options={departments.map((d) => ({
              value: d.code,
              label: `${d.name} (${d.code})`,
            }))}
          />

          <SelectField
            label="Semester"
            name="sem"
            required
            value={String(quickSem)}
            onChange={(e) => setQuickSem(parseInt(e.target.value, 10))}
            options={Array.from({ length: 8 }, (_, i) => ({
              value: String(i + 1),
              label: `Semester ${i + 1}`,
            }))}
          />
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* Delete Student Confirmation Dialog                                        */}
      {/* ========================================================================= */}
      <ConfirmDialog
        isOpen={Boolean(studentToDelete)}
        onClose={() => setStudentToDelete(null)}
        onConfirm={handleDeleteStudent}
        title="Delete Student Profile"
        message={`Are you sure you want to permanently delete "${studentToDelete?.name}" (${studentToDelete?.rollNo})? All associated event registrations will also be removed.`}
        confirmText="Delete Student"
        variant="danger"
      />

      {/* ========================================================================= */}
      {/* Bulk Action Confirmation Dialog                                           */}
      {/* ========================================================================= */}
      <ConfirmDialog
        isOpen={Boolean(bulkActionType)}
        onClose={() => {
          setBulkActionType(null)
          setSelectedBulkStudents([])
        }}
        onConfirm={handleExecuteBulkAction}
        title={`Bulk ${bulkActionType === 'delete' ? 'Delete' : bulkActionType === 'suspend' ? 'Suspend' : 'Reactivate'} Students`}
        message={
          bulkActionType === 'delete'
            ? `You are about to permanently delete ${selectedBulkStudents.length} student records. This cannot be undone.`
            : `Are you sure you want to ${bulkActionType} ${selectedBulkStudents.length} selected student accounts?`
        }
        itemCount={selectedBulkStudents.length}
        confirmText={
          bulkActionType === 'delete'
            ? 'Delete Students'
            : bulkActionType === 'suspend'
            ? 'Suspend Students'
            : 'Reactivate Students'
        }
        variant={bulkActionType === 'delete' ? 'danger' : 'primary'}
      />
    </div>
  )
}
