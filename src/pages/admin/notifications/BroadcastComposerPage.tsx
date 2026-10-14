import React, { useState, useMemo, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Bell,
  Users,
  Smartphone,
  ExternalLink,
} from 'lucide-react'
import { useContentStore } from '@/store/useContentStore'
import { useUserStore } from '@/store/useUserStore'
import { useActivityLogStore } from '@/store/useActivityLogStore'
import { useToastStore } from '@/store/useToastStore'
import { useAdminAuthStore } from '@/store/useAdminAuthStore'
import {
  BroadcastNotification,
  NotificationType,
  DepartmentCode,
} from '@/types'
import {
  AdminForm,
  FormSection,
  TextField,
  TextArea,
  SelectField,
  MultiSelectField,
  DatePickerField,
  TimePickerField,
  PreviewPanel,
} from '@/components/admin'
import { Button } from '@/components/ui/Button'

export const BroadcastComposerPage: React.FC = () => {
  const navigate = useNavigate()
  const { students, departments, createItem } = useContentStore()
  const { addNotification } = useUserStore()
  const { addActivity } = useActivityLogStore()
  const { push: pushToast } = useToastStore()
  const { adminUser } = useAdminAuthStore()

  // Form states
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [type, setType] = useState<NotificationType>('announcement')
  const [actionLink, setActionLink] = useState('')

  // Audience targeting
  const [audienceScope, setAudienceScope] = useState<'all' | 'specific'>('all')
  const [selectedDepts, setSelectedDepts] = useState<string[]>([])
  const [selectedSemesters, setSelectedSemesters] = useState<string[]>([])

  // Delivery timing
  const [deliveryTiming, setDeliveryTiming] = useState<'immediate' | 'scheduled'>('immediate')
  const [scheduledDate, setScheduledDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [scheduledTime, setScheduledTime] = useState('10:00')

  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Live matching recipients calculation
  const matchingStudents = useMemo(() => {
    if (audienceScope === 'all') {
      return students
    }
    return students.filter((student) => {
      const matchDept =
        selectedDepts.length === 0 ||
        selectedDepts.some((selectedId) => {
          const deptObj = departments.find(
            (d) => d.id === selectedId || d.code === selectedId
          )
          return deptObj
            ? deptObj.code === student.department
            : selectedId === student.department
        })
      const matchSem =
        selectedSemesters.length === 0 ||
        selectedSemesters.includes(String(student.semester))
      return matchDept && matchSem
    })
  }, [students, departments, audienceScope, selectedDepts, selectedSemesters])

  const markDirty = () => {
    if (!isDirty) setIsDirty(true)
  }

  // Validation
  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!title.trim()) {
      errs.title = 'Notification title is required'
    } else if (title.trim().length < 4) {
      errs.title = 'Title must be at least 4 characters'
    }

    if (!message.trim()) {
      errs.message = 'Notification message is required'
    } else if (message.trim().length < 10) {
      errs.message = 'Message must be at least 10 characters'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // Handle Dispatch
  const handleDispatch = async () => {
    if (!validate()) {
      pushToast({
        type: 'error',
        message: 'Please complete all required fields.',
      })
      return
    }

    setIsSubmitting(true)
    const isScheduled = deliveryTiming === 'scheduled'
    const scheduledIso = isScheduled
      ? `${scheduledDate}T${scheduledTime}:00`
      : undefined

    const broadcastData: Omit<BroadcastNotification, 'id' | 'createdAt' | 'updatedAt'> = {
      title: title.trim(),
      message: message.trim(),
      type,
      link: actionLink.trim() || undefined,
      audience:
        audienceScope === 'all'
          ? { type: 'all' }
          : {
              type: 'specific',
              departments: selectedDepts as DepartmentCode[],
              semesters: selectedSemesters.map((s) => Number(s)),
            },
      status: isScheduled ? 'scheduled' : 'sent',
      sentAt: isScheduled ? undefined : new Date().toISOString(),
      scheduledFor: scheduledIso,
      recipientsCount: matchingStudents.length,
      readCount: 0,
    }

    // Simulate 600ms latency
    await new Promise((resolve) => setTimeout(resolve, 600))

    const created = createItem('notifications', broadcastData, adminUser?.email)

    // If sent immediately, dispatch directly to active student store
    if (!isScheduled) {
      addNotification({
        id: created.id,
        type,
        title: title.trim(),
        body: message.trim(),
        createdAt: new Date().toISOString(),
        read: false,
        link: actionLink.trim() || '/notifications',
      })
    }

    addActivity({
      userEmail: adminUser?.email || 'admin@demo.edu',
      userName: adminUser?.name || 'Administrator',
      action: 'create',
      itemType: 'notification',
      itemId: created.id,
      itemName: created.title,
      summary: isScheduled
        ? `Scheduled broadcast for ${scheduledIso} to ${matchingStudents.length} recipients`
        : `Sent push broadcast to ${matchingStudents.length} recipients`,
    })

    pushToast({
      type: 'success',
      message: isScheduled
        ? `Broadcast scheduled for ${scheduledDate} at ${scheduledTime}.`
        : `Broadcast dispatched immediately to ${matchingStudents.length} students!`,
    })

    setIsSubmitting(false)
    setIsDirty(false)
    navigate('/admin/notifications')
  }

  // Department options sorted by name with value: dept.id
  const deptOptions = useMemo(() => {
    return [...departments]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((d) => ({
        value: d.id,
        label: `${d.name} (${d.code})`,
      }))
  }, [departments])

  const [semPrunedHint, setSemPrunedHint] = useState<string | null>(null)

  // Derived available semesters count
  const availableSemestersCount = useMemo(() => {
    if (selectedDepts.length === 0) {
      return 8
    }
    const selectedDeptObjs = departments.filter(
      (d) => selectedDepts.includes(d.id) || selectedDepts.includes(d.code)
    )
    if (selectedDeptObjs.length === 0) {
      return 8
    }
    const maxOffered = Math.max(...selectedDeptObjs.map((d) => d.semestersOffered || 8))
    return Math.max(1, Math.min(8, maxOffered))
  }, [selectedDepts, departments])

  // Derive semester options
  const semOptions = useMemo(() => {
    return Array.from({ length: availableSemestersCount }, (_, i) => ({
      value: String(i + 1),
      label: `Semester ${i + 1}`,
    }))
  }, [availableSemestersCount])

  // Prune invalid selected semesters when departments change
  useEffect(() => {
    const invalidSelected = selectedSemesters.filter((s) => Number(s) > availableSemestersCount)
    if (invalidSelected.length > 0) {
      setSelectedSemesters((prev) => prev.filter((s) => Number(s) <= availableSemestersCount))
      setSemPrunedHint(
        `Semester ${invalidSelected.join(', ')} was removed because it is not offered by the selected department(s).`
      )
    } else {
      setSemPrunedHint(null)
    }
  }, [availableSemestersCount, selectedSemesters])

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            to="/admin/notifications"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Notifications
          </Link>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Send Broadcast Notification
          </h1>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsPreviewOpen(!isPreviewOpen)}
          leftIcon={<Smartphone className="w-3.5 h-3.5" />}
        >
          {isPreviewOpen ? 'Hide Mobile Preview' : 'Show Mobile Preview'}
        </Button>
      </div>

      {/* Main Admin Form */}
      <AdminForm
        onSubmit={(e) => {
          e.preventDefault()
          handleDispatch()
        }}
        onCancel={() => navigate('/admin/notifications')}
        isSubmitting={isSubmitting}
        isDirty={isDirty}
        submitLabel={
          deliveryTiming === 'scheduled'
            ? 'Schedule Broadcast'
            : 'Send Broadcast Now'
        }
        stickyFooter
      >
        {/* Section 1: Message Content */}
        <FormSection
          title="Notification Content"
          description="Craft the alert message delivered directly to student lock screens and in-app feed."
        >
          <TextField
            label="Notification Title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              markDirty()
            }}
            placeholder="e.g. Urgent: Library Closing Early Today"
            error={errors.title}
            maxLength={60}
            required
          />

          <TextArea
            label="Message Body"
            value={message}
            onChange={(e) => {
              setMessage(e.target.value)
              markDirty()
            }}
            placeholder="e.g. Due to electrical maintenance, Central Library reading halls will close at 18:00."
            error={errors.message}
            maxLength={200}
            rows={3}
            helperText="Keep message concise for lock screen readability."
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              label="Notification Category"
              value={type}
              onChange={(e) => {
                setType(e.target.value as NotificationType)
                markDirty()
              }}
              options={[
                { value: 'announcement', label: 'Announcement Alert' },
                { value: 'event', label: 'Event Reminder' },
                { value: 'reminder', label: 'Academic Deadline' },
                { value: 'system', label: 'System Notice' },
              ]}
              required
            />

            <TextField
              label="Deep Link / Action Path (Optional)"
              value={actionLink}
              onChange={(e) => {
                setActionLink(e.target.value)
                markDirty()
              }}
              placeholder="e.g. /announcements/ann-library-extended-hours"
              helperText="Tapping the notification opens this route in the student app."
            />
          </div>
        </FormSection>

        {/* Section 2: Target Audience & Live Counter */}
        <FormSection
          title="Target Audience"
          description="Choose which students will receive this notification."
        >
          <div className="space-y-4">
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-text-primary">
                <input
                  type="radio"
                  name="audienceScope"
                  checked={audienceScope === 'all'}
                  onChange={() => {
                    setAudienceScope('all')
                    markDirty()
                  }}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-600"
                />
                All Registered Students ({students.length})
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-text-primary">
                <input
                  type="radio"
                  name="audienceScope"
                  checked={audienceScope === 'specific'}
                  onChange={() => {
                    setAudienceScope('specific')
                    markDirty()
                  }}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-600"
                />
                Target by Department & Semester
              </label>
            </div>

            {audienceScope === 'specific' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-card border border-border bg-canvas/40 animate-fade-in">
                <MultiSelectField
                  label="Filter by Departments"
                  values={selectedDepts}
                  onChange={(vals) => {
                    setSelectedDepts(vals)
                    markDirty()
                  }}
                  options={deptOptions}
                  placeholder="All departments if unselected"
                  emptyOptionsMessage="No departments yet"
                  emptyOptionsLink={{
                    label: 'Add departments',
                    href: '/admin/departments',
                  }}
                />

                <div className="space-y-1">
                  <MultiSelectField
                    label="Filter by Semesters"
                    values={selectedSemesters}
                    onChange={(vals) => {
                      setSelectedSemesters(vals)
                      markDirty()
                    }}
                    options={semOptions}
                    placeholder="All semesters if unselected"
                  />
                  {semPrunedHint && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1 font-medium">
                      <span>{semPrunedHint}</span>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Recipient Audience Banner */}
            <div className="p-3.5 rounded-card bg-primary-50 dark:bg-primary-950/40 border border-primary-200 dark:border-primary-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <Users className="w-5 h-5 text-primary-600" />
                <div>
                  <div className="text-sm font-semibold text-primary-900 dark:text-primary-100">
                    Calculated Reach: {matchingStudents.length} Students
                  </div>
                  <div className="text-xs text-primary-700 dark:text-primary-300">
                    {matchingStudents.length === students.length
                      ? 'Reaching 100% of all campus student accounts.'
                      : `Targeting ${matchingStudents.length} of ${students.length} enrolled students.`}
                  </div>
                </div>
              </div>

              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200">
                Verified
              </span>
            </div>
          </div>
        </FormSection>

        {/* Section 3: Delivery Timing */}
        <FormSection
          title="Delivery Timing"
          description="Send the broadcast immediately or schedule for future automated dispatch."
        >
          <div className="space-y-4">
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-text-primary">
                <input
                  type="radio"
                  name="timing"
                  checked={deliveryTiming === 'immediate'}
                  onChange={() => {
                    setDeliveryTiming('immediate')
                    markDirty()
                  }}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-600"
                />
                Send Immediately
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-text-primary">
                <input
                  type="radio"
                  name="timing"
                  checked={deliveryTiming === 'scheduled'}
                  onChange={() => {
                    setDeliveryTiming('scheduled')
                    markDirty()
                  }}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-600"
                />
                Schedule for Later
              </label>
            </div>

            {deliveryTiming === 'scheduled' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-card border border-border bg-canvas/40 animate-fade-in">
                <DatePickerField
                  label="Scheduled Date"
                  value={scheduledDate}
                  onChange={(d) => {
                    setScheduledDate(d)
                    markDirty()
                  }}
                />

                <TimePickerField
                  label="Scheduled Time"
                  value={scheduledTime}
                  onChange={(t) => {
                    setScheduledTime(t)
                    markDirty()
                  }}
                />
              </div>
            )}
          </div>
        </FormSection>
      </AdminForm>

      {/* Live Preview Panel */}
      <PreviewPanel
        isOpen={isPreviewOpen}
        onToggle={() => setIsPreviewOpen(!isPreviewOpen)}
        title="Live Mobile Notification Preview"
      >
        <div className="space-y-4">
          {/* Simulated Lock Screen Push Banner */}
          <div className="rounded-2xl bg-slate-800/90 text-white p-3.5 shadow-2xl backdrop-blur-md border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-primary-600 flex items-center justify-center text-white">
                  <Bell className="w-3 h-3" />
                </div>
                <span className="text-xs font-semibold tracking-wide text-slate-200">
                  Campus Companion
                </span>
              </div>
              <span className="text-[10px] text-slate-400">now</span>
            </div>

            <div className="space-y-0.5">
              <div className="text-sm font-semibold text-white">
                {title || 'Urgent Campus Alert'}
              </div>
              <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
                {message || 'The notification body text will be displayed here on the lock screen.'}
              </p>
            </div>

            {actionLink && (
              <div className="pt-1 flex items-center gap-1 text-[11px] text-primary-400 font-medium">
                <span>Tap to view</span>
                <ExternalLink className="w-3 h-3" />
              </div>
            )}
          </div>

          {/* In-app Notification Card Preview */}
          <div className="p-3.5 rounded-card border border-border bg-surface shadow-card space-y-1.5">
            <div className="flex items-center justify-between text-xs text-text-muted">
              <span className="font-semibold text-primary-600 uppercase tracking-wider text-[10px]">
                In-App Feed Item
              </span>
              <span>Just now</span>
            </div>
            <h4 className="text-sm font-bold text-text-primary">
              {title || 'Notification Headline'}
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed">
              {message || 'Student app feed item preview will appear here.'}
            </p>
          </div>
        </div>
      </PreviewPanel>
    </div>
  )
}
