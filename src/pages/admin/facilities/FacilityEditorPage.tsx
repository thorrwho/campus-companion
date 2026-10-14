import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  ExternalLink,
  Copy,
} from 'lucide-react'
import { useContentStore } from '@/store/useContentStore'
import { useActivityLogStore } from '@/store/useActivityLogStore'
import { useToastStore } from '@/store/useToastStore'
import { useAdminAuthStore } from '@/store/useAdminAuthStore'
import { Facility, FacilityStatus, FacilityDaySchedule } from '@/types'
import {
  AdminForm,
  FormSection,
  TextField,
  SelectField,
  SearchableSelect,
  ListEditor,
  TimePickerField,
  PreviewPanel,
} from '@/components/admin'
import { Button } from '@/components/ui/Button'
import { FacilityCard } from '@/components/domain/FacilityCard'

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
]

const DEFAULT_WEEKLY_HOURS: Record<string, FacilityDaySchedule> = {
  Monday: { closed: false, openTime: '08:30', closeTime: '20:00' },
  Tuesday: { closed: false, openTime: '08:30', closeTime: '20:00' },
  Wednesday: { closed: false, openTime: '08:30', closeTime: '20:00' },
  Thursday: { closed: false, openTime: '08:30', closeTime: '20:00' },
  Friday: { closed: false, openTime: '08:30', closeTime: '20:00' },
  Saturday: { closed: false, openTime: '09:00', closeTime: '17:00' },
  Sunday: { closed: true, openTime: '09:00', closeTime: '17:00' },
}

