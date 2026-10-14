import React, { useState, useMemo } from 'react'
import {
  Plus,
  Building2,
  Users,
  GraduationCap,
  Calendar,
  Check,
  X,
  Edit,
  Trash2,
  AlertTriangle,
  Search,
} from 'lucide-react'
import { useContentStore } from '@/store/useContentStore'
import { useActivityLogStore } from '@/store/useActivityLogStore'
import { useToastStore } from '@/store/useToastStore'
import { useAdminAuthStore } from '@/store/useAdminAuthStore'
import { Department, DepartmentCode } from '@/types'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { ConfirmDialog } from '@/components/admin'

interface EditableRowData {
  id: string
  code: string
  name: string
  semestersOffered: number
}

export const DepartmentsPage: React.FC = () => {
  const {
    departments,
    students,
    faculty,
    timetableSlots,
    createItem,
    updateItem,
    removeItem,
  } = useContentStore()

  const { adminUser } = useAdminAuthStore()
  const { addActivity } = useActivityLogStore()
  const { push: pushToast } = useToastStore()

  // Search & Filter
  const [search, setSearch] = useState('')

  // Inline Editing State
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<EditableRowData | null>(null)

  // Inline Creating State
  const [isCreating, setIsCreating] = useState(false)
  const [newDepartment, setNewDepartment] = useState<EditableRowData>({
    id: '',
    code: '',
    name: '',
    semestersOffered: 8,
  })

  // Delete State
  const [itemToDelete, setItemToDelete] = useState<Department | null>(null)
  const [blockedDeleteDept, setBlockedDeleteDept] = useState<{
    dept: Department
    studentCount: number
    facultyCount: number
    slotCount: number
  } | null>(null)

  // Usage statistics per department
  const usageStats = useMemo(() => {
    const map = new Map<string, { students: number; faculty: number; slots: number }>()

    departments.forEach((dept) => {
      const studentCount = students.filter((s) => s.department === dept.code).length
      const facultyCount = faculty.filter((f) => f.departmentId === dept.code).length
      const slotCount = timetableSlots.filter((t) => t.department === dept.code).length

      map.set(dept.code, {
        students: studentCount,
        faculty: facultyCount,
        slots: slotCount,
      })
    })

    return map
  }, [departments, students, faculty, timetableSlots])

  // Filtered Departments
  const filteredDepartments = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return departments
    return departments.filter(
      (d) => d.name.toLowerCase().includes(q) || d.code.toLowerCase().includes(q)
    )
  }, [departments, search])

  // Overview Metrics
  const metrics = useMemo(() => {
    const totalDepts = departments.length
    const totalStudents = students.length
    const totalFaculty = faculty.length
    const totalSlots = timetableSlots.length
    return { totalDepts, totalStudents, totalFaculty, totalSlots }
  }, [departments, students, faculty, timetableSlots])

  // Start Edit Row
  const handleStartEdit = (dept: Department) => {
    setEditingId(dept.id)
    setEditForm({
      id: dept.id,
      code: dept.code,
      name: dept.name,
      semestersOffered: dept.semestersOffered || 8,
    })
  }

  // Cancel Edit Row
  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm(null)
  }

  // Save Edit Row
  const handleSaveEdit = () => {
    if (!editForm) return
    const trimmedCode = editForm.code.trim().toUpperCase() as DepartmentCode
    const trimmedName = editForm.name.trim()

    if (!trimmedCode) {
      pushToast({ type: 'error', message: 'Department code is required.' })
      return
    }
    if (!trimmedName) {
      pushToast({ type: 'error', message: 'Department name is required.' })
      return
    }

    // Check unique code (against other departments)
    const duplicate = departments.find(
      (d) => d.code === trimmedCode && d.id !== editForm.id
    )
    if (duplicate) {
      pushToast({
        type: 'error',
        message: `Department code "${trimmedCode}" is already in use by another department.`,
      })
      return
    }

    updateItem(
      'departments',
      editForm.id,
      {
        code: trimmedCode,
        name: trimmedName,
        semestersOffered: editForm.semestersOffered,
      },
      adminUser?.email
    )

    addActivity({
      userEmail: adminUser?.email || 'admin@demo.edu',
      userName: adminUser?.name || 'Administrator',
      action: 'update',
      itemType: 'department',
      itemId: editForm.id,
      itemName: trimmedName,
      summary: `Updated department ${trimmedCode} (${trimmedName})`,
    })

    pushToast({
      type: 'success',
      message: `Saved changes to ${trimmedCode}.`,
    })
    setEditingId(null)
    setEditForm(null)
  }

  // Save New Department
  const handleSaveNew = () => {
    const trimmedCode = newDepartment.code.trim().toUpperCase() as DepartmentCode
    const trimmedName = newDepartment.name.trim()

    if (!trimmedCode) {
      pushToast({ type: 'error', message: 'Department code is required.' })
      return
    }
    if (!trimmedName) {
      pushToast({ type: 'error', message: 'Department name is required.' })
      return
    }

    // Check unique code
    if (departments.some((d) => d.code === trimmedCode)) {
      pushToast({
        type: 'error',
        message: `Department code "${trimmedCode}" already exists.`,
      })
      return
    }

    const created = createItem(
      'departments',
      {
        code: trimmedCode,
        name: trimmedName,
        semestersOffered: newDepartment.semestersOffered || 8,
      },
      adminUser?.email
    )

    addActivity({
      userEmail: adminUser?.email || 'admin@demo.edu',
      userName: adminUser?.name || 'Administrator',
      action: 'create',
      itemType: 'department',
      itemId: created.id,
      itemName: trimmedName,
      summary: `Created new department ${trimmedCode} (${trimmedName})`,
    })

    pushToast({
      type: 'success',
      message: `Created department ${trimmedCode}.`,
    })

    setIsCreating(false)
    setNewDepartment({
      id: '',
      code: '',
      name: '',
      semestersOffered: 8,
    })
  }

  // Delete Request Handler
  const handleDeleteRequest = (dept: Department) => {
    const stats = usageStats.get(dept.code) || { students: 0, faculty: 0, slots: 0 }

    // BLOCKED if department is used by students, faculty, or timetable slots
    if (stats.students > 0 || stats.faculty > 0 || stats.slots > 0) {
      setBlockedDeleteDept({
        dept,
        studentCount: stats.students,
        facultyCount: stats.faculty,
        slotCount: stats.slots,
      })
      return
    }

    // Otherwise show confirmation dialog
    setItemToDelete(dept)
  }

  // Confirm Allowed Delete
  const handleConfirmDelete = () => {
    if (!itemToDelete) return
    removeItem('departments', itemToDelete.id)
    addActivity({
      userEmail: adminUser?.email || 'admin@demo.edu',
      userName: adminUser?.name || 'Administrator',
      action: 'delete',
      itemType: 'department',
      itemId: itemToDelete.id,
      itemName: itemToDelete.name,
      summary: `Deleted empty department ${itemToDelete.code}`,
    })
    pushToast({
      type: 'success',
      message: `Deleted department ${itemToDelete.code}.`,
    })
    setItemToDelete(null)
  }

  return (
    <div className="space-y-6 text-left pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Academic Departments ({departments.length})
          </h1>
          <p className="text-caption text-text-secondary mt-1">
            Manage academic divisions, unique department codes, semesters offered, and linked faculty.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => {
            setIsCreating(true)
            setNewDepartment({ id: '', code: '', name: '', semestersOffered: 8 })
          }}
          className="flex items-center gap-2 self-start sm:self-auto"
          disabled={isCreating}
        >
          <Plus className="w-4 h-4" />
          <span>Add Department</span>
        </Button>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-card border border-border bg-surface shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-950/40 text-primary-600 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">{metrics.totalDepts}</div>
            <div className="text-xs text-text-muted">Total Departments</div>
          </div>
        </div>

        <div className="p-4 rounded-card border border-border bg-surface shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">{metrics.totalStudents}</div>
            <div className="text-xs text-text-muted">Enrolled Students</div>
          </div>
        </div>

        <div className="p-4 rounded-card border border-border bg-surface shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">{metrics.totalFaculty}</div>
            <div className="text-xs text-text-muted">Faculty Assigned</div>
          </div>
        </div>

        <div className="p-4 rounded-card border border-border bg-surface shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">{metrics.totalSlots}</div>
            <div className="text-xs text-text-muted">Timetable Slots</div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by code or department name..."
          className="w-full pl-9 pr-3 py-2 text-xs rounded-card border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-600"
        />
      </div>

      {/* Inline Editable Table */}
      <div className="border border-border rounded-card bg-surface shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border bg-canvas/60 text-text-secondary font-semibold">
                <th className="py-3 px-4 w-28">Code</th>
                <th className="py-3 px-4">Department Name</th>
                <th className="py-3 px-4 w-36">Semesters</th>
                <th className="py-3 px-4 w-28 text-center">Students</th>
                <th className="py-3 px-4 w-28 text-center">Faculty</th>
                <th className="py-3 px-4 w-28 text-center">Slots</th>
                <th className="py-3 px-4 w-32 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border">
              {/* Inline Create Row */}
              {isCreating && (
                <tr className="bg-primary-50/50 dark:bg-primary-950/20">
                  <td className="py-2.5 px-4">
                    <input
                      type="text"
                      maxLength={6}
                      value={newDepartment.code}
                      onChange={(e) =>
                        setNewDepartment({
                          ...newDepartment,
                          code: e.target.value.toUpperCase(),
                        })
                      }
                      placeholder="e.g. AI"
                      className="w-full px-2.5 py-1.5 font-mono uppercase font-bold text-xs rounded border border-primary-300 dark:border-primary-700 bg-surface focus:outline-none focus:ring-2 focus:ring-primary-600"
                      autoFocus
                    />
                  </td>
                  <td className="py-2.5 px-4">
                    <input
                      type="text"
                      value={newDepartment.name}
                      onChange={(e) =>
                        setNewDepartment({ ...newDepartment, name: e.target.value })
                      }
                      placeholder="e.g. Artificial Intelligence & Data Science"
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-primary-300 dark:border-primary-700 bg-surface focus:outline-none focus:ring-2 focus:ring-primary-600"
                    />
                  </td>
                  <td className="py-2.5 px-4">
                    <select
                      value={newDepartment.semestersOffered}
                      onChange={(e) =>
                        setNewDepartment({
                          ...newDepartment,
                          semestersOffered: parseInt(e.target.value, 10),
                        })
                      }
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-primary-300 dark:border-primary-700 bg-surface focus:outline-none focus:ring-2 focus:ring-primary-600"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                        <option key={s} value={s}>
                          {s} Semesters
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-2.5 px-4 text-center text-text-muted">0</td>
                  <td className="py-2.5 px-4 text-center text-text-muted">0</td>
                  <td className="py-2.5 px-4 text-center text-text-muted">0</td>
                  <td className="py-2.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={handleSaveNew}
                        className="p-1.5 rounded bg-primary-600 hover:bg-primary-500 text-white transition-colors"
                        title="Save Department"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCreating(false)}
                        className="p-1.5 rounded hover:bg-canvas text-text-muted hover:text-text-primary transition-colors"
                        title="Cancel"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {/* Department Rows */}
              {filteredDepartments.map((dept) => {
                const isEditing = editingId === dept.id
                const stats = usageStats.get(dept.code) || { students: 0, faculty: 0, slots: 0 }

                if (isEditing && editForm) {
                  return (
                    <tr key={dept.id} className="bg-amber-50/40 dark:bg-amber-950/20">
                      <td className="py-2.5 px-4">
                        <input
                          type="text"
                          maxLength={6}
                          value={editForm.code}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              code: e.target.value.toUpperCase(),
                            })
                          }
                          className="w-full px-2.5 py-1.5 font-mono uppercase font-bold text-xs rounded border border-amber-300 dark:border-amber-700 bg-surface focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </td>
                      <td className="py-2.5 px-4">
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm({ ...editForm, name: e.target.value })
                          }
                          className="w-full px-2.5 py-1.5 text-xs rounded border border-amber-300 dark:border-amber-700 bg-surface focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </td>
                      <td className="py-2.5 px-4">
                        <select
                          value={editForm.semestersOffered}
                          onChange={(e) =>
                            setEditForm({
                              ...editForm,
                              semestersOffered: parseInt(e.target.value, 10),
                            })
                          }
                          className="w-full px-2.5 py-1.5 text-xs rounded border border-amber-300 dark:border-amber-700 bg-surface focus:outline-none focus:ring-2 focus:ring-amber-500"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                            <option key={s} value={s}>
                              {s} Semesters
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2.5 px-4 text-center font-medium">{stats.students}</td>
                      <td className="py-2.5 px-4 text-center font-medium">{stats.faculty}</td>
                      <td className="py-2.5 px-4 text-center font-medium">{stats.slots}</td>
                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={handleSaveEdit}
                            className="p-1.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white transition-colors"
                            title="Save Changes"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelEdit}
                            className="p-1.5 rounded hover:bg-canvas text-text-muted hover:text-text-primary transition-colors"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                }

                return (
                  <tr key={dept.id} className="hover:bg-canvas/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-primary-700 dark:text-primary-300">
                      <span className="px-2 py-0.5 rounded bg-primary-50 dark:bg-primary-950/40">
                        {dept.code}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-text-primary">
                      {dept.name}
                    </td>
                    <td className="py-3 px-4 text-text-secondary">
                      {dept.semestersOffered || 8} Semesters
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-semibold text-text-primary">
                        {stats.students}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-semibold text-text-primary">
                        {stats.faculty}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-semibold text-text-primary">
                        {stats.slots}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(dept)}
                          className="p-1.5 rounded hover:bg-canvas text-text-secondary hover:text-primary-600 transition-colors"
                          title="Edit Department"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteRequest(dept)}
                          className="p-1.5 rounded hover:bg-canvas text-text-secondary hover:text-status-error transition-colors"
                          title="Delete Department"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}

              {filteredDepartments.length === 0 && !isCreating && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-text-muted">
                    No departments matching &quot;{search}&quot;.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Blocked Deletion Informative Modal */}
      <Modal
        isOpen={Boolean(blockedDeleteDept)}
        onClose={() => setBlockedDeleteDept(null)}
        title="Department In Use: Deletion Blocked"
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end w-full">
            <Button
              variant="primary"
              size="md"
              onClick={() => setBlockedDeleteDept(null)}
            >
              Understood
            </Button>
          </div>
        }
      >
        <div className="space-y-4 pt-1 text-left">
          <div className="p-3.5 rounded-card bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-sm">
                Cannot delete department &quot;{blockedDeleteDept?.dept.code} - {blockedDeleteDept?.dept.name}&quot;
              </p>
              <p className="leading-relaxed">
                This academic department has active records linked to it in the system. You must reassign or remove these records before the department can be deleted.
              </p>
            </div>
          </div>

          <div className="border border-border rounded-card divide-y divide-border text-xs">
            <div className="p-3 flex items-center justify-between">
              <span className="text-text-secondary font-medium">Enrolled Students</span>
              <span className="font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded">
                {blockedDeleteDept?.studentCount} active students
              </span>
            </div>

            <div className="p-3 flex items-center justify-between">
              <span className="text-text-secondary font-medium">Assigned Faculty Members</span>
              <span className="font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded">
                {blockedDeleteDept?.facultyCount} professors
              </span>
            </div>

            <div className="p-3 flex items-center justify-between">
              <span className="text-text-secondary font-medium">Timetable Schedule Slots</span>
              <span className="font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded">
                {blockedDeleteDept?.slotCount} weekly lecture slots
              </span>
            </div>
          </div>
        </div>
      </Modal>

      {/* Allowed Confirmation Dialog for empty departments */}
      <ConfirmDialog
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Department"
        itemName={itemToDelete?.code}
        message={`Are you sure you want to delete ${itemToDelete?.code} (${itemToDelete?.name})? This department currently has 0 linked students and faculty.`}
        confirmText="Delete Department"
      />
    </div>
  )
}
