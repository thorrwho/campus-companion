import React, { useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Mail,
  Calendar,
  GraduationCap,
  Clock,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  Edit,
  ExternalLink,
  Users,
  CheckCircle,
  XCircle,
  Tag,
  MapPin,
} from 'lucide-react'
import { useContentStore } from '@/store/useContentStore'
import { useActivityLogStore } from '@/store/useActivityLogStore'
import { useToastStore } from '@/store/useToastStore'
import { useAdminAuthStore } from '@/store/useAdminAuthStore'
import { useAuthStore } from '@/store/useAuthStore'
import { DepartmentCode, EventRegistration } from '@/types'
import {
  ConfirmDialog,
  SelectField,
} from '@/components/admin'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { cn } from '@/lib/utils'

export const StudentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const {
    students,
    departments,
    events,
    clubs,
    locations,
    eventRegistrations,
    updateItem,
    removeItem,
  } = useContentStore()

  const { adminUser } = useAdminAuthStore()
  const { addActivity } = useActivityLogStore()
  const { push: pushToast } = useToastStore()

  // Find target student
  const student = useMemo(() => {
    return students.find((s) => s.id === id) || null
  }, [students, id])

  // Modals state
  const [isEditAcademicOpen, setIsEditAcademicOpen] = useState(false)
  const [editDept, setEditDept] = useState<DepartmentCode>('CSE-AIML')
  const [editSem, setEditSem] = useState<number>(5)

  const [isSuspendConfirmOpen, setIsSuspendConfirmOpen] = useState(false)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)

  // Club unenroll confirmation
  const [clubToLeave, setClubToLeave] = useState<string | null>(null)

  // Registration to remove confirmation
  const [regToRemove, setRegToRemove] = useState<EventRegistration | null>(null)

  // Department metadata
  const departmentInfo = useMemo(() => {
    if (!student) return null
    return departments.find((d) => d.code === student.department) || {
      name: student.department,
      code: student.department,
    }
  }, [departments, student])

  // Joined clubs list
  const joinedClubs = useMemo(() => {
    if (!student || !student.joinedClubIds) return []
    return clubs.filter((c) => student.joinedClubIds?.includes(c.id))
  }, [clubs, student])

  // Student registrations with event objects
  const studentRegistrations = useMemo(() => {
    if (!student) return []
    const regs = eventRegistrations.filter((r) => r.studentId === student.id)
    return regs.map((reg) => {
      const eventObj = events.find((e) => e.id === reg.eventId)
      const locationObj = eventObj ? locations.find((l) => l.id === eventObj.locationId) : null
      return {
        registration: reg,
        event: eventObj,
        location: locationObj,
      }
    })
  }, [eventRegistrations, events, locations, student])

  if (!student) {
    return (
      <div className="p-8 text-center bg-surface rounded-card border border-border shadow-card max-w-xl mx-auto my-12">
        <Users className="w-12 h-12 text-text-muted mx-auto mb-3 opacity-60" aria-hidden="true" />
        <h2 className="text-h2 font-bold text-text-primary">Student Not Found</h2>
        <p className="text-small text-text-secondary mt-1">
          The requested student profile does not exist or may have been deleted.
        </p>
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate('/admin/students')}
          className="mt-4 gap-2"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to Students Registry</span>
        </Button>
      </div>
    )
  }

  const isSuspended = student.status === 'Suspended'

  // Open Edit Academic Modal
  const handleOpenEditAcademic = () => {
    setEditDept(student.department)
    setEditSem(student.semester)
    setIsEditAcademicOpen(true)
  }

  // Save Academic Changes
  const handleSaveAcademic = () => {
    updateItem(
      'students',
      student.id,
      {
        department: editDept,
        semester: editSem,
      },
      adminUser?.email
    )

    addActivity({
      userEmail: adminUser?.email || 'admin@demo.edu',
      userName: adminUser?.name || 'Administrator',
      action: 'update',
      itemType: 'student',
      itemId: student.id,
      itemName: `${student.name} (${student.rollNo})`,
      summary: `Updated academic branch to ${editDept} and semester to Sem ${editSem}`,
    })

    pushToast({
      type: 'success',
      message: `Updated academic enrollment for ${student.name}.`,
    })

    setIsEditAcademicOpen(false)
  }

  // Toggle Suspend / Reactivate
  const handleToggleSuspend = () => {
    const nextStatus = isSuspended ? 'Active' : 'Suspended'

    updateItem(
      'students',
      student.id,
      { status: nextStatus },
      adminUser?.email
    )

    // If currently logged in as this student in student app, log them out
    if (nextStatus === 'Suspended') {
      const activeStudent = useAuthStore.getState().user
      if (activeStudent && activeStudent.id === student.id) {
        useAuthStore.getState().logout()
      }
    }

    addActivity({
      userEmail: adminUser?.email || 'admin@demo.edu',
      userName: adminUser?.name || 'Administrator',
      action: isSuspended ? 'reactivate' : 'suspend',
      itemType: 'student',
      itemId: student.id,
      itemName: `${student.name} (${student.rollNo})`,
      summary: isSuspended
        ? 'Reactivated student account access'
        : 'Suspended student account access (login restricted)',
    })

    pushToast({
      type: isSuspended ? 'success' : 'info',
      message: `${student.name} is now ${nextStatus.toLowerCase()}.`,
    })

    setIsSuspendConfirmOpen(false)
  }

  // Delete Student
  const handleDeleteStudent = () => {
    removeItem('students', student.id)

    // If student is logged in, log out
    const activeStudent = useAuthStore.getState().user
    if (activeStudent && activeStudent.id === student.id) {
      useAuthStore.getState().logout()
    }

    addActivity({
      userEmail: adminUser?.email || 'admin@demo.edu',
      userName: adminUser?.name || 'Administrator',
      action: 'delete',
      itemType: 'student',
      itemId: student.id,
      itemName: `${student.name} (${student.rollNo})`,
      summary: `Deleted student account and unlinked records`,
    })

    pushToast({
      type: 'info',
      message: `Deleted student ${student.name}.`,
    })

    navigate('/admin/students')
  }

  // Remove from club
  const handleRemoveClub = (clubId: string) => {
    const updatedClubs = (student.joinedClubIds || []).filter((cid) => cid !== clubId)
    updateItem(
      'students',
      student.id,
      { joinedClubIds: updatedClubs },
      adminUser?.email
    )

    const clubObj = clubs.find((c) => c.id === clubId)

    addActivity({
      userEmail: adminUser?.email || 'admin@demo.edu',
      userName: adminUser?.name || 'Administrator',
      action: 'update',
      itemType: 'club',
      itemId: clubId,
      itemName: clubObj?.name || 'Club',
      summary: `Removed ${student.name} from club membership roster`,
    })

    pushToast({
      type: 'info',
      message: `Removed ${student.name} from ${clubObj?.name || 'club'}.`,
    })

    setClubToLeave(null)
  }

  // Toggle Event Attendance
  const handleToggleAttendance = (registration: EventRegistration) => {
    const nextAttended = !registration.attended

    updateItem(
      'eventRegistrations',
      registration.id,
      { attended: nextAttended },
      adminUser?.email
    )

    const eventObj = events.find((e) => e.id === registration.eventId)

    addActivity({
      userEmail: adminUser?.email || 'admin@demo.edu',
      userName: adminUser?.name || 'Administrator',
      action: 'update',
      itemType: 'registration',
      itemId: registration.id,
      itemName: `${student.name} in ${eventObj?.title || 'Event'}`,
      summary: `Marked attendance as ${nextAttended ? 'Attended' : 'Unattended'}`,
    })

    pushToast({
      type: 'success',
      message: `Marked ${student.name} as ${nextAttended ? 'attended' : 'unattended'}.`,
    })
  }

  // Cancel Event Registration
  const handleCancelRegistration = () => {
    if (!regToRemove) return

    removeItem('eventRegistrations', regToRemove.id)

    // Also update student's registeredEventIds
    const updatedEvents = (student.registeredEventIds || []).filter((eid) => eid !== regToRemove.eventId)
    updateItem('students', student.id, { registeredEventIds: updatedEvents }, adminUser?.email)

    const eventObj = events.find((e) => e.id === regToRemove.eventId)

    addActivity({
      userEmail: adminUser?.email || 'admin@demo.edu',
      userName: adminUser?.name || 'Administrator',
      action: 'delete',
      itemType: 'registration',
      itemId: regToRemove.id,
      itemName: `${student.name} in ${eventObj?.title || 'Event'}`,
      summary: `Cancelled event registration for ${student.name}`,
    })

    pushToast({
      type: 'info',
      message: `Cancelled registration for ${eventObj?.title || 'event'}.`,
    })

    setRegToRemove(null)
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/admin/students"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Back to Students Registry</span>
        </Link>
      </div>

      {/* Header Profile Hero Card */}
      <div className="bg-surface p-6 rounded-card border border-border shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start sm:items-center gap-4">
          <Avatar
            initials={student.avatarInitials}
            size="lg"
            className="w-16 h-16 text-xl font-bold border-2 border-primary-500/20 shrink-0"
          />

          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-h1 font-bold text-text-primary">{student.name}</h1>
              <Badge variant={isSuspended ? 'error' : 'success'} dot>
                {isSuspended ? 'Account Suspended' : 'Active Student'}
              </Badge>
              {student.role === 'admin' && (
                <Badge variant="primary">Campus Administrator</Badge>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5 text-xs text-text-secondary">
              <span className="font-mono font-semibold text-text-primary">
                Roll No: {student.rollNo}
              </span>
              <span>
                Department: <strong className="text-text-primary">{student.department}</strong>
              </span>
              <span>
                Curriculum: <strong className="text-text-primary">Semester {student.semester}</strong>
              </span>
              {student.section && (
                <span>
                  Section: <strong className="text-text-primary">{student.section}</strong>
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleOpenEditAcademic}
            className="gap-1.5"
          >
            <Edit className="w-4 h-4 text-text-muted" aria-hidden="true" />
            <span>Edit Branch & Sem</span>
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsSuspendConfirmOpen(true)}
            className={cn(
              'gap-1.5',
              isSuspended
                ? 'text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300'
                : 'text-amber-700 hover:bg-amber-50 hover:border-amber-300'
            )}
          >
            {isSuspended ? (
              <>
                <ShieldCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                <span>Reactivate Account</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-4 h-4 text-amber-600" aria-hidden="true" />
                <span>Suspend Account</span>
              </>
            )}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsDeleteConfirmOpen(true)}
            className="gap-1.5 text-status-error hover:bg-status-error-bg hover:border-status-error/30"
          >
            <Trash2 className="w-4 h-4" aria-hidden="true" />
            <span>Delete Student</span>
          </Button>
        </div>
      </div>

      {/* Grid: Profile Details & Academic Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Contact & Personal Info (7 cols) */}
        <div className="lg:col-span-7 bg-surface p-6 rounded-card border border-border shadow-card space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <Mail className="w-4 h-4 text-primary-600" aria-hidden="true" />
            <h2 className="text-small font-bold text-text-primary uppercase tracking-wider">
              Contact & Personal Details
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-small">
            <div>
              <span className="text-caption text-text-muted block">Email Address</span>
              <span className="font-mono text-text-primary select-all">{student.email}</span>
            </div>

            <div>
              <span className="text-caption text-text-muted block">Phone Number</span>
              <span className="text-text-primary font-mono">{student.phone || 'Not provided'}</span>
            </div>

            <div>
              <span className="text-caption text-text-muted block">Enrolled Date</span>
              <span className="text-text-primary">
                {student.joinedAt ? student.joinedAt.slice(0, 10) : 'Initial Seed Data'}
              </span>
            </div>

            <div>
              <span className="text-caption text-text-muted block">Emergency Contact</span>
              <span className="text-text-primary">
                {student.emergencyContactName ? (
                  <>
                    {student.emergencyContactName}{' '}
                    <span className="text-text-muted font-mono text-xs">
                      ({student.emergencyContactPhone || 'No phone'})
                    </span>
                  </>
                ) : (
                  'Not specified'
                )}
              </span>
            </div>
          </div>

          {student.bio && (
            <div className="pt-2 border-t border-border">
              <span className="text-caption text-text-muted block mb-1">Student Biography</span>
              <p className="text-small text-text-secondary leading-relaxed">{student.bio}</p>
            </div>
          )}

          {student.interests && student.interests.length > 0 && (
            <div className="pt-2 border-t border-border">
              <span className="text-caption text-text-muted block mb-1.5">Areas of Interest</span>
              <div className="flex flex-wrap gap-1.5">
                {student.interests.map((interest) => (
                  <span
                    key={interest}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-secondary text-xs text-text-secondary border border-border capitalize"
                  >
                    <Tag className="w-3 h-3 text-text-muted" aria-hidden="true" />
                    <span>{interest}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Academic Card (5 cols) */}
        <div className="lg:col-span-5 bg-surface p-6 rounded-card border border-border shadow-card space-y-4">
          <div className="flex items-center gap-2 border-b border-border pb-3">
            <GraduationCap className="w-4 h-4 text-primary-600" aria-hidden="true" />
            <h2 className="text-small font-bold text-text-primary uppercase tracking-wider">
              Academic Status
            </h2>
          </div>

          <div className="space-y-3 text-small">
            <div className="flex items-center justify-between py-1 border-b border-border/60">
              <span className="text-text-secondary">Degree Department</span>
              <span className="font-semibold text-text-primary">{departmentInfo?.name}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-border/60">
              <span className="text-text-secondary">Department Code</span>
              <span className="font-mono font-bold text-primary-700 px-2 py-0.5 rounded bg-surface-secondary border border-border">
                {student.department}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-border/60">
              <span className="text-text-secondary">Current Semester</span>
              <Badge variant="primary">Semester {student.semester}</Badge>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-border/60">
              <span className="text-text-secondary">Class Section</span>
              <span className="font-medium text-text-primary">{student.section || 'A'}</span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-border/60">
              <span className="text-text-secondary">Cumulative CGPA</span>
              <span className="font-semibold text-text-primary">
                {student.cgpa ? `${student.cgpa} / 10.0` : '8.5 / 10.0 (simulated)'}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-text-secondary">Lecture Attendance</span>
              <span className="font-semibold text-emerald-700">
                {student.attendance || '92%'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Joined Clubs Section */}
      <div className="bg-surface p-6 rounded-card border border-border shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-primary-600" aria-hidden="true" />
            <h2 className="text-small font-bold text-text-primary uppercase tracking-wider">
              Enrolled Clubs & Societies ({joinedClubs.length})
            </h2>
          </div>
        </div>

        {joinedClubs.length === 0 ? (
          <div className="py-6 text-center text-text-muted text-xs">
            This student has not joined any campus clubs yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {joinedClubs.map((club) => (
              <div
                key={club.id}
                className="p-3.5 rounded-card border border-border bg-canvas hover:bg-surface transition-colors flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-white font-bold text-xs"
                    style={{ backgroundColor: club.color || '#2563EB' }}
                  >
                    {club.name[0]}
                  </div>
                  <div className="truncate">
                    <Link
                      to={`/admin/clubs/${club.id}/members`}
                      className="font-semibold text-xs text-text-primary hover:text-primary-600 truncate block"
                    >
                      {club.name}
                    </Link>
                    <span className="text-[11px] text-text-muted capitalize">{club.category}</span>
                  </div>
                </div>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setClubToLeave(club.id)}
                  className="text-[11px] h-7 px-2 text-status-error hover:bg-status-error-bg shrink-0"
                  title="Remove from club"
                >
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Registered Events Section */}
      <div className="bg-surface p-6 rounded-card border border-border shadow-card space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary-600" aria-hidden="true" />
            <h2 className="text-small font-bold text-text-primary uppercase tracking-wider">
              Event Registrations & Attendance ({studentRegistrations.length})
            </h2>
          </div>

          <Link
            to="/admin/registrations"
            className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center gap-1"
          >
            <span>All Registrations Database</span>
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>

        {studentRegistrations.length === 0 ? (
          <div className="py-6 text-center text-text-muted text-xs">
            This student has not registered for any campus events yet.
          </div>
        ) : (
          <div className="divide-y divide-border border border-border rounded-card overflow-hidden">
            {studentRegistrations.map(({ registration, event, location }) => (
              <div
                key={registration.id}
                className="p-4 bg-canvas hover:bg-surface transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-small text-text-primary">
                      {event?.title || 'Campus Event'}
                    </span>
                    {event?.category && (
                      <Badge variant="neutral" className="capitalize text-[11px]">
                        {event.category}
                      </Badge>
                    )}
                    <Badge variant={registration.attended ? 'success' : 'neutral'} dot>
                      {registration.attended ? 'Attended' : 'Registered'}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-secondary">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-text-muted" aria-hidden="true" />
                      <span>{event?.date || 'Date TBD'}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-text-muted" aria-hidden="true" />
                      <span>
                        {event?.startTime} to {event?.endTime}
                      </span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-text-muted" aria-hidden="true" />
                      <span>{location ? location.name : 'Main Campus'}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <Button
                    variant={registration.attended ? 'secondary' : 'primary'}
                    size="sm"
                    onClick={() => handleToggleAttendance(registration)}
                    className="gap-1.5 text-xs"
                  >
                    {registration.attended ? (
                      <>
                        <XCircle className="w-3.5 h-3.5 text-text-muted" aria-hidden="true" />
                        <span>Mark Unattended</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                        <span>Mark Attended</span>
                      </>
                    )}
                  </Button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setRegToRemove(registration)}
                    className="gap-1.5 text-xs text-status-error hover:bg-status-error-bg"
                  >
                    <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Cancel Registration</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* Edit Academic Branch & Semester Modal                                      */}
      {/* ========================================================================= */}
      <Modal
        isOpen={isEditAcademicOpen}
        onClose={() => setIsEditAcademicOpen(false)}
        title="Update Academic Branch & Semester"
        description={`Modify enrollment information for ${student.name} (${student.rollNo}).`}
        maxWidth="sm"
        footer={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => setIsEditAcademicOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleSaveAcademic}
            >
              Save Changes
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <SelectField
            label="Degree Department"
            name="dept"
            required
            value={editDept}
            onChange={(e) => setEditDept(e.target.value as DepartmentCode)}
            options={departments.map((d) => ({
              value: d.code,
              label: `${d.name} (${d.code})`,
            }))}
          />

          <SelectField
            label="Current Semester"
            name="sem"
            required
            value={String(editSem)}
            onChange={(e) => setEditSem(parseInt(e.target.value, 10))}
            options={Array.from({ length: 8 }, (_, i) => ({
              value: String(i + 1),
              label: `Semester ${i + 1}`,
            }))}
          />
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* Suspend / Reactivate Confirmation Dialog                                  */}
      {/* ========================================================================= */}
      <ConfirmDialog
        isOpen={isSuspendConfirmOpen}
        onClose={() => setIsSuspendConfirmOpen(false)}
        onConfirm={handleToggleSuspend}
        title={isSuspended ? 'Reactivate Student Account' : 'Suspend Student Account'}
        message={
          isSuspended
            ? `Reactivating will restore ${student.name}'s ability to sign in to the student portal.`
            : `Are you sure you want to suspend "${student.name}"? The student will immediately be logged out and will receive an "Account suspended" notification if they attempt to sign in.`
        }
        confirmText={isSuspended ? 'Reactivate Account' : 'Suspend Account'}
        variant={isSuspended ? 'primary' : 'warning'}
      />

      {/* ========================================================================= */}
      {/* Delete Student Confirmation Dialog                                        */}
      {/* ========================================================================= */}
      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteStudent}
        title="Permanently Delete Student"
        message={`Are you sure you want to delete ${student.name} (${student.rollNo})? All associated event registrations will also be removed. This action cannot be undone.`}
        confirmText="Delete Student"
        variant="danger"
      />

      {/* ========================================================================= */}
      {/* Remove from Club Confirmation Dialog                                      */}
      {/* ========================================================================= */}
      <ConfirmDialog
        isOpen={Boolean(clubToLeave)}
        onClose={() => setClubToLeave(null)}
        onConfirm={() => {
          if (clubToLeave) handleRemoveClub(clubToLeave)
        }}
        title="Remove Student from Club"
        message={`Are you sure you want to remove ${student.name} from this club's membership roster?`}
        confirmText="Remove from Club"
        variant="danger"
      />

      {/* ========================================================================= */}
      {/* Cancel Event Registration Dialog                                          */}
      {/* ========================================================================= */}
      <ConfirmDialog
        isOpen={Boolean(regToRemove)}
        onClose={() => setRegToRemove(null)}
        onConfirm={handleCancelRegistration}
        title="Cancel Event Registration"
        message={`Are you sure you want to cancel ${student.name}'s registration for this event?`}
        confirmText="Cancel Registration"
        variant="danger"
      />
    </div>
  )
}
