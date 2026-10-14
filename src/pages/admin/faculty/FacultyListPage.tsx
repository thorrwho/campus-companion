import React, { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Plus,
  GraduationCap,
  Building2,
  BookOpen,
  Trash2,
  Copy,
  Edit,
  ExternalLink,
  MapPin,
  Clock,
} from 'lucide-react'
import { useContentStore } from '@/store/useContentStore'
import { useActivityLogStore } from '@/store/useActivityLogStore'
import { useToastStore } from '@/store/useToastStore'
import { useAdminAuthStore } from '@/store/useAdminAuthStore'
import { Faculty } from '@/types'
import {
  DataTable,
  DataTableColumn,
  ConfirmDialog,
} from '@/components/admin'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'

export const FacultyListPage: React.FC = () => {
  const navigate = useNavigate()
  const {
    faculty,
    departments,
    locations,
    createItem,
    deleteWithIntegrity,
    getDependents,
  } = useContentStore()

  const { adminUser } = useAdminAuthStore()
  const { addActivity } = useActivityLogStore()
  const { push: pushToast } = useToastStore()

  // Filters
  const [departmentFilter, setDepartmentFilter] = useState('all')
  const [designationFilter, setDesignationFilter] = useState('all')

  // Deletion States
  const [itemToDelete, setItemToDelete] = useState<Faculty | null>(null)
  const [bulkItemsToDelete, setBulkItemsToDelete] = useState<Faculty[]>([])
  const [isDeleting, setIsDeleting] = useState(false)

  // Location and Department lookups
  const locationMap = useMemo(() => {
    const map = new Map<string, string>()
    locations.forEach((l) => map.set(l.id, `${l.name} (${l.building})`))
    return map
  }, [locations])

  const departmentMap = useMemo(() => {
    const map = new Map<string, string>()
    departments.forEach((d) => map.set(d.code, d.name))
    return map
  }, [departments])

  // Overview Metrics
  const metrics = useMemo(() => {
    const total = faculty.length
    const deptCount = new Set(faculty.map((f) => f.departmentId)).size
    const designations = new Set(faculty.map((f) => f.designation)).size
    const totalSubjects = new Set(faculty.flatMap((f) => f.subjects || [])).size
    return { total, deptCount, designations, totalSubjects }
  }, [faculty])

  // Unique designations for filter
  const uniqueDesignations = useMemo(() => {
    const set = new Set<string>()
    faculty.forEach((f) => {
      if (f.designation) set.add(f.designation)
    })
    return Array.from(set).sort()
  }, [faculty])

  // Filtered Data
  const filteredData = useMemo(() => {
    return faculty.filter((item) => {
      if (departmentFilter !== 'all' && item.departmentId !== departmentFilter) {
        return false
      }
      if (designationFilter !== 'all' && item.designation.toLowerCase() !== designationFilter.toLowerCase()) {
        return false
      }
      return true
    })
  }, [faculty, departmentFilter, designationFilter])

  // Delete Handlers
  const handleConfirmSingleDelete = () => {
    if (!itemToDelete) return
    setIsDeleting(true)
    try {
      useActivityLogStore.getState().setLastDeleted({
        itemType: 'faculty',
        itemData: itemToDelete,
        timestamp: Date.now(),
      })
      deleteWithIntegrity('faculty', itemToDelete.id)
      addActivity({
        userEmail: adminUser?.email || 'admin@demo.edu',
        userName: adminUser?.name || 'Administrator',
        action: 'delete',
        itemType: 'faculty',
        itemId: itemToDelete.id,
        itemName: itemToDelete.name,
        summary: `Deleted faculty profile for "${itemToDelete.name}"`,
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
        deleteWithIntegrity('faculty', item.id)
        addActivity({
          userEmail: adminUser?.email || 'admin@demo.edu',
          userName: adminUser?.name || 'Administrator',
          action: 'bulk_delete',
          itemType: 'faculty',
          itemId: item.id,
          itemName: item.name,
          summary: `Bulk deleted faculty profile "${item.name}"`,
        })
      })
      pushToast({
        type: 'success',
        message: `Permanently deleted ${bulkItemsToDelete.length} faculty profiles.`,
      })
      setBulkItemsToDelete([])
    } finally {
      setIsDeleting(false)
    }
  }

  // Duplicate Faculty
  const handleDuplicate = (prof: Faculty) => {
    const cloneData: Omit<Faculty, 'id' | 'createdAt' | 'updatedAt'> = {
      ...prof,
      name: `${prof.name} (Copy)`,
      email: `copy.${prof.email}`,
      initials: `${prof.initials}C`,
    }
    const created = createItem('faculty', cloneData, adminUser?.email)
    addActivity({
      userEmail: adminUser?.email || 'admin@demo.edu',
      userName: adminUser?.name || 'Administrator',
      action: 'create',
      itemType: 'faculty',
      itemId: created.id,
      itemName: created.name,
      summary: `Duplicated faculty profile "${prof.name}"`,
    })
    pushToast({
      type: 'success',
      message: `Created duplicate profile for "${created.name}".`,
    })
    navigate(`/admin/faculty/${created.id}/edit`)
  }

  // Dependents for current item to delete
  const dependents = useMemo(() => {
    if (!itemToDelete) return null
    return getDependents('faculty', itemToDelete.id)
  }, [itemToDelete, getDependents])

  // Table Columns
  const columns: DataTableColumn<Faculty>[] = [
    {
      key: 'name',
      header: 'Faculty Member',
      sortable: true,
      sortValue: (item) => item.name,
      render: (item) => (
        <div className="flex items-center gap-3 py-1">
          <Avatar
            initials={item.initials || item.name.slice(0, 2).toUpperCase()}
            name={item.name}
            size="md"
          />
          <div className="space-y-0.5 max-w-xs sm:max-w-md">
            <Link
              to={`/admin/faculty/${item.id}/edit`}
              className="font-semibold text-text-primary hover:text-primary-600 transition-colors text-sm line-clamp-1"
            >
              {item.name}
            </Link>
            <div className="text-xs text-text-muted">{item.designation}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      sortable: true,
      sortValue: (item) => item.departmentId,
      render: (item) => (
        <div className="space-y-0.5 text-xs">
          <span className="font-semibold text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-950/40 px-2 py-0.5 rounded uppercase">
            {item.departmentId}
          </span>
          <div className="text-text-muted text-[11px] truncate max-w-[140px]">
            {departmentMap.get(item.departmentId) || item.departmentId}
          </div>
        </div>
      ),
    },
    {
      key: 'office',
      header: 'Office Location',
      sortable: true,
      sortValue: (item) => locationMap.get(item.officeLocationId) || '',
      render: (item) => (
        <div className="text-xs text-text-secondary flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-text-muted shrink-0" />
          <span className="truncate max-w-[180px]">
            {locationMap.get(item.officeLocationId) || 'Office not set'}
          </span>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Email & Hours',
      hideOnMobile: true,
      render: (item) => (
        <div className="space-y-0.5 text-xs">
          <div className="text-text-primary font-mono text-[11px]">{item.email}</div>
          <div className="text-text-muted text-[11px]">{item.officeHours || 'Hours not specified'}</div>
        </div>
      ),
    },
    {
      key: 'subjects',
      header: 'Subjects Taught',
      hideOnMobile: true,
      render: (item) => {
        if (!item.subjects || item.subjects.length === 0) {
          return <span className="text-xs text-text-muted">No courses listed</span>
        }
        return (
          <div className="flex flex-wrap gap-1 max-w-xs">
            {item.subjects.slice(0, 2).map((s, idx) => (
              <span
                key={idx}
                className="px-1.5 py-0.5 rounded bg-canvas border border-border text-[11px] text-text-secondary"
              >
                {s}
              </span>
            ))}
            {item.subjects.length > 2 && (
              <span className="text-[10px] text-text-muted self-center">
                +{item.subjects.length - 2} more
              </span>
            )}
          </div>
        )
      },
    },
  ]

  return (
    <div className="space-y-6 text-left pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Faculty Directory ({faculty.length})
          </h1>
          <p className="text-caption text-text-secondary mt-1">
            Manage academic professors, department chairs, office hours, and room assignments.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            onClick={() => window.open('/directory', '_blank')}
            className="flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4 text-text-secondary" />
            <span>View in App</span>
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => navigate('/admin/faculty/new')}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>New Faculty Member</span>
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-card border border-border bg-surface shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-950/40 text-primary-600 flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">{metrics.total}</div>
            <div className="text-xs text-text-muted">Total Faculty</div>
          </div>
        </div>

        <div className="p-4 rounded-card border border-border bg-surface shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">{metrics.deptCount}</div>
            <div className="text-xs text-text-muted">Departments</div>
          </div>
        </div>

        <div className="p-4 rounded-card border border-border bg-surface shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">{metrics.designations}</div>
            <div className="text-xs text-text-muted">Designations</div>
          </div>
        </div>

        <div className="p-4 rounded-card border border-border bg-surface shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-2xl font-bold text-text-primary">{metrics.totalSubjects}</div>
            <div className="text-xs text-text-muted">Courses Taught</div>
          </div>
        </div>
      </div>

      {/* Main DataTable */}
      <DataTable
        data={filteredData}
        columns={columns}
        keyField="id"
        searchPlaceholder="Search faculty by name, designation, email, or subjects..."
        searchFilter={(item, q) =>
          Boolean(
            item.name.toLowerCase().includes(q) ||
            item.designation.toLowerCase().includes(q) ||
            item.email.toLowerCase().includes(q) ||
            item.departmentId.toLowerCase().includes(q) ||
            (item.subjects && item.subjects.some((s) => s.toLowerCase().includes(q)))
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
            key: 'designation',
            label: 'Designation',
            value: designationFilter,
            onChange: setDesignationFilter,
            options: [
              { label: 'All Designations', value: 'all' },
              ...uniqueDesignations.map((d) => ({ label: d, value: d })),
            ],
          },
        ]}
        bulkActions={[
          {
            label: 'Delete Selected',
            icon: <Trash2 className="w-4 h-4" />,
            variant: 'danger',
            onClick: (items) => setBulkItemsToDelete(items),
          },
        ]}
        rowActions={(item) => [
          {
            label: 'Edit Faculty Member',
            icon: <Edit className="w-4 h-4" />,
            onClick: () => navigate(`/admin/faculty/${item.id}/edit`),
          },
          {
            label: 'Duplicate Profile',
            icon: <Copy className="w-4 h-4" />,
            onClick: () => handleDuplicate(item),
          },
          {
            label: 'Delete Profile',
            icon: <Trash2 className="w-4 h-4" />,
            variant: 'danger',
            onClick: () => setItemToDelete(item),
          },
        ]}
        emptyState={{
          title: 'No faculty profiles found',
          message: 'Get started by creating your first academic faculty member.',
          actionLabel: 'New Faculty Member',
          onAction: () => navigate('/admin/faculty/new'),
        }}
      />

      {/* Single Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(itemToDelete)}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmSingleDelete}
        title="Delete Faculty Profile"
        itemName={itemToDelete?.name}
        message={
          dependents?.hasDependents
            ? `Are you sure you want to delete "${itemToDelete?.name}"? Warning: ${dependents.description} Deleting will automatically unlink this professor from timetable slots and clubs.`
            : `Are you sure you want to delete "${itemToDelete?.name}"? This action cannot be immediately reversed.`
        }
        confirmText="Delete Faculty"
        isLoading={isDeleting}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={bulkItemsToDelete.length > 0}
        onClose={() => setBulkItemsToDelete([])}
        onConfirm={handleConfirmBulkDelete}
        title="Delete Multiple Faculty Profiles"
        itemCount={bulkItemsToDelete.length}
        message={`You are about to permanently delete ${bulkItemsToDelete.length} faculty profiles. Associated timetable courses will be unlinked.`}
        confirmText={`Delete ${bulkItemsToDelete.length} Faculty`}
        isLoading={isDeleting}
      />
    </div>
  )
}