export const FacilityEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditMode = Boolean(id)

  const { facilities, locations, createItem, updateItem } = useContentStore()
  const { adminUser } = useAdminAuthStore()
  const { addActivity } = useActivityLogStore()
  const { push: pushToast } = useToastStore()

  const [isPreviewOpen, setIsPreviewOpen] = useState(true)

  // Find existing facility
  const existingFacility = useMemo(() => {
    if (!id) return null
    return facilities.find((f) => f.id === id) || null
  }, [id, facilities])

  // Form State
  const [name, setName] = useState('')
  const [type, setType] = useState('Library')
  const [locationId, setLocationId] = useState('')
  const [contact, setContact] = useState('')
  const [notes, setNotes] = useState('')
  const [services, setServices] = useState<string[]>([])
  const [statusOverride, setStatusOverride] = useState<'auto' | 'force_open' | 'force_closed' | 'limited'>('auto')
  const [statusMessage, setStatusMessage] = useState('')
  const [weeklyHours, setWeeklyHours] = useState<Record<string, FacilityDaySchedule>>(DEFAULT_WEEKLY_HOURS)

  // Form Status
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFormDirty, setIsFormDirty] = useState(false)

  // Location Options
  const locationOptions = useMemo(() => {
    return locations.map((loc) => ({
      value: loc.id,
      label: loc.name,
      sublabel: `${loc.building}, ${loc.floor}`,
    }))
  }, [locations])

  // Initialize or populate form
  useEffect(() => {
    if (isEditMode && existingFacility) {
      setName(existingFacility.name)
      setType(existingFacility.type)
      setLocationId(existingFacility.locationId)
      setContact(existingFacility.contact || '')
      setNotes(existingFacility.notes || '')
      setServices(existingFacility.services || [])
      setStatusOverride(existingFacility.statusOverride || 'auto')
      setStatusMessage(existingFacility.statusMessage || '')

      if (existingFacility.weeklyHours) {
        setWeeklyHours(existingFacility.weeklyHours)
      } else if (existingFacility.openHours) {
        // Synthesize schedule from openHours string map
        const converted: Record<string, FacilityDaySchedule> = { ...DEFAULT_WEEKLY_HOURS }
        DAYS_OF_WEEK.forEach((d) => {
          const val = existingFacility.openHours[d]
          if (val) {
            if (val.toLowerCase().includes('closed')) {
              converted[d] = { closed: true, openTime: '09:00', closeTime: '17:00' }
            } else {
              const parts = val.split('-').map((s) => s.trim())
              if (parts.length === 2) {
                converted[d] = { closed: false, openTime: parts[0], closeTime: parts[1] }
              }
            }
          }
        })
        setWeeklyHours(converted)
      }
      setIsFormDirty(false)
    } else if (!isEditMode) {
      setName('')
      setType('Library')
      setLocationId(locations[0]?.id || '')
      setContact('helpdesk@demo.edu')
      setNotes('Students and staff require campus ID for access.')
      setServices([
        'Quiet Study Areas',
        'Book Circulation & Reserves',
        'Computer Workstations',
        'High-Speed Wi-Fi',
      ])
      setStatusOverride('auto')
      setStatusMessage('')
      setWeeklyHours(DEFAULT_WEEKLY_HOURS)
      setIsFormDirty(false)
    }
  }, [isEditMode, existingFacility, locations])

  const handleFieldChange = (setter: (val: any) => void, val: any) => {
    setter(val)
    setIsFormDirty(true)
  }

  // Update schedule for single day
  const handleUpdateDay = (day: string, field: keyof FacilityDaySchedule, value: any) => {
    setWeeklyHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
      },
    }))
    setIsFormDirty(true)
  }

  // Copy Monday to all weekdays helper
  const handleCopyMondayToWeekdays = () => {
    const mondaySchedule = weeklyHours['Monday'] || { closed: false, openTime: '08:30', closeTime: '20:00' }
    setWeeklyHours((prev) => ({
      ...prev,
      Tuesday: { ...mondaySchedule },
      Wednesday: { ...mondaySchedule },
      Thursday: { ...mondaySchedule },
      Friday: { ...mondaySchedule },
    }))
    setIsFormDirty(true)
    pushToast({
      type: 'success',
      message: 'Applied Monday hours to Tuesday through Friday.',
    })
  }

  // Format openHours map for saving and preview
  const formattedOpenHours = useMemo(() => {
    const map: Record<string, string> = {}
    DAYS_OF_WEEK.forEach((d) => {
      const sch = weeklyHours[d]
      if (!sch || sch.closed) {
        map[d] = 'Closed'
      } else {
        map[d] = `${sch.openTime} - ${sch.closeTime}`
      }
    })
    return map
  }, [weeklyHours])

  // Live Preview Object
  const previewFacility: Facility = useMemo(() => {
    return {
      id: existingFacility?.id || 'preview-facility-id',
      name: name.trim() || 'Facility Name Preview',
      type: type.trim() || 'Library',
      locationId: locationId || (locations[0]?.id || ''),
      openHours: formattedOpenHours,
      weeklyHours,
      services: services.length > 0 ? services : ['Campus Service'],
      contact: contact.trim() || 'contact@demo.edu',
      status: (statusOverride === 'force_closed' ? 'closed' : statusOverride === 'force_open' ? 'open' : 'open') as FacilityStatus,
      statusOverride,
      statusMessage: statusMessage.trim() || undefined,
      notes: notes.trim() || undefined,
    }
  }, [existingFacility, name, type, locationId, locations, formattedOpenHours, weeklyHours, services, contact, statusOverride, statusMessage, notes])

  // Form Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = 'Facility name is required'
    }

    if (!type.trim()) {
      newErrors.type = 'Facility type is required'
    }

    if (!locationId) {
      newErrors.locationId = 'Campus location is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      pushToast({
        type: 'error',
        message: 'Please resolve the highlighted errors.',
      })
      return
    }

    setIsSubmitting(true)
    try {
      const facilityPayload: Omit<Facility, 'id' | 'createdAt' | 'updatedAt'> = {
        name: name.trim(),
        type: type.trim(),
        locationId,
        contact: contact.trim(),
        notes: notes.trim() || undefined,
        services: services.filter((s) => Boolean(s.trim())),
        openHours: formattedOpenHours,
        weeklyHours,
        statusOverride,
        statusMessage: statusMessage.trim() || undefined,
        status: (statusOverride === 'force_closed' ? 'closed' : statusOverride === 'force_open' ? 'open' : 'open') as FacilityStatus,
      }

      if (isEditMode && existingFacility) {
        updateItem('facilities', existingFacility.id, facilityPayload, adminUser?.email)
        addActivity({
          userEmail: adminUser?.email || 'admin@demo.edu',
          userName: adminUser?.name || 'Administrator',
          action: 'update',
          itemType: 'facility',
          itemId: existingFacility.id,
          itemName: name.trim(),
          summary: `Updated facility "${name.trim()}"`,
        })
        pushToast({
          type: 'success',
          message: `Saved changes to "${name.trim()}".`,
        })
      } else {
        const created = createItem('facilities', facilityPayload, adminUser?.email)
        addActivity({
          userEmail: adminUser?.email || 'admin@demo.edu',
          userName: adminUser?.name || 'Administrator',
          action: 'create',
          itemType: 'facility',
          itemId: created.id,
          itemName: created.name,
          summary: `Created new facility "${created.name}"`,
        })
        pushToast({
          type: 'success',
          message: `Created facility "${created.name}".`,
        })
      }

      setIsFormDirty(false)
      navigate('/admin/facilities')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 text-left pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            to="/admin/facilities"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Facilities
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            {isEditMode ? `Edit Facility: ${existingFacility?.name || ''}` : 'Add New Facility'}
          </h1>
        </div>

        {isEditMode && existingFacility && (
          <a
            href={`/facilities/${existingFacility.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-card border border-border bg-surface hover:bg-canvas text-text-secondary hover:text-primary-600 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            View in App
          </a>
        )}
      </div>

      {/* Main Grid: Form + Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Column */}
        <div className="lg:col-span-7 xl:col-span-8">
          <AdminForm
            onSubmit={handleSubmit}
            onCancel={() => navigate('/admin/facilities')}
            isSubmitting={isSubmitting}
            isDirty={isFormDirty}
            submitLabel={isEditMode ? 'Save Facility' : 'Create Facility'}
          >
            {/* Section 1: General Details */}
            <FormSection
              title="General Information"
              description="Basic identity, physical building location, and direct contact details."
            >
              <TextField
                label="Facility Name"
                value={name}
                onChange={(e) => handleFieldChange(setName, e.target.value)}
                placeholder="e.g. Central Campus Library & Information Center"
                error={errors.name}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField
                  label="Facility Type"
                  value={type}
                  onChange={(e) => handleFieldChange(setType, e.target.value)}
                  placeholder="e.g. Library, Cafeteria, Health, Sports..."
                  error={errors.type}
                  required
                />

                <SearchableSelect
                  label="Campus Location"
                  value={locationId}
                  onChange={(val) => handleFieldChange(setLocationId, val)}
                  options={locationOptions}
                  placeholder="Select a campus building..."
                  error={errors.locationId}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField
                  label="Contact Information"
                  value={contact}
                  onChange={(e) => handleFieldChange(setContact, e.target.value)}
                  placeholder="e.g. library@demo.edu or +1 (555) 234-5678"
                />

                <TextField
                  label="Staff / Manager Notes (Optional)"
                  value={notes}
                  onChange={(e) => handleFieldChange(setNotes, e.target.value)}
                  placeholder="Internal policy or student access instructions..."
                />
              </div>
            </FormSection>

            {/* Section 2: Weekly Hours Schedule */}
            <FormSection
              title="Weekly Hours Schedule"
              description="Configure operating hours for each day of the week. Times determine automatic open/closed status."
            >
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="text-xs font-semibold text-text-secondary">
                  Daily Open & Close Schedule
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyMondayToWeekdays}
                  className="flex items-center gap-1.5 text-xs py-1"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Monday to all weekdays</span>
                </Button>
              </div>

              <div className="space-y-3 pt-2">
                {DAYS_OF_WEEK.map((day) => {
                  const schedule = weeklyHours[day] || { closed: false, openTime: '08:30', closeTime: '20:00' }
                  return (
                    <div
                      key={day}
                      className="p-3 rounded-card border border-border bg-surface hover:bg-canvas/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="w-28 font-semibold text-text-primary text-sm">
                        {day}
                      </div>

                      <div className="flex items-center gap-4 flex-1">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={schedule.closed}
                            onChange={(e) => handleUpdateDay(day, 'closed', e.target.checked)}
                            className="w-4 h-4 rounded text-primary-600 focus:ring-primary-600 border-border"
                          />
                          <span className={schedule.closed ? 'font-semibold text-rose-600' : 'text-text-muted'}>
                            {schedule.closed ? 'Closed All Day' : 'Open'}
                          </span>
                        </label>

                        {!schedule.closed && (
                          <div className="flex items-center gap-2 flex-1 max-w-xs">
                            <div className="flex-1">
                              <TimePickerField
                                value={schedule.openTime}
                                onChange={(val) => handleUpdateDay(day, 'openTime', val)}
                                showPresets={false}
                              />
                            </div>
                            <span className="text-text-muted">to</span>
                            <div className="flex-1">
                              <TimePickerField
                                value={schedule.closeTime}
                                onChange={(val) => handleUpdateDay(day, 'closeTime', val)}
                                showPresets={false}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </FormSection>

            {/* Section 3: Status & Manual Overrides */}
            <FormSection
              title="Operational Status & Overrides"
              description="Override automatic calculation for maintenance, holidays, or emergency closures."
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectField
                  label="Status Override"
                  value={statusOverride}
                  onChange={(e) => handleFieldChange(setStatusOverride, e.target.value as any)}
                  options={[
                    { value: 'auto', label: 'Auto (Calculated from weekly hours)' },
                    { value: 'force_open', label: 'Force Open (Show Open now)' },
                    { value: 'force_closed', label: 'Force Closed (Show Closed now)' },
                    { value: 'limited', label: 'Limited Operations (Show Warning)' },
                  ]}
                  required
                />

                <TextField
                  label="Optional Student Notice Message"
                  value={statusMessage}
                  onChange={(e) => handleFieldChange(setStatusMessage, e.target.value)}
                  placeholder="e.g. Closed today for system maintenance"
                  helperText="Displayed in the student app alongside facility status."
                />
              </div>
            </FormSection>

            {/* Section 4: Offered Services & Amenities */}
            <FormSection
              title="Offered Services & Amenities"
              description="List specific services available inside this facility."
            >
              <ListEditor
                items={services}
                onChange={(val) => handleFieldChange(setServices, val)}
                placeholder="e.g. Printing & Scanning Stations..."
                helperText="Students will see these services tagged on the facility detail page."
              />
            </FormSection>
          </AdminForm>
        </div>

        {/* Right Preview Column */}
        <div className="lg:col-span-5 xl:col-span-4 sticky top-6">
          <PreviewPanel
            title="Student App Live Preview"
            isOpen={isPreviewOpen}
            onToggle={() => setIsPreviewOpen((prev) => !prev)}
          >
            <div className="space-y-4 text-left">
              <div className="p-1">
                <FacilityCard facility={previewFacility} />
              </div>

              {/* Status Breakdown Card */}
              <div className="p-4 rounded-card border border-border bg-surface text-xs space-y-2">
                <div className="font-semibold text-text-primary flex items-center justify-between">
                  <span>Computed Schedule Status</span>
                  <span className="capitalize font-mono text-primary-600 bg-primary-50 dark:bg-primary-950/40 px-2 py-0.5 rounded">
                    {statusOverride}
                  </span>
                </div>
                {statusMessage && (
                  <div className="p-2 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 border border-amber-200 dark:border-amber-800 text-[11px]">
                    {statusMessage}
                  </div>
                )}
                <div className="text-text-muted pt-1">
                  Location: {locations.find((l) => l.id === locationId)?.name || 'Not set'}
                </div>
              </div>
            </div>
          </PreviewPanel>
        </div>
      </div>
    </div>
  )
}
