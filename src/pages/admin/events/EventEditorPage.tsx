import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  ExternalLink,
  Sparkles,
} from 'lucide-react'
import { useContentStore } from '@/store/useContentStore'
import { useActivityLogStore } from '@/store/useActivityLogStore'
import { useToastStore } from '@/store/useToastStore'
import { useAdminAuthStore } from '@/store/useAdminAuthStore'
import { Event, EventCategory } from '@/types'
import {
  AdminForm,
  FormSection,
  TextField,
  TextArea,
  RichTextLite,
  SelectField,
  SearchableSelect,
  DatePickerField,
  TimePickerField,
  NumberField,
  ToggleField,
  TagInputField,
  ColorDotPicker,
  IconPicker,
  PreviewPanel,
} from '@/components/admin'
import { Button } from '@/components/ui/Button'
import { CURATED_ICONS } from '@/components/admin/form/IconPicker'

export const EventEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const { events, eventCategories, locations, clubs, createItem, updateItem } =
    useContentStore()
  const { addActivity } = useActivityLogStore()
  const { push: pushToast } = useToastStore()
  const { adminUser } = useAdminAuthStore()

  // Form Fields State
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<EventCategory>('workshop')
  const [description, setDescription] = useState('')
  const [detailedContent, setDetailedContent] = useState('')
  const [tags, setTags] = useState<string[]>(['engineering', 'coding'])

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [startTime, setStartTime] = useState('10:00')
  const [endTime, setEndTime] = useState('16:00')
  const [locationId, setLocationId] = useState('')
  const [organizerClubId, setOrganizerClubId] = useState('')

  const [capacity, setCapacity] = useState(80)
  const [registrationOpen, setRegistrationOpen] = useState(true)
  const [registrationDeadline, setRegistrationDeadline] = useState(
    () => new Date().toISOString().slice(0, 10)
  )

  const [bannerColor, setBannerColor] = useState('#2563eb')
  const [bannerIcon, setBannerIcon] = useState('Calendar')

  const [status, setStatus] = useState<'Draft' | 'Published' | 'Cancelled'>('Published')
  const [cancellationReason, setCancellationReason] = useState('')

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load existing event data
  useEffect(() => {
    if (isEditing && id) {
      const existing = events.find((e) => e.id === id)
      if (existing) {
        setTitle(existing.title)
        setCategory(existing.category)
        setDescription(existing.description || '')
        setTags(existing.tags || [])
        setDate(existing.date || new Date().toISOString().slice(0, 10))
        setStartTime(existing.startTime || '10:00')
        setEndTime(existing.endTime || '16:00')
        setLocationId(existing.locationId || '')
        setOrganizerClubId(existing.organizerClubId || '')
        setCapacity(existing.capacity || 80)
        setRegistrationOpen(existing.registrationOpen !== false)
        setRegistrationDeadline(existing.registrationDeadline || existing.date)
        setBannerColor(existing.bannerColor || '#2563eb')
        setBannerIcon(existing.bannerIcon || 'Calendar')
        setStatus(existing.status || 'Published')
        setCancellationReason(existing.cancellationReason || '')
      }
    } else if (locations.length > 0 && !locationId) {
      setLocationId(locations[0].id)
    }
  }, [isEditing, id, events, locations, locationId])

  const markDirty = () => {
    if (!isDirty) setIsDirty(true)
  }

  // Validation
  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!title.trim()) {
      errs.title = 'Event title is required'
    } else if (title.trim().length < 5) {
      errs.title = 'Title must be at least 5 characters'
    }

    if (!description.trim()) {
      errs.description = 'Short description is required'
    }

    if (!date) {
      errs.date = 'Event date is required'
    }

    if (startTime && endTime && startTime >= endTime) {
      errs.endTime = 'End time must be after the start time'
    }

    if (!locationId) {
      errs.locationId = 'Venue location is required'
    }

    if (!registrationDeadline) {
      errs.registrationDeadline = 'Registration deadline is required'
    }

    if (status === 'Cancelled' && !cancellationReason.trim()) {
      errs.cancellationReason = 'Please specify a reason for cancellation'
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  // Handle Save
  const handleSave = async (customStatus?: 'Draft' | 'Published') => {
    if (!validate()) {
      pushToast({
        type: 'error',
        message: 'Please resolve the highlighted validation errors.',
      })
      return
    }

    setIsSubmitting(true)
    const effectiveStatus = customStatus || status

    const eventPayload: Omit<Event, 'id' | 'createdAt' | 'updatedAt'> = {
      title: title.trim(),
      category,
      date,
      startTime,
      endTime,
      locationId,
      organizerClubId: organizerClubId || undefined,
      description: description.trim(),
      capacity,
      registeredCount: isEditing ? (events.find((e) => e.id === id)?.registeredCount || 0) : 0,
      tags,
      registrationDeadline,
      status: effectiveStatus,
      bannerColor,
      bannerIcon,
      registrationOpen,
      cancellationReason: effectiveStatus === 'Cancelled' ? cancellationReason.trim() : undefined,
    }

    // Simulate 600ms latency
    await new Promise((resolve) => setTimeout(resolve, 600))

    if (isEditing && id) {
      updateItem('events', id, eventPayload, adminUser?.email)
      addActivity({
        userEmail: adminUser?.email || 'admin@demo.edu',
        userName: adminUser?.name || 'Administrator',
        action: 'update',
        itemType: 'event',
        itemId: id,
        itemName: title.trim(),
        summary: `Updated event "${title.trim()}" (status: ${effectiveStatus})`,
      })
      pushToast({
        type: 'success',
        message: `Event "${title.trim()}" updated successfully.`,
      })
    } else {
      const created = createItem('events', eventPayload, adminUser?.email)
      addActivity({
        userEmail: adminUser?.email || 'admin@demo.edu',
        userName: adminUser?.name || 'Administrator',
        action: 'create',
        itemType: 'event',
        itemId: created.id,
        itemName: created.title,
        summary: `Created new event "${created.title}" (status: ${effectiveStatus})`,
      })
      pushToast({
        type: 'success',
        message: `Event "${created.title}" created successfully.`,
      })
    }

    setIsSubmitting(false)
    setIsDirty(false)
    navigate('/admin/events')
  }

  // Options for selects
  const locationOptions = locations.map((loc) => ({
    value: loc.id,
    label: loc.name,
    description: `${loc.building}, Floor ${loc.floor}`,
    sublabel: `${loc.building}, Floor ${loc.floor}`,
    badge: loc.type,
    group: loc.type ? loc.type.toUpperCase() : 'OTHER',
  }))

  const clubOptions = [
    { value: '', label: 'None (Campus Administrative Event)' },
    ...clubs.map((c) => ({
      value: c.id,
      label: c.name,
      sublabel: `Category: ${c.category}`,
    })),
  ]

  const SelectedBannerIcon = CURATED_ICONS[bannerIcon] || Sparkles
  const selectedLocation = locations.find((l) => l.id === locationId)

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto">
      {/* Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            to="/admin/events"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Events
          </Link>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            {isEditing ? 'Edit Event' : 'Create New Event'}
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPreviewOpen(!isPreviewOpen)}
          >
            {isPreviewOpen ? 'Hide Student Preview' : 'Show Student Preview'}
          </Button>
          {isEditing && id && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`/events/${id}`)}
              leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
            >
              View in App
            </Button>
          )}
        </div>
      </div>

      {/* Main Admin Form */}
      <AdminForm
        onSubmit={(e) => {
          e.preventDefault()
          handleSave()
        }}
        onCancel={() => navigate('/admin/events')}
        onSaveDraft={() => handleSave('Draft')}
        isSubmitting={isSubmitting}
        isDirty={isDirty}
        submitLabel={isEditing ? 'Save Changes' : 'Publish Event'}
        draftLabel="Save as Draft"
        stickyFooter
      >
        {/* Section 1: Overview */}
        <FormSection
          title="Event Overview"
          description="Basic information, title, category classification, and tags."
        >
          <TextField
            label="Event Title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              markDirty()
            }}
            placeholder="e.g. Nexus 48-Hour AI/ML Hackathon 2026"
            error={errors.title}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              label="Event Category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as EventCategory)
                markDirty()
              }}
              options={eventCategories.map((c) => ({
                value: c.id,
                label: c.label,
              }))}
              required
            />

            <SearchableSelect
              label="Organizing Club (Optional)"
              value={organizerClubId}
              onChange={(cId) => {
                setOrganizerClubId(cId)
                markDirty()
              }}
              options={clubOptions}
              placeholder="Select organizing club..."
            />
          </div>

          <TextArea
            label="Short Description"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value)
              markDirty()
            }}
            placeholder="Brief event summary shown on cards and listings..."
            maxLength={250}
            rows={2}
            error={errors.description}
            helperText="Concise summary for student mobile feeds."
            required
          />

          <RichTextLite
            label="Event Details and Agenda (Markdown Supported)"
            value={detailedContent}
            onChange={(val) => {
              setDetailedContent(val)
              markDirty()
            }}
            placeholder="Provide event schedule, rules, prerequisites, and speaker bios..."
            rows={6}
            helperText="Full guidelines and schedule rendered on the student event page."
          />

          <TagInputField
            label="Event Tags"
            tags={tags}
            onChange={(t) => {
              setTags(t)
              markDirty()
            }}
            suggestions={['ai', 'coding', 'hackathon', 'workshop', 'robotics', 'career', 'annual']}
            helperText="Press Enter or comma to add keyword tags."
          />
        </FormSection>

        {/* Section 2: Date, Time & Location */}
        <FormSection
          title="Date, Time & Campus Venue"
          description="Schedule timeline and assigned campus room or hall."
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DatePickerField
              label="Event Date"
              value={date}
              onChange={(d) => {
                setDate(d)
                markDirty()
              }}
              required
            />

            <TimePickerField
              label="Start Time"
              value={startTime}
              onChange={(t) => {
                setStartTime(t)
                markDirty()
              }}
              required
            />

            <TimePickerField
              label="End Time"
              value={endTime}
              onChange={(t) => {
                setEndTime(t)
                markDirty()
              }}
              error={errors.endTime}
              required
            />
          </div>

          <SearchableSelect
            label="Venue Location"
            value={locationId}
            onChange={(loc) => {
              setLocationId(loc)
              markDirty()
            }}
            options={locationOptions}
            placeholder="Select a venue location..."
            emptyMessage="No locations yet"
            emptyLink={{
              label: 'Add a location',
              href: '/admin/locations/new',
            }}
            error={errors.locationId}
            helperText="Connected to campus interactive map."
            required
          />
        </FormSection>

        {/* Section 3: Capacity & Registration Controls */}
        <FormSection
          title="Capacity & Registration Controls"
          description="Seat limits, enrollment status, and student registration deadlines."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <NumberField
              label="Total Seating Capacity"
              value={capacity}
              onChange={(cap) => {
                setCapacity(cap)
                markDirty()
              }}
              min={5}
              max={2000}
              step={5}
              unit="seats"
              helperText="Once reached, registration closes automatically."
            />

            <DatePickerField
              label="Registration Deadline"
              value={registrationDeadline}
              onChange={(d) => {
                setRegistrationDeadline(d)
                markDirty()
              }}
              maxDate={date}
              helperText="Last day students can enroll."
              required
            />
          </div>

          <ToggleField
            label="Open for Student Registrations"
            description="When toggled off, the 'Register' button in the student app is disabled."
            checked={registrationOpen}
            onChange={(val) => {
              setRegistrationOpen(val)
              markDirty()
            }}
            badge="Enrollment"
          />
        </FormSection>

        {/* Section 4: Banner & Presentation */}
        <FormSection
          title="Banner Appearance"
          description="Customize the accent color and icon displayed on cards."
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ColorDotPicker
              label="Card Banner Accent Color"
              value={bannerColor}
              onChange={(c) => {
                setBannerColor(c)
                markDirty()
              }}
            />

            <IconPicker
              label="Banner Icon (30 Curated Lucide Icons)"
              value={bannerIcon}
              onChange={(i) => {
                setBannerIcon(i)
                markDirty()
              }}
            />
          </div>
        </FormSection>

        {/* Section 5: Publication Status */}
        <FormSection
          title="Publication Status"
          description="Event visibility in student search and calendar views."
        >
          <div className="space-y-4">
            <SelectField
              label="Status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as typeof status)
                markDirty()
              }}
              options={[
                { value: 'Published', label: 'Published (Visible to students)' },
                { value: 'Draft', label: 'Draft (Admin only)' },
                { value: 'Cancelled', label: 'Cancelled (Marked as cancelled)' },
              ]}
              required
            />

            {status === 'Cancelled' && (
              <TextField
                label="Cancellation Reason"
                value={cancellationReason}
                onChange={(e) => {
                  setCancellationReason(e.target.value)
                  markDirty()
                }}
                placeholder="e.g. Postponed due to severe weather warning"
                error={errors.cancellationReason}
                helperText="Displayed prominently in red to students enrolled in this event."
                required
              />
            )}
          </div>
        </FormSection>
      </AdminForm>

      {/* Live Preview Panel */}
      <PreviewPanel
        isOpen={isPreviewOpen}
        onToggle={() => setIsPreviewOpen(!isPreviewOpen)}
        title="Live Preview: Student Event Card"
      >
        <div className="rounded-card border border-border bg-surface shadow-card overflow-hidden text-left space-y-3">
          {/* Header banner */}
          <div
            className="h-20 p-3 flex items-center justify-between text-white relative"
            style={{ backgroundColor: bannerColor }}
          >
            <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
              <SelectedBannerIcon className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold uppercase px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-md">
              {category}
            </span>
          </div>

          <div className="p-4 space-y-2.5">
            <h3 className="text-base font-bold text-text-primary">
              {title || 'Event Title'}
            </h3>

            <p className="text-xs text-text-secondary leading-relaxed line-clamp-2">
              {description || 'Event description will be shown here.'}
            </p>

            <div className="space-y-1.5 pt-1 text-xs text-text-secondary">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-text-muted" />
                <span>{date}</span>
                <Clock className="w-3.5 h-3.5 text-text-muted ml-2" />
                <span>{startTime} to {endTime}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-text-muted" />
                <span className="truncate">
                  {selectedLocation?.name || 'Select Venue'}
                </span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-border/60 text-xs">
              <div className="flex items-center gap-1 text-text-muted">
                <Users className="w-3.5 h-3.5" />
                <span>{capacity} spots</span>
              </div>
              <span className="text-primary-600 font-semibold">
                {registrationOpen ? 'Open for registration' : 'Registration closed'}
              </span>
            </div>
          </div>
        </div>
      </PreviewPanel>
    </div>
  )
}
