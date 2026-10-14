import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Clock,
  Calendar,
  Building2,
  GraduationCap,
  Plus,
  Trash2,
  Copy,
  Edit,
  MapPin,
  User,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Layers,
  List,
  Grid3X3,
  ExternalLink,
  Info,
} from 'lucide-react'
import { useContentStore } from '@/store/useContentStore'
import { useActivityLogStore } from '@/store/useActivityLogStore'
import { useToastStore } from '@/store/useToastStore'
import { useAdminAuthStore } from '@/store/useAdminAuthStore'
import { TimetableSlot, DayOfWeek, DepartmentCode } from '@/types'
import {
  ConfirmDialog,
  DataTable,
  DataTableColumn,
  TextField,
  SelectField,
  SearchableSelect,
  TimePickerField,
} from '@/components/admin'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

const DAYS_OF_WEEK: DayOfWeek[] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
]

const STANDARD_PERIODS = [
  { label: '08:00 to 09:00', start: '08:00', end: '09:00' },
  { label: '09:00 to 10:00', start: '09:00', end: '10:00' },
  { label: '10:00 to 11:00', start: '10:00', end: '11:00' },
  { label: '11:15 to 12:15', start: '11:15', end: '12:15' },
  { label: '12:15 to 13:00', start: '12:15', end: '13:00', isBreak: true },
  { label: '13:00 to 14:00', start: '13:00', end: '14:00' },
  { label: '14:00 to 15:00', start: '14:00', end: '15:00' },
  { label: '15:00 to 16:00', start: '15:00', end: '16:00' },
  { label: '16:00 to 17:00', start: '16:00', end: '17:00' },
]

function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0
  const [h, m] = timeStr.split(':').map((v) => parseInt(v, 10))
  return (h || 0) * 60 + (m || 0)
}

function doTimesOverlap(startA: string, endA: string, startB: string, endB: string): boolean {
  const minStartA = timeToMinutes(startA)
  const minEndA = timeToMinutes(endA)
  const minStartB = timeToMinutes(startB)
  const minEndB = timeToMinutes(endB)
  return minStartA < minEndB && minEndA > minStartB
}

interface SlotFormData {
  id?: string
  day: DayOfWeek
  start: string
  end: string
  subject: string
  code: string
  room: string
  locationId: string
  faculty: string
  department: DepartmentCode
  semester: number
}

const INITIAL_FORM: SlotFormData = {
  day: 'Monday',
  start: '09:00',
  end: '10:00',
  subject: '',
  code: '',
  room: '',
  locationId: '',
  faculty: '',
  department: 'CSE-AIML',
  semester: 5,
}

