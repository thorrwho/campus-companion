import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  ExternalLink,
  Users,
  Plus,
  Trash2,
} from 'lucide-react'
import { useContentStore } from '@/store/useContentStore'
import { useActivityLogStore } from '@/store/useActivityLogStore'
import { useToastStore } from '@/store/useToastStore'
import { useAdminAuthStore } from '@/store/useAdminAuthStore'
import { Club, ClubCategory, ClubSocialLink } from '@/types'
import {
  AdminForm,
  FormSection,
  TextField,
  TextArea,
  RichTextLite,
  SelectField,
  SearchableSelect,
  ToggleField,
  ListEditor,
  ColorDotPicker,
  IconPicker,
  PreviewPanel,
} from '@/components/admin'
import { Button } from '@/components/ui/Button'
import { ClubCard } from '@/components/domain/ClubCard'

const SOCIAL_PLATFORMS = [
  'Instagram',
  'LinkedIn',
  'Discord',
  'GitHub',
  'Twitter / X',
  'Website',
  'Email',
  'YouTube',
]

export const ClubEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditMode = Boolean(id)

  const {
    clubs,
    faculty,
    events,
    clubCategories,
    createItem,
    updateItem,
  } = useContentStore()

  const { adminUser } = useAdminAuthStore()
  const { addActivity } = useActivityLogStore()
  const { push: pushToast } = useToastStore()

  const [isPreviewOpen, setIsPreviewOpen] = useState(true)

  // Find existing club if edit mode
  const existingClub = useMemo(() => {
    if (!id) return null
    return clubs.find((c) => c.id === id) || null
  }, [id, clubs])

  // Form State
  const [name, setName] = useState('')
  const [category, setCategory] = useState<ClubCategory>('technical')
  const [icon, setIcon] = useState('Users')
  const [color, setColor] = useState('#2563eb')
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active')
  const [acceptingMembers, setAcceptingMembers] = useState(true)
  const [shortDescription, setShortDescription] = useState('')
  const [description, setDescription] = useState('')
  const [meetingSchedule, setMeetingSchedule] = useState('')
  const [coordinator, setCoordinator] = useState('')
  const [studentLeadName, setStudentLeadName] = useState('')
  const [activities, setActivities] = useState<string[]>([])
  const [socialLinks, setSocialLinks] = useState<ClubSocialLink[]>([])

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFormDirty, setIsFormDirty] = useState(false)

  // Initialize or populate form
  useEffect(() => {
    if (isEditMode && existingClub) {
      setName(existingClub.name)
      setCategory(existingClub.category)
      setIcon(existingClub.icon || 'Users')
      setColor(existingClub.color || '#2563eb')
      setStatus(existingClub.status || 'Active')
      setAcceptingMembers(existingClub.acceptingMembers !== false)
      setShortDescription(existingClub.shortDescription || '')
      setDescription(existingClub.description || '')
      setMeetingSchedule(existingClub.meetingSchedule || '')
      setCoordinator(existingClub.coordinator || '')
      setStudentLeadName(existingClub.studentLeadName || '')
      setActivities(existingClub.activities || [])
      setSocialLinks(existingClub.socialLinks || [])
      setIsFormDirty(false)
    } else if (!isEditMode) {
      // Defaults for new club
      setName('')
      setCategory(clubCategories[0]?.id || 'technical')
      setIcon('Users')
      setColor('#2563eb')
      setStatus('Active')
      setAcceptingMembers(true)
      setShortDescription('')
      setDescription('')
      setMeetingSchedule('Every Wednesday 4:00 PM to 6:00 PM')
      setCoordinator('')
      setStudentLeadName('')
      setActivities([
        'Weekly workshops and hands-on coding sessions',
        'Annual college-wide hackathon',
        'Technical guest lectures and industry panels',
      ])
      setSocialLinks([
        { platform: 'Instagram', url: 'https://instagram.com/' },
        { platform: 'Discord', url: 'https://discord.gg/' },
      ])
      setIsFormDirty(false)
    }
  }, [isEditMode, existingClub, clubCategories])

  // Mark form as dirty on changes
  const handleFieldChange = (setter: (val: any) => void, val: any) => {
    setter(val)
    setIsFormDirty(true)
  }

  // Social Links Helpers
  const handleAddSocialLink = () => {
    handleFieldChange(setSocialLinks, [
      ...socialLinks,
      { platform: 'Instagram', url: '' },
    ])
  }

  const handleUpdateSocialLink = (index: number, field: 'platform' | 'url', val: string) => {
    const updated = [...socialLinks]
    updated[index] = { ...updated[index], [field]: val }
    handleFieldChange(setSocialLinks, updated)
  }

  const handleRemoveSocialLink = (index: number) => {
    const updated = socialLinks.filter((_, i) => i !== index)
    handleFieldChange(setSocialLinks, updated)
  }

  // Faculty Options for Coordinator Picker
  const facultyOptions = useMemo(() => {
    const options = faculty.map((f) => ({
      value: f.name,
      label: f.name,
      sublabel: `${f.departmentId} - ${f.designation}`,
    }))
    // If current coordinator is not in faculty list, add it as custom option
    if (coordinator && !options.some((o) => o.value.toLowerCase() === coordinator.toLowerCase())) {
      options.unshift({
        value: coordinator,
        label: `${coordinator} (Custom)`,
        sublabel: 'Custom Coordinator Entry',
      })
    }
    return options
  }, [faculty, coordinator])

  // Upcoming events organized by this club
  const organizedEvents = useMemo(() => {
    if (!existingClub) return []
    return events.filter((e) => e.organizerClubId === existingClub.id)
  }, [events, existingClub])

  // Live Club Object for Preview
  const previewClub: Club = useMemo(() => {
    return {
      id: existingClub?.id || 'preview-club-id',
      name: name.trim() || 'Club Name Preview',
      category: category || 'technical',
      shortDescription:
        shortDescription.trim() ||
        'A concise summary of club goals, activities, and campus community engagement.',
      description: description.trim() || 'Full description will be displayed here in Markdown.',
      activities: activities.length > 0 ? activities : ['Sample club activity'],
      memberCount: existingClub?.memberCount || 42,
      meetingSchedule: meetingSchedule.trim() || 'Schedule to be announced',
      coordinator: coordinator.trim() || 'Faculty Coordinator',
      upcomingEventIds: existingClub?.upcomingEventIds || [],
      icon,
      color,
      studentLeadName: studentLeadName.trim() || 'Student Lead',
      socialLinks,
      acceptingMembers,
      status,
    }
  }, [
    existingClub,
    name,
    category,
    shortDescription,
    description,
    activities,
    meetingSchedule,
    coordinator,
    icon,
    color,
    studentLeadName,
    socialLinks,
    acceptingMembers,
    status,
  ])

  // Form Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = 'Club name is required'
    } else {
      // Unique name check
      const duplicate = clubs.find(
        (c) => c.name.toLowerCase() === name.trim().toLowerCase() && c.id !== existingClub?.id
      )
      if (duplicate) {
        newErrors.name = 'A club with this name already exists'
      }
    }

    if (!category) {
      newErrors.category = 'Category is required'
    }

    if (!shortDescription.trim()) {
      newErrors.shortDescription = 'Short description is required'
    } else if (shortDescription.length > 140) {
      newErrors.shortDescription = 'Short description must be 140 characters or fewer'
    }

    if (!description.trim()) {
      newErrors.description = 'Full club description is required'
    }

    if (!meetingSchedule.trim()) {
      newErrors.meetingSchedule = 'Meeting schedule is required'
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
        message: 'Please review and resolve the highlighted errors.',
      })
      return
    }

    setIsSubmitting(true)
    try {
      const clubPayload: Omit<Club, 'id' | 'createdAt' | 'updatedAt'> = {
        name: name.trim(),
        category,
        icon,
        color,
        status,
        acceptingMembers,
        shortDescription: shortDescription.trim(),
        description: description.trim(),
        meetingSchedule: meetingSchedule.trim(),
        coordinator: coordinator.trim(),
        studentLeadName: studentLeadName.trim(),
        activities: activities.filter((a) => Boolean(a.trim())),
        socialLinks: socialLinks.filter((s) => Boolean(s.url.trim())),
        memberCount: existingClub?.memberCount || 0,
        upcomingEventIds: existingClub?.upcomingEventIds || [],
      }

      if (isEditMode && existingClub) {
        updateItem('clubs', existingClub.id, clubPayload, adminUser?.email)
        addActivity({
          userEmail: adminUser?.email || 'admin@demo.edu',
          userName: adminUser?.name || 'Administrator',
          action: 'update',
          itemType: 'club',
          itemId: existingClub.id,
          itemName: name.trim(),
          summary: `Updated club "${name.trim()}"`,
        })
        pushToast({
          type: 'success',
          message: `Saved changes to "${name.trim()}".`,
        })
      } else {
        const created = createItem('clubs', clubPayload, adminUser?.email)
        addActivity({
          userEmail: adminUser?.email || 'admin@demo.edu',
          userName: adminUser?.name || 'Administrator',
          action: 'create',
          itemType: 'club',
          itemId: created.id,
          itemName: created.name,
          summary: `Created new club "${created.name}"`,
        })
        pushToast({
          type: 'success',
          message: `Created club "${created.name}".`,
        })
      }

      setIsFormDirty(false)
      navigate('/admin/clubs')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 text-left pb-12">
      {/* Top Breadcrumb & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            to="/admin/clubs"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Clubs
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            {isEditMode ? `Edit Club: ${existingClub?.name || ''}` : 'Create New Club'}
          </h1>
        </div>

        {isEditMode && existingClub && (
          <div className="flex items-center gap-2">
            <Link
              to={`/admin/clubs/${existingClub.id}/members`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-card border border-border bg-surface hover:bg-canvas text-text-primary transition-colors"
            >
              <Users className="w-3.5 h-3.5" />
              Manage Members ({existingClub.memberCount || 0})
            </Link>
            <a
              href={`/clubs/${existingClub.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-card border border-border bg-surface hover:bg-canvas text-text-secondary hover:text-primary-600 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              View in App
            </a>
          </div>
        )}
      </div>

      {/* Main Grid: Form + Preview Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form Column */}
        <div className="lg:col-span-7 xl:col-span-8">
          <AdminForm
            onSubmit={handleSubmit}
            onCancel={() => navigate('/admin/clubs')}
            isSubmitting={isSubmitting}
            isDirty={isFormDirty}
            submitLabel={isEditMode ? 'Save Changes' : 'Create Club'}
          >
            {/* Section 1: Basic Identity */}
            <FormSection
              title="Club Identity"
              description="Basic identifying information, category, and membership registration status."
            >
              <TextField
                label="Club Name"
                value={name}
                onChange={(val) => handleFieldChange(setName, val)}
                placeholder="e.g. Google Developer Student Club"
                error={errors.name}
                required
                maxLength={80}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectField
                  label="Category"
                  value={category}
                  onChange={(e) => handleFieldChange(setCategory, e.target.value as ClubCategory)}
                  options={clubCategories.map((c) => ({
                    value: c.id,
                    label: c.label,
                  }))}
                  error={errors.category}
                  required
                />

                <SelectField
                  label="Status"
                  value={status}
                  onChange={(e) => handleFieldChange(setStatus, e.target.value as 'Active' | 'Inactive')}
                  options={[
                    { value: 'Active', label: 'Active (Visible in student directory)' },
                    { value: 'Inactive', label: 'Inactive (Hidden or paused)' },
                  ]}
                  required
                />
              </div>

              <ToggleField
                label="Accepting New Members"
                description="When enabled, students can submit join requests or enroll directly in the student app."
                checked={acceptingMembers}
                onChange={(val) => handleFieldChange(setAcceptingMembers, val)}
              />
            </FormSection>

            {/* Section 2: Visual Branding */}
            <FormSection
              title="Visual Branding"
              description="Pick an icon and brand accent color to distinguish this club across the campus app."
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-start">
                <IconPicker
                  label="Club Icon"
                  value={icon}
                  onChange={(val) => handleFieldChange(setIcon, val)}
                  helperText="Choose an icon representing this organization."
                />

                <ColorDotPicker
                  label="Brand Accent Color"
                  value={color}
                  onChange={(val) => handleFieldChange(setColor, val)}
                  helperText="Select a theme color for club badges and cards."
                />
              </div>
            </FormSection>

            {/* Section 3: Descriptions & Meeting Schedule */}
            <FormSection
              title="Overview & Meeting Schedule"
              description="Provide clear summaries and recurring meeting times for prospective members."
            >
              <TextArea
                label="Short Description"
                value={shortDescription}
                onChange={(val) => handleFieldChange(setShortDescription, val)}
                placeholder="Brief snapshot shown on club cards and directory feeds (max 140 chars)..."
                maxLength={140}
                showCharCount
                rows={2}
                error={errors.shortDescription}
                required
              />

              <RichTextLite
                label="Full Club Description"
                value={description}
                onChange={(val) => handleFieldChange(setDescription, val)}
                placeholder="Comprehensive description of the club mission, historical achievements, membership perks, and meeting structure..."
                error={errors.description}
                required
                rows={6}
              />

              <TextField
                label="Meeting Schedule"
                value={meetingSchedule}
                onChange={(val) => handleFieldChange(setMeetingSchedule, val)}
                placeholder="e.g. Every Wednesday 4:00 PM to 6:00 PM in Room 204"
                error={errors.meetingSchedule}
                helperText="Specify the day, time window, and regular campus room location."
                required
              />
            </FormSection>

            {/* Section 4: Leadership & Social Presence */}
            <FormSection
              title="Leadership & Social Links"
              description="Assign a faculty mentor, student coordinator, and public contact handles."
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SearchableSelect
                  label="Faculty Coordinator"
                  value={coordinator}
                  onChange={(val) => handleFieldChange(setCoordinator, val)}
                  options={facultyOptions}
                  placeholder="Select or enter faculty mentor..."
                  helperText="Select a registered faculty member from the directory."
                />

                <TextField
                  label="Student Lead / President"
                  value={studentLeadName}
                  onChange={(val) => handleFieldChange(setStudentLeadName, val)}
                  placeholder="e.g. Alex Rivera (CSE Sem 6)"
                  helperText="Current active student head or club president."
                />
              </div>

              {/* Dynamic Social Links List */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="block text-caption font-medium text-text-primary">
                    Social & Web Links
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddSocialLink}
                    className="flex items-center gap-1.5 text-xs py-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Link</span>
                  </Button>
                </div>

                {socialLinks.length === 0 ? (
                  <p className="text-xs text-text-muted italic py-1">
                    No social links added yet. Click &quot;Add Link&quot; to connect social media handles.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {socialLinks.map((link, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <select
                          value={link.platform}
                          onChange={(e) => handleUpdateSocialLink(idx, 'platform', e.target.value)}
                          className="min-h-[40px] px-2.5 text-xs rounded-card border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-600"
                        >
                          {SOCIAL_PLATFORMS.map((plat) => (
                            <option key={plat} value={plat}>
                              {plat}
                            </option>
                          ))}
                        </select>

                        <input
                          type="url"
                          value={link.url}
                          onChange={(e) => handleUpdateSocialLink(idx, 'url', e.target.value)}
                          placeholder="https://..."
                          className="flex-1 min-h-[40px] px-3 text-xs rounded-card border border-border bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-600"
                        />

                        <button
                          type="button"
                          onClick={() => handleRemoveSocialLink(idx)}
                          className="p-2 text-text-muted hover:text-status-error transition-colors rounded-card hover:bg-canvas"
                          title="Remove link"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </FormSection>

            {/* Section 5: Key Activities */}
            <FormSection
              title="Key Activities & Initiatives"
              description="List what members do in this club. Reorder items to change their display priority."
            >
              <ListEditor
                items={activities}
                onChange={(val) => handleFieldChange(setActivities, val)}
                placeholder="e.g. Hands-on Machine Learning study jams..."
                helperText="Students will see these activities listed on the club detail page."
              />
            </FormSection>

            {/* Section 6: Linked Upcoming Events (Read-Only) */}
            {isEditMode && existingClub && (
              <FormSection
                title="Linked Campus Events"
                description="Events organized by this club in the campus calendar (derived automatically)."
              >
                {organizedEvents.length === 0 ? (
                  <div className="p-4 rounded-card bg-canvas border border-border text-center text-xs text-text-muted">
                    No events currently associated with this club. When creating an event, select this club as the organizer.
                  </div>
                ) : (
                  <div className="divide-y divide-border border border-border rounded-card overflow-hidden">
                    {organizedEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className="p-3 bg-surface hover:bg-canvas transition-colors flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="space-y-0.5">
                          <Link
                            to={`/admin/events/${ev.id}/edit`}
                            className="font-semibold text-text-primary hover:text-primary-600 hover:underline"
                          >
                            {ev.title}
                          </Link>
                          <div className="text-text-muted flex items-center gap-3">
                            <span>{ev.date}</span>
                            <span>{ev.startTime} to {ev.endTime}</span>
                            <span className="capitalize">{ev.status}</span>
                          </div>
                        </div>

                        <Link
                          to={`/admin/events/${ev.id}/registrations`}
                          className="inline-flex items-center gap-1 text-primary-600 hover:underline shrink-0 font-medium"
                        >
                          <Users className="w-3.5 h-3.5" />
                          <span>{ev.registeredCount} registered</span>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </FormSection>
            )}
          </AdminForm>
        </div>

        {/* Right Preview Column */}
        <div className="lg:col-span-5 xl:col-span-4 sticky top-6">
          <PreviewPanel
            title="Student App Preview"
            isOpen={isPreviewOpen}
            onToggle={() => setIsPreviewOpen((prev) => !prev)}
          >
            <div className="space-y-4 text-left">
              <div className="p-1">
                <ClubCard club={previewClub} />
              </div>

              {/* Extra Preview Info Card */}
              <div className="p-4 rounded-card border border-border bg-surface text-xs space-y-2.5">
                <div className="font-semibold text-text-primary flex items-center justify-between">
                  <span>Leadership Summary</span>
                  <span
                    className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase"
                    style={{ backgroundColor: `${color}20`, color: color }}
                  >
                    {category}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-text-secondary pt-1">
                  <div>
                    <span className="text-text-muted block text-[10px]">COORDINATOR</span>
                    <span className="font-medium text-text-primary">{coordinator || 'Not set'}</span>
                  </div>
                  <div>
                    <span className="text-text-muted block text-[10px]">STUDENT LEAD</span>
                    <span className="font-medium text-text-primary">{studentLeadName || 'Not set'}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border flex items-center justify-between text-text-muted text-[11px]">
                  <span>Status: {status}</span>
                  <span>{acceptingMembers ? 'Accepting Members' : 'Membership Closed'}</span>
                </div>
              </div>
            </div>
          </PreviewPanel>
        </div>
      </div>
    </div>
  )
}