export const TimetablePage: React.FC = () => {
  const {
    departments,
    timetableSlots,
    locations,
    faculty: facultyList,
    createItem,
    updateItem,
    removeItem,
    bulkRemove,
  } = useContentStore()

  const { adminUser } = useAdminAuthStore()
  const { addActivity } = useActivityLogStore()
  const { push: pushToast } = useToastStore()

  // Selected department and semester
  const [selectedDept, setSelectedDept] = useState<string>('CSE-AIML')
  const [selectedSem, setSelectedSem] = useState<number>(5)
  const [viewMode, setViewMode] = useState<'matrix' | 'daily' | 'table'>('matrix')
  const [activeDayTab, setActiveDayTab] = useState<DayOfWeek>('Monday')

  // Slot modal state
  const [isSlotModalOpen, setIsSlotModalOpen] = useState(false)
  const [formData, setFormData] = useState<SlotFormData>(INITIAL_FORM)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Copy modal state
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false)
  const [copySourceDept, setCopySourceDept] = useState<string>('CSE')
  const [copySourceSem, setCopySourceSem] = useState<number>(5)

  // Delete slot state
  const [slotToDelete, setSlotToDelete] = useState<TimetableSlot | null>(null)
  const [isClearConfirmOpen, setIsClearConfirmOpen] = useState(false)

  // Ensure selectedDept is valid
  const currentDept = useMemo(() => {
    return departments.find((d) => d.code === selectedDept) || departments[0] || {
      code: 'CSE-AIML',
      name: 'Computer Science & AI',
      semestersOffered: 8,
    }
  }, [departments, selectedDept])

  // Filter slots for current department and semester
  const currentSlots = useMemo(() => {
    return timetableSlots.filter(
      (s) => s.department === selectedDept && s.semester === selectedSem
    )
  }, [timetableSlots, selectedDept, selectedSem])

  // Quick stats
  const stats = useMemo(() => {
    const totalPeriods = currentSlots.length
    let totalMinutes = 0
    const facultySet = new Set<string>()
    const roomSet = new Set<string>()

    currentSlots.forEach((slot) => {
      const dur = Math.max(0, timeToMinutes(slot.end) - timeToMinutes(slot.start))
      totalMinutes += dur
      if (slot.faculty) facultySet.add(slot.faculty)
      if (slot.room) roomSet.add(slot.room)
    })

    const totalHours = (totalMinutes / 60).toFixed(1)
    return {
      totalPeriods,
      totalHours,
      facultyCount: facultySet.size,
      roomCount: roomSet.size,
    }
  }, [currentSlots])

  // Detect conflicts across all timetable slots campus-wide
  const conflictsMap = useMemo(() => {
    const map = new Map<string, { facultyConflicts: string[]; roomConflicts: string[] }>()

    currentSlots.forEach((slot) => {
      const facultyConflicts: string[] = []
      const roomConflicts: string[] = []

      timetableSlots.forEach((other) => {
        if (other.id === slot.id) return
        if (other.day !== slot.day) return
        if (!doTimesOverlap(slot.start, slot.end, other.start, other.end)) return

        // Faculty clash
        if (slot.faculty && other.faculty && slot.faculty.trim().toLowerCase() === other.faculty.trim().toLowerCase()) {
          facultyConflicts.push(
            `${other.faculty} is already teaching ${other.subject} (${other.department} Sem ${other.semester}) in ${other.room}`
          )
        }

        // Room clash
        if (
          slot.locationId &&
          other.locationId &&
          slot.locationId === other.locationId
        ) {
          roomConflicts.push(
            `Room ${slot.room || 'location'} is booked by ${other.subject} (${other.department} Sem ${other.semester})`
          )
        }
      })

      if (facultyConflicts.length > 0 || roomConflicts.length > 0) {
        map.set(slot.id, { facultyConflicts, roomConflicts })
      }
    })

    return map
  }, [currentSlots, timetableSlots])

  const totalConflictsCount = conflictsMap.size

  // Conflict diagnostics for current form being created/edited
  const formValidation = useMemo(() => {
    if (!formData.subject.trim()) {
      return { isValid: false, overlapError: null, facultyWarnings: [], roomWarnings: [] }
    }
    if (!formData.code.trim()) {
      return { isValid: false, overlapError: null, facultyWarnings: [], roomWarnings: [] }
    }
    if (timeToMinutes(formData.end) <= timeToMinutes(formData.start)) {
      return {
        isValid: false,
        overlapError: 'End time must be later than start time.',
        facultyWarnings: [],
        roomWarnings: [],
      }
    }

    // 1. Overlap Check (STRICT - blocks save)
    // Overlapping slot in the SAME department and semester on the SAME day
    const overlappingSlot = currentSlots.find((slot) => {
      if (formData.id && slot.id === formData.id) return false
      if (slot.day !== formData.day) return false
      return doTimesOverlap(formData.start, formData.end, slot.start, slot.end)
    })

    let overlapError: string | null = null
    if (overlappingSlot) {
      overlapError = `Schedule Overlap: "${overlappingSlot.subject}" (${overlappingSlot.code}) is already scheduled on ${overlappingSlot.day} from ${overlappingSlot.start} to ${overlappingSlot.end}. Double booking the same class is not allowed.`
    }

    // 2. Faculty Clashes (WARNING - does not block)
    const facultyWarnings: string[] = []
    if (formData.faculty.trim()) {
      timetableSlots.forEach((other) => {
        if (formData.id && other.id === formData.id) return
        if (other.day !== formData.day) return
        if (!doTimesOverlap(formData.start, formData.end, other.start, other.end)) return

        if (other.faculty.trim().toLowerCase() === formData.faculty.trim().toLowerCase()) {
          facultyWarnings.push(
            `Notice: ${formData.faculty} is already scheduled to teach "${other.subject}" (${other.department} Sem ${other.semester}) on ${other.day} from ${other.start} to ${other.end} in ${other.room}.`
          )
        }
      })
    }

    // 3. Room Clashes (WARNING - does not block)
    const roomWarnings: string[] = []
    if (formData.locationId) {
      timetableSlots.forEach((other) => {
        if (formData.id && other.id === formData.id) return
        if (other.day !== formData.day) return
        if (!doTimesOverlap(formData.start, formData.end, other.start, other.end)) return

        if (other.locationId === formData.locationId) {
          const loc = locations.find((l) => l.id === formData.locationId)
          const locName = loc ? loc.name : formData.room
          roomWarnings.push(
            `Notice: Location "${locName}" is already reserved for "${other.subject}" (${other.department} Sem ${other.semester}) from ${other.start} to ${other.end}.`
          )
        }
      })
    }

    return {
      isValid: !overlapError,
      overlapError,
      facultyWarnings,
      roomWarnings,
    }
  }, [formData, currentSlots, timetableSlots, locations])

  // Open modal to add slot
  const handleOpenAdd = (prefill?: Partial<SlotFormData>) => {
    setFormData({
      ...INITIAL_FORM,
      department: selectedDept,
      semester: selectedSem,
      day: activeDayTab,
      ...prefill,
    })
    setIsEditing(false)
    setIsSlotModalOpen(true)
  }

  // Open modal to edit slot
  const handleOpenEdit = (slot: TimetableSlot) => {
    setFormData({
      id: slot.id,
      day: slot.day,
      start: slot.start,
      end: slot.end,
      subject: slot.subject,
      code: slot.code,
      room: slot.room,
      locationId: slot.locationId,
      faculty: slot.faculty,
      department: slot.department,
      semester: slot.semester,
    })
    setIsEditing(true)
    setIsSlotModalOpen(true)
  }

  // Duplicate a slot to another day
  const handleDuplicateToNextDay = (slot: TimetableSlot) => {
    const days: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const currentIndex = days.indexOf(slot.day)
    const nextDay = days[(currentIndex + 1) % days.length]

    const newSlot = createItem(
      'timetableSlots',
      {
        day: nextDay,
        start: slot.start,
        end: slot.end,
        subject: slot.subject,
        code: slot.code,
        room: slot.room,
        locationId: slot.locationId,
        faculty: slot.faculty,
        department: slot.department,
        semester: slot.semester,
      },
      adminUser?.email
    )

    addActivity({
      userEmail: adminUser?.email || 'admin@demo.edu',
      userName: adminUser?.name || 'Administrator',
      action: 'create',
      itemType: 'timetable',
      itemId: newSlot.id,
      itemName: `${slot.code}: ${slot.subject}`,
      summary: `Duplicated slot to ${nextDay} (${slot.start} to ${slot.end})`,
    })

    pushToast({
      type: 'success',
      message: `Duplicated ${slot.code} to ${nextDay}.`,
    })
  }

  // Save slot handler
  const handleSaveSlot = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formValidation.isValid) return

    setIsSaving(true)
    setTimeout(() => {
      try {
        if (isEditing && formData.id) {
          updateItem(
            'timetableSlots',
            formData.id,
            {
              day: formData.day,
              start: formData.start,
              end: formData.end,
              subject: formData.subject.trim(),
              code: formData.code.trim().toUpperCase(),
              room: formData.room.trim(),
              locationId: formData.locationId,
              faculty: formData.faculty.trim(),
              department: selectedDept,
              semester: selectedSem,
            },
            adminUser?.email
          )

          addActivity({
            userEmail: adminUser?.email || 'admin@demo.edu',
            userName: adminUser?.name || 'Administrator',
            action: 'update',
            itemType: 'timetable',
            itemId: formData.id,
            itemName: `${formData.code}: ${formData.subject}`,
            summary: `Updated class slot on ${formData.day} (${formData.start} to ${formData.end})`,
          })

          pushToast({
            type: 'success',
            message: `Updated ${formData.code} on ${formData.day}.`,
          })
        } else {
          const created = createItem(
            'timetableSlots',
            {
              day: formData.day,
              start: formData.start,
              end: formData.end,
              subject: formData.subject.trim(),
              code: formData.code.trim().toUpperCase(),
              room: formData.room.trim(),
              locationId: formData.locationId,
              faculty: formData.faculty.trim(),
              department: selectedDept,
              semester: selectedSem,
            },
            adminUser?.email
          )

          addActivity({
            userEmail: adminUser?.email || 'admin@demo.edu',
            userName: adminUser?.name || 'Administrator',
            action: 'create',
            itemType: 'timetable',
            itemId: created.id,
            itemName: `${formData.code}: ${formData.subject}`,
            summary: `Scheduled class slot on ${formData.day} (${formData.start} to ${formData.end})`,
          })

          pushToast({
            type: 'success',
            message: `Added ${formData.code} on ${formData.day}.`,
          })
        }

        setIsSlotModalOpen(false)
      } catch {
        pushToast({
          type: 'error',
          message: 'An unexpected error occurred while saving.',
        })
      } finally {
        setIsSaving(false)
      }
    }, 300)
  }

  // Delete slot handler
  const handleDeleteSlot = () => {
    if (!slotToDelete) return
    removeItem('timetableSlots', slotToDelete.id)

    addActivity({
      userEmail: adminUser?.email || 'admin@demo.edu',
      userName: adminUser?.name || 'Administrator',
      action: 'delete',
      itemType: 'timetable',
      itemId: slotToDelete.id,
      itemName: `${slotToDelete.code}: ${slotToDelete.subject}`,
      summary: `Removed slot from ${slotToDelete.day} (${slotToDelete.start} to ${slotToDelete.end})`,
    })

    pushToast({
      type: 'info',
      message: `Removed ${slotToDelete.code} from schedule.`,
    })

    setSlotToDelete(null)
    setIsSlotModalOpen(false)
  }

  // Copy timetable execution
  const handleExecuteCopy = () => {
    const sourceSlots = timetableSlots.filter(
      (s) => s.department === copySourceDept && s.semester === copySourceSem
    )

    if (sourceSlots.length === 0) {
      pushToast({
        type: 'error',
        message: `${copySourceDept} Semester ${copySourceSem} has no scheduled classes.`,
      })
      return
    }

    // 1. Remove current target slots
    const currentIds = currentSlots.map((s) => s.id)
    if (currentIds.length > 0) {
      bulkRemove('timetableSlots', currentIds)
    }

    // 2. Insert duplicated slots for target department and semester
    sourceSlots.forEach((src) => {
      createItem(
        'timetableSlots',
        {
          day: src.day,
          start: src.start,
          end: src.end,
          subject: src.subject,
          code: src.code,
          room: src.room,
          locationId: src.locationId,
          faculty: src.faculty,
          department: selectedDept,
          semester: selectedSem,
        },
        adminUser?.email
      )
    })

    addActivity({
      userEmail: adminUser?.email || 'admin@demo.edu',
      userName: adminUser?.name || 'Administrator',
      action: 'create',
      itemType: 'timetable',
      itemId: `tt-copy-${Date.now()}`,
      itemName: `${selectedDept} Sem ${selectedSem}`,
      summary: `Copied ${sourceSlots.length} schedule slots from ${copySourceDept} Sem ${copySourceSem}`,
    })

    pushToast({
      type: 'success',
      message: `Copied ${sourceSlots.length} classes from ${copySourceDept} Sem ${copySourceSem} to ${selectedDept} Sem ${selectedSem}.`,
    })

    setIsCopyModalOpen(false)
  }

  // Clear timetable execution
  const handleExecuteClear = () => {
    const currentIds = currentSlots.map((s) => s.id)
    if (currentIds.length === 0) return

    bulkRemove('timetableSlots', currentIds)

    addActivity({
      userEmail: adminUser?.email || 'admin@demo.edu',
      userName: adminUser?.name || 'Administrator',
      action: 'delete',
      itemType: 'timetable',
      itemId: `tt-clear-${Date.now()}`,
      itemName: `${selectedDept} Sem ${selectedSem}`,
      summary: `Cleared all ${currentIds.length} schedule slots for ${selectedDept} Sem ${selectedSem}`,
    })

    pushToast({
      type: 'info',
      message: `Removed all classes for ${selectedDept} Semester ${selectedSem}.`,
    })

    setIsClearConfirmOpen(false)
  }

  // Table columns for list view
  const tableColumns: DataTableColumn<TimetableSlot>[] = [
    {
      key: 'day',
      header: 'Day',
      sortable: true,
      sortValue: (slot: TimetableSlot) => slot.day,
      render: (slot: TimetableSlot) => (
        <span className="font-semibold text-text-primary">{slot.day}</span>
      ),
    },
    {
      key: 'time',
      header: 'Time Period',
      sortable: true,
      sortValue: (slot: TimetableSlot) => slot.start,
      render: (slot: TimetableSlot) => (
        <div className="flex items-center gap-1.5 text-xs text-text-secondary font-mono">
          <Clock className="w-3.5 h-3.5 text-text-muted" aria-hidden="true" />
          <span>
            {slot.start} to {slot.end}
          </span>
        </div>
      ),
    },
    {
      key: 'code',
      header: 'Course Code',
      sortable: true,
      sortValue: (slot: TimetableSlot) => slot.code,
      render: (slot: TimetableSlot) => (
        <span className="inline-block px-2 py-0.5 rounded bg-surface-secondary text-xs font-mono font-medium text-text-primary border border-border">
          {slot.code}
        </span>
      ),
    },
    {
      key: 'subject',
      header: 'Subject Title',
      sortable: true,
      sortValue: (slot: TimetableSlot) => slot.subject,
      render: (slot: TimetableSlot) => (
        <div>
          <div className="font-medium text-text-primary text-sm">{slot.subject}</div>
          {conflictsMap.has(slot.id) && (
            <div className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mt-1">
              <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" aria-hidden="true" />
              <span>Double booked across campus</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'faculty',
      header: 'Faculty Instructor',
      sortable: true,
      sortValue: (slot: TimetableSlot) => slot.faculty,
      render: (slot: TimetableSlot) => (
        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
          <User className="w-3.5 h-3.5 text-text-muted shrink-0" aria-hidden="true" />
          <span className="truncate">{slot.faculty || 'Unassigned'}</span>
        </div>
      ),
    },
    {
      key: 'room',
      header: 'Classroom / Venue',
      sortable: true,
      sortValue: (slot: TimetableSlot) => slot.room,
      render: (slot: TimetableSlot) => (
        <div className="flex items-center gap-1.5 text-xs text-text-secondary">
          <MapPin className="w-3.5 h-3.5 text-text-muted shrink-0" aria-hidden="true" />
          <span>{slot.room || 'Venue not set'}</span>
        </div>
      ),
    },
  ]

  // Source slots for copy modal preview
  const copySourceSlots = useMemo(() => {
    return timetableSlots.filter(
      (s) => s.department === copySourceDept && s.semester === copySourceSem
    )
  }, [timetableSlots, copySourceDept, copySourceSem])

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-surface p-6 rounded-card border border-border shadow-card">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-h1 font-bold text-text-primary tracking-tight">
              Timetable Grid Editor
            </h1>
            <Badge variant="primary">Academic Schedule</Badge>
          </div>
          <p className="text-small text-text-secondary mt-1">
            Weekly academic schedule, lecture blocks, lab sessions, and classroom allocations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsCopyModalOpen(true)}
            className="gap-2"
          >
            <Copy className="w-4 h-4 text-text-muted" aria-hidden="true" />
            <span>Copy Schedule</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsClearConfirmOpen(true)}
            disabled={currentSlots.length === 0}
            className="gap-2 text-status-error hover:bg-status-error-bg hover:border-status-error/30"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
            <span>Clear Timetable</span>
          </Button>

          <Link
            to="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-button text-xs font-medium border border-border bg-canvas hover:bg-surface text-text-secondary transition-colors"
            title="View student app timetable"
          >
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Student View</span>
          </Link>

          <Button
            variant="primary"
            size="sm"
            onClick={() => handleOpenAdd()}
            className="gap-2"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Add Class Slot</span>
          </Button>
        </div>
      </div>

      {/* Selectors Bar: Department, Semester, and View Toggle */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center bg-surface p-4 rounded-card border border-border shadow-card">
        {/* Department Selector */}
        <div className="lg:col-span-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary-600 shrink-0" aria-hidden="true" />
          <div className="flex-1">
            <label htmlFor="dept-select" className="block text-xs font-semibold text-text-secondary mb-1">
              Academic Department
            </label>
            <select
              id="dept-select"
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full h-9 px-3 rounded-button border border-border bg-canvas text-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-600"
            >
              {departments.map((dept) => (
                <option key={dept.code} value={dept.code}>
                  {dept.name} ({dept.code})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Semester Selector */}
        <div className="lg:col-span-4 flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-primary-600 shrink-0" aria-hidden="true" />
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-text-secondary">
                Curriculum Semester
              </label>
              <span className="text-[11px] text-text-muted">
                Semesters 1 to {currentDept.semestersOffered || 8}
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {Array.from({ length: currentDept.semestersOffered || 8 }, (_, i) => i + 1).map((sem) => (
                <button
                  key={sem}
                  type="button"
                  onClick={() => setSelectedSem(sem)}
                  className={cn(
                    'px-2.5 py-1 text-xs font-medium rounded-button transition-colors',
                    selectedSem === sem
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-canvas text-text-secondary hover:bg-surface-secondary border border-border'
                  )}
                >
                  Sem {sem}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* View Switcher */}
        <div className="lg:col-span-4 flex items-center justify-start lg:justify-end gap-1.5 pt-2 lg:pt-0 border-t lg:border-t-0 border-border">
          <span className="text-xs font-semibold text-text-secondary mr-1">View:</span>
          <div className="inline-flex p-0.5 rounded-button bg-canvas border border-border">
            <button
              type="button"
              onClick={() => setViewMode('matrix')}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors',
                viewMode === 'matrix'
                  ? 'bg-surface text-primary-600 shadow-sm font-semibold'
                  : 'text-text-muted hover:text-text-primary'
              )}
            >
              <Grid3X3 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Weekly Grid</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('daily')}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors',
                viewMode === 'daily'
                  ? 'bg-surface text-primary-600 shadow-sm font-semibold'
                  : 'text-text-muted hover:text-text-primary'
              )}
            >
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Day View</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors',
                viewMode === 'table'
                  ? 'bg-surface text-primary-600 shadow-sm font-semibold'
                  : 'text-text-muted hover:text-text-primary'
              )}
            >
              <List className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Strip & Conflict Alert */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-surface p-3.5 rounded-card border border-border shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="text-caption text-text-muted font-medium">Scheduled Classes</div>
            <div className="text-h3 font-bold text-text-primary">{stats.totalPeriods} slots</div>
          </div>
        </div>

        <div className="bg-surface p-3.5 rounded-card border border-border shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="text-caption text-text-muted font-medium">Instruction Time</div>
            <div className="text-h3 font-bold text-text-primary">{stats.totalHours} hrs/week</div>
          </div>
        </div>

        <div className="bg-surface p-3.5 rounded-card border border-border shadow-card flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <User className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="text-caption text-text-muted font-medium">Instructors</div>
            <div className="text-h3 font-bold text-text-primary">{stats.facultyCount} faculty</div>
          </div>
        </div>

        <div className="bg-surface p-3.5 rounded-card border border-border shadow-card flex items-center gap-3">
          <div
            className={cn(
              'w-10 h-10 rounded-lg flex items-center justify-center shrink-0',
              totalConflictsCount > 0
                ? 'bg-amber-50 text-amber-600'
                : 'bg-emerald-50 text-emerald-600'
            )}
          >
            {totalConflictsCount > 0 ? (
              <AlertTriangle className="w-5 h-5" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
            )}
          </div>
          <div>
            <div className="text-caption text-text-muted font-medium">Campus Clashes</div>
            <div
              className={cn(
                'text-h3 font-bold',
                totalConflictsCount > 0 ? 'text-amber-700' : 'text-emerald-700'
              )}
            >
              {totalConflictsCount > 0
                ? `${totalConflictsCount} double bookings`
                : 'All clear'}
            </div>
          </div>
        </div>
      </div>

      {/* Conflict Explanation Banner */}
      {totalConflictsCount > 0 && (
        <div className="p-4 rounded-card border border-amber-300 bg-amber-50/70 text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
          <div className="text-small space-y-1">
            <div className="font-semibold">
              Double booking alerts detected for {totalConflictsCount} scheduled classes:
            </div>
            <p className="text-caption text-amber-800">
              One or more faculty members or room locations assigned to this schedule are also scheduled in another department at the same time. Review the amber badges on the schedule below.
            </p>
          </div>
        </div>
      )}

      {/* Main Schedule Content: Matrix, Daily, or Table */}
      {viewMode === 'matrix' && (
        <div className="bg-surface rounded-card border border-border shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse min-w-[960px] text-left text-small">
              <thead>
                <tr className="bg-canvas border-b border-border">
                  <th scope="col" className="p-3 w-36 text-xs font-semibold text-text-secondary uppercase tracking-wider border-r border-border">
                    Time Interval
                  </th>
                  {DAYS_OF_WEEK.map((day) => (
                    <th
                      key={day}
                      scope="col"
                      className="p-3 text-xs font-semibold text-text-secondary uppercase tracking-wider text-center border-r border-border last:border-r-0"
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        <span>{day}</span>
                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-surface text-[10px] font-bold text-text-muted border border-border">
                          {currentSlots.filter((s) => s.day === day).length}
                        </span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {STANDARD_PERIODS.map((period) => {
                  if (period.isBreak) {
                    return (
                      <tr key={period.label} className="bg-accent-100/30 text-center">
                        <td className="p-2.5 text-xs font-semibold text-text-muted border-r border-border">
                          {period.label}
                        </td>
                        <td
                          colSpan={DAYS_OF_WEEK.length}
                          className="p-2 text-xs font-medium text-text-muted italic tracking-wide"
                        >
                          Campus Recess / Lunch Interval
                        </td>
                      </tr>
                    )
                  }

                  return (
                    <tr key={period.label} className="hover:bg-canvas/30 transition-colors">
                      {/* Period Column */}
                      <td className="p-3 align-top font-mono text-xs text-text-secondary border-r border-border bg-canvas/40 whitespace-nowrap">
                        <div className="font-semibold text-text-primary">{period.start}</div>
                        <div className="text-[11px] text-text-muted">to {period.end}</div>
                      </td>

                      {/* Day Columns */}
                      {DAYS_OF_WEEK.map((day) => {
                        // Slots that intersect with this period
                        const matchingSlots = currentSlots.filter(
                          (s) => s.day === day && doTimesOverlap(period.start, period.end, s.start, s.end)
                        )

                        return (
                          <td
                            key={day}
                            className="p-2 align-top border-r border-border last:border-r-0 min-h-[90px] h-24 relative group"
                          >
                            {matchingSlots.length > 0 ? (
                              <div className="space-y-1.5">
                                {matchingSlots.map((slot) => {
                                  const hasConflict = conflictsMap.has(slot.id)
                                  return (
                                    <div
                                      key={slot.id}
                                      onClick={() => handleOpenEdit(slot)}
                                      className={cn(
                                        'p-2.5 rounded-card border transition-all cursor-pointer relative text-left group/card',
                                        hasConflict
                                          ? 'bg-amber-50/90 border-amber-300 hover:border-amber-400 hover:shadow-card'
                                          : 'bg-canvas hover:bg-surface border-border hover:border-primary-500 hover:shadow-card'
                                      )}
                                    >
                                      {/* Top Row: Code & Time */}
                                      <div className="flex items-center justify-between gap-1 mb-1">
                                        <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-surface border border-border text-primary-700">
                                          {slot.code}
                                        </span>
                                        <span className="text-[10px] font-mono text-text-muted">
                                          {slot.start} to {slot.end}
                                        </span>
                                      </div>

                                      {/* Subject Title */}
                                      <div className="font-semibold text-text-primary text-xs line-clamp-2" title={slot.subject}>
                                        {slot.subject}
                                      </div>

                                      {/* Details: Faculty and Room */}
                                      <div className="mt-1.5 space-y-0.5 text-[11px] text-text-secondary">
                                        <div className="flex items-center gap-1 truncate" title={slot.faculty}>
                                          <User className="w-3 h-3 text-text-muted shrink-0" aria-hidden="true" />
                                          <span className="truncate">{slot.faculty || 'Unassigned'}</span>
                                        </div>
                                        <div className="flex items-center gap-1 truncate" title={slot.room}>
                                          <MapPin className="w-3 h-3 text-text-muted shrink-0" aria-hidden="true" />
                                          <span className="truncate">{slot.room || 'Location unset'}</span>
                                        </div>
                                      </div>

                                      {/* Conflict Warning Pill */}
                                      {hasConflict && (
                                        <div className="mt-1.5 flex items-center gap-1 text-[10px] font-medium text-amber-800 bg-amber-100/80 px-1.5 py-0.5 rounded">
                                          <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" aria-hidden="true" />
                                          <span className="truncate">Double booked</span>
                                        </div>
                                      )}

                                      {/* Hover Action Strip */}
                                      <div
                                        onClick={(e) => e.stopPropagation()}
                                        className="absolute top-1.5 right-1.5 hidden group-hover/card:flex items-center gap-1 bg-surface/95 p-0.5 rounded border border-border shadow-sm z-10"
                                      >
                                        <button
                                          type="button"
                                          onClick={() => handleDuplicateToNextDay(slot)}
                                          title="Duplicate to next day"
                                          className="p-1 hover:text-primary-600 text-text-muted rounded"
                                        >
                                          <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleOpenEdit(slot)}
                                          title="Edit slot"
                                          className="p-1 hover:text-primary-600 text-text-muted rounded"
                                        >
                                          <Edit className="w-3.5 h-3.5" aria-hidden="true" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setSlotToDelete(slot)}
                                          title="Delete slot"
                                          className="p-1 hover:text-status-error text-text-muted rounded"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                                        </button>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() =>
                                  handleOpenAdd({
                                    day,
                                    start: period.start,
                                    end: period.end,
                                  })
                                }
                                className="w-full h-full min-h-[70px] border border-dashed border-border/70 rounded hover:border-primary-500 hover:bg-accent-100/30 flex items-center justify-center transition-colors group/empty"
                                title={`Add slot on ${day} at ${period.start}`}
                              >
                                <span className="opacity-0 group-hover/empty:opacity-100 transition-opacity text-xs font-medium text-primary-600 inline-flex items-center gap-1">
                                  <Plus className="w-3.5 h-3.5" aria-hidden="true" />
                                  <span>Add</span>
                                </span>
                              </button>
                            )}
                          </td>
                        )
                      })}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Daily View Mode */}
      {viewMode === 'daily' && (
        <div className="space-y-4">
          {/* Day Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-border pb-3">
            {DAYS_OF_WEEK.map((day) => {
              const daySlotCount = currentSlots.filter((s) => s.day === day).length
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setActiveDayTab(day)}
                  className={cn(
                    'px-4 py-2 rounded-button text-small font-medium transition-all inline-flex items-center gap-2',
                    activeDayTab === day
                      ? 'bg-primary-600 text-white shadow-sm'
                      : 'bg-surface text-text-secondary hover:bg-canvas border border-border'
                  )}
                >
                  <span>{day}</span>
                  <span
                    className={cn(
                      'px-1.5 py-0.5 rounded-full text-[11px] font-bold',
                      activeDayTab === day
                        ? 'bg-white/20 text-white'
                        : 'bg-canvas text-text-muted'
                    )}
                  >
                    {daySlotCount}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Slots List for selected day */}
          <div className="space-y-3">
            {currentSlots.filter((s) => s.day === activeDayTab).length === 0 ? (
              <div className="p-8 text-center bg-surface rounded-card border border-dashed border-border">
                <Calendar className="w-10 h-10 text-text-muted mx-auto mb-2 opacity-50" aria-hidden="true" />
                <h3 className="text-small font-semibold text-text-primary">
                  No classes scheduled for {activeDayTab}
                </h3>
                <p className="text-caption text-text-secondary mt-1">
                  Click below to add a lecture or lab session for {selectedDept} Semester {selectedSem}.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleOpenAdd({ day: activeDayTab })}
                  className="mt-4 gap-2"
                >
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  <span>Add Class on {activeDayTab}</span>
                </Button>
              </div>
            ) : (
              currentSlots
                .filter((s) => s.day === activeDayTab)
                .sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start))
                .map((slot) => {
                  const conflict = conflictsMap.get(slot.id)
                  return (
                    <div
                      key={slot.id}
                      className={cn(
                        'p-4 rounded-card border bg-surface shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4',
                        conflict ? 'border-amber-300 ring-1 ring-amber-300/40' : 'border-border'
                      )}
                    >
                      <div className="flex items-start md:items-center gap-4">
                        <div className="w-28 shrink-0">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-text-primary">
                            <Clock className="w-3.5 h-3.5 text-text-muted" aria-hidden="true" />
                            <span>
                              {slot.start} to {slot.end}
                            </span>
                          </div>
                          <span className="font-mono text-xs text-text-muted">{slot.code}</span>
                        </div>

                        <div>
                          <h3 className="text-base font-semibold text-text-primary">
                            {slot.subject}
                          </h3>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-text-secondary">
                            <span className="inline-flex items-center gap-1">
                              <User className="w-3.5 h-3.5 text-text-muted" aria-hidden="true" />
                              {slot.faculty || 'Instructor unassigned'}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-text-muted" aria-hidden="true" />
                              {slot.room || 'Location not set'}
                            </span>
                          </div>

                          {conflict && (
                            <div className="mt-2 text-xs text-amber-800 bg-amber-50 p-2 rounded border border-amber-200 space-y-0.5">
                              {conflict.facultyConflicts.map((c, idx) => (
                                <div key={idx} className="flex items-center gap-1.5">
                                  <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" aria-hidden="true" />
                                  <span>{c}</span>
                                </div>
                              ))}
                              {conflict.roomConflicts.map((c, idx) => (
                                <div key={idx} className="flex items-center gap-1.5">
                                  <AlertTriangle className="w-3 h-3 text-amber-600 shrink-0" aria-hidden="true" />
                                  <span>{c}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleDuplicateToNextDay(slot)}
                          title="Duplicate to next day"
                          className="gap-1.5 text-xs"
                        >
                          <Copy className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Duplicate</span>
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleOpenEdit(slot)}
                          className="gap-1.5 text-xs"
                        >
                          <Edit className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Edit</span>
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setSlotToDelete(slot)}
                          className="gap-1.5 text-xs text-status-error hover:bg-status-error-bg"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Delete</span>
                        </Button>
                      </div>
                    </div>
                  )
                })
            )}

            <Button
              variant="secondary"
              size="sm"
              onClick={() => handleOpenAdd({ day: activeDayTab })}
              className="w-full py-3 border-dashed gap-2"
            >
              <Plus className="w-4 h-4 text-text-muted" aria-hidden="true" />
              <span>Add Another Class on {activeDayTab}</span>
            </Button>
          </div>
        </div>
      )}

      {/* Table View Mode */}
      {viewMode === 'table' && (
        <DataTable<TimetableSlot>
          data={currentSlots}
          columns={tableColumns}
          keyField="id"
          searchPlaceholder="Search classes by subject, code, instructor, or room..."
          searchFilter={(slot, q) =>
            slot.subject.toLowerCase().includes(q) ||
            slot.code.toLowerCase().includes(q) ||
            slot.faculty.toLowerCase().includes(q) ||
            slot.room.toLowerCase().includes(q) ||
            slot.day.toLowerCase().includes(q)
          }
          onRowClick={(slot) => handleOpenEdit(slot)}
          rowActions={(slot) => [
            {
              label: 'Edit Slot',
              icon: <Edit className="w-4 h-4" aria-hidden="true" />,
              onClick: () => handleOpenEdit(slot),
            },
            {
              label: 'Duplicate to Next Day',
              icon: <Copy className="w-4 h-4" aria-hidden="true" />,
              onClick: () => handleDuplicateToNextDay(slot),
            },
            {
              label: 'Delete Slot',
              icon: <Trash2 className="w-4 h-4 text-status-error" aria-hidden="true" />,
              variant: 'danger',
              onClick: () => setSlotToDelete(slot),
            },
          ]}
          emptyState={{
            title: `No classes scheduled for ${selectedDept} Semester ${selectedSem}`,
            message: 'Add schedule slots or copy a schedule from another department.',
            actionLabel: 'Add First Class Slot',
            onAction: () => handleOpenAdd(),
          }}
        />
      )}

      {/* ========================================================================= */}
      {/* Slot Modal: Add / Edit                                                    */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isSlotModalOpen}
        onClose={() => setIsSlotModalOpen(false)}
        title={isEditing ? 'Edit Class Slot' : 'Add Class Slot'}
        description={`Schedule an academic class or lab for ${selectedDept} Semester ${selectedSem}.`}
        maxWidth="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <div>
              {isEditing && formData.id && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const slot = currentSlots.find((s) => s.id === formData.id)
                    if (slot) setSlotToDelete(slot)
                  }}
                  className="text-status-error hover:bg-status-error-bg"
                >
                  <Trash2 className="w-4 h-4 mr-1.5" aria-hidden="true" />
                  <span>Delete Slot</span>
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsSlotModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={!formValidation.isValid || isSaving}
                onClick={handleSaveSlot}
              >
                {isSaving ? 'Saving...' : isEditing ? 'Save Changes' : 'Schedule Slot'}
              </Button>
            </div>
          </div>
        }
      >
        <form onSubmit={handleSaveSlot} className="space-y-4">
          {/* Overlap Error Banner (STRICT) */}
          {formValidation.overlapError && (
            <div className="p-3 rounded-card bg-status-error-bg border border-status-error/30 text-status-error text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <span className="font-semibold">Schedule Conflict: </span>
                <span>{formValidation.overlapError}</span>
              </div>
            </div>
          )}

          {/* Double Booking Warning Banners (NOTICE) */}
          {(formValidation.facultyWarnings.length > 0 || formValidation.roomWarnings.length > 0) && (
            <div className="p-3 rounded-card bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
              <div className="font-semibold flex items-center gap-1.5 text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" aria-hidden="true" />
                <span>Notice: Cross-department double booking detected</span>
              </div>
              {formValidation.facultyWarnings.map((msg, i) => (
                <p key={i} className="pl-5 text-amber-800">
                  {msg}
                </p>
              ))}
              {formValidation.roomWarnings.map((msg, i) => (
                <p key={i} className="pl-5 text-amber-800">
                  {msg}
                </p>
              ))}
              <p className="pl-5 text-[11px] text-amber-700 italic">
                Note: This notice does not block saving. You may proceed if this room or faculty is shared.
              </p>
            </div>
          )}

          {/* Day & Time Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <SelectField
              label="Day of Week"
              name="day"
              required
              value={formData.day}
              onChange={(e) => setFormData((prev) => ({ ...prev, day: e.target.value as DayOfWeek }))}
              options={DAYS_OF_WEEK.map((d) => ({ value: d, label: d }))}
            />

            <TimePickerField
              label="Start Time"
              required
              value={formData.start}
              onChange={(val) => setFormData((prev) => ({ ...prev, start: val }))}
            />

            <TimePickerField
              label="End Time"
              required
              value={formData.end}
              onChange={(val) => setFormData((prev) => ({ ...prev, end: val }))}
            />
          </div>

          {/* Subject & Code */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <TextField
                label="Subject / Course Title"
                name="subject"
                required
                placeholder="e.g. Deep Learning & Neural Architectures"
                value={formData.subject}
                onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
              />
            </div>
            <div>
              <TextField
                label="Course Code"
                name="code"
                required
                placeholder="e.g. AI501PC"
                value={formData.code}
                onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
              />
            </div>
          </div>

          {/* Faculty Instructor */}
          <div>
            <SearchableSelect
              label="Faculty Instructor"
              value={formData.faculty}
              onChange={(val) => setFormData((prev) => ({ ...prev, faculty: val }))}
              placeholder="Search or select faculty professor..."
              options={facultyList.map((f) => ({
                value: f.name,
                label: `${f.name} (${f.designation}, ${f.departmentId})`,
              }))}
            />
          </div>

          {/* Location & Room */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <SearchableSelect
                label="Campus Location Venue"
                value={formData.locationId}
                onChange={(val) => {
                  const loc = locations.find((l) => l.id === val)
                  setFormData((prev) => ({
                    ...prev,
                    locationId: val,
                    room: prev.room && prev.room !== '' ? prev.room : loc ? loc.name : '',
                  }))
                }}
                placeholder="Search campus venue..."
                options={locations.map((loc) => ({
                  value: loc.id,
                  label: `${loc.name} (${loc.building}, Floor ${loc.floor})`,
                }))}
              />
            </div>

            <div>
              <TextField
                label="Room Label / Desk"
                name="room"
                required
                placeholder="e.g. Room 204 or Classroom 305"
                value={formData.room}
                onChange={(e) => setFormData((prev) => ({ ...prev, room: e.target.value }))}
                helperText="Display room name for students in the app"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* ========================================================================= */}
      {/* Copy Timetable Modal                                                      */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isCopyModalOpen}
        onClose={() => setIsCopyModalOpen(false)}
        title="Copy Timetable Schedule"
        description={`Copy all scheduled classes from another department and semester into ${selectedDept} Semester ${selectedSem}.`}
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsCopyModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              disabled={copySourceSlots.length === 0}
              onClick={handleExecuteCopy}
            >
              Copy & Replace Schedule
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="copy-source-dept" className="block text-xs font-semibold text-text-secondary mb-1">
                Source Department
              </label>
              <select
                id="copy-source-dept"
                value={copySourceDept}
                onChange={(e) => setCopySourceDept(e.target.value)}
                className="w-full h-9 px-3 rounded-button border border-border bg-canvas text-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-600"
              >
                {departments.map((dept) => (
                  <option key={dept.code} value={dept.code}>
                    {dept.name} ({dept.code})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="copy-source-sem" className="block text-xs font-semibold text-text-secondary mb-1">
                Source Semester
              </label>
              <select
                id="copy-source-sem"
                value={copySourceSem}
                onChange={(e) => setCopySourceSem(parseInt(e.target.value, 10))}
                className="w-full h-9 px-3 rounded-button border border-border bg-canvas text-small text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-600"
              >
                {Array.from({ length: 8 }, (_, i) => i + 1).map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="p-3.5 rounded-card bg-canvas border border-border space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-muted">Source classes found:</span>
              <span className="font-bold text-text-primary">
                {copySourceSlots.length} classes
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-muted">Current target classes:</span>
              <span className="font-bold text-text-primary">
                {currentSlots.length} classes
              </span>
            </div>
          </div>

          <div className="p-3 rounded-card bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
            <p>
              Warning: Confirming will replace all {currentSlots.length} existing scheduled classes in {selectedDept} Semester {selectedSem} with {copySourceSlots.length} classes from {copySourceDept} Semester {copySourceSem}.
            </p>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* Delete Slot Confirmation Dialog                                           */}
      {/* ========================================================================= */}
      <ConfirmDialog
        isOpen={Boolean(slotToDelete)}
        onClose={() => setSlotToDelete(null)}
        onConfirm={handleDeleteSlot}
        title="Delete Class Slot"
        message={`Are you sure you want to remove "${slotToDelete?.code}: ${slotToDelete?.subject}" from ${slotToDelete?.day} (${slotToDelete?.start} to ${slotToDelete?.end})?`}
        confirmText="Delete Slot"
        variant="danger"
      />

      {/* ========================================================================= */}
      {/* Clear Timetable Confirmation Dialog                                       */}
      {/* ========================================================================= */}
      <ConfirmDialog
        isOpen={isClearConfirmOpen}
        onClose={() => setIsClearConfirmOpen(false)}
        onConfirm={handleExecuteClear}
        title="Clear Timetable Schedule"
        message={`Are you sure you want to permanently clear all ${currentSlots.length} classes for ${selectedDept} Semester ${selectedSem}? This action cannot be undone.`}
        confirmText="Clear All Classes"
        variant="danger"
      />
    </div>
  )
}
