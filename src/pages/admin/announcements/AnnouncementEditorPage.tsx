import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  Calendar,
  AlertTriangle,
  Pin,
  ExternalLink,
  Paperclip,
} from 'lucide-react'
import { useContentStore } from '@/store/useContentStore'
import { useActivityLogStore } from '@/store/useActivityLogStore'
import { useToastStore } from '@/store/useToastStore'
import { useAdminAuthStore } from '@/store/useAdminAuthStore'
import { Announcement, AnnouncementCategory, DepartmentCode } from '@/types'
import {
  AdminForm,
  FormSection,
  TextField,
  TextArea,
  RichTextLite,
  SelectField,
  MultiSelectField,
  DatePickerField,
  ToggleField,
  PreviewPanel,
} from '@/components/admin'
import { Button } from '@/components/ui/Button'

export const AnnouncementEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const { announcements, announcementCategories, departments, createItem, updateItem } =
    useContentStore()
  const { addActivity } = useActivityLogStore()
  const { push: pushToast } = useToastStore()
  const { adminUser } = useAdminAuthStore()

  // Form Fields State
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<AnnouncementCategory>('academic')
  const [postedBy, setPostedBy] = useState('Office of the Dean')
  const [summary, setSummary] = useState('')
  const [bodyMarkdown, setBodyMarkdown] = useState('')
  const [status, setStatus] = useState<'Draft' | 'Published' | 'Scheduled' | 'Archived'>('Published')
  const [publishDate, setPublishDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [expiryDate, setExpiryDate] = useState('')
  const [pinned, setPinned] = useState(false)
  const [isImportant, setIsImportant] = useState(false)
  const [attachmentName, setAttachmentName] = useState('')

  // Audience State
  const [audienceType, setAudienceType] = useState<'all' | 'specific'>('all')
  const [targetDepts, setTargetDepts] = useState<string[]>([])
  const [targetSemesters, setTargetSemesters] = useState<string[]>([])

  // UI States
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Load existing announcement if editing
  useEffect(() => {
    if (isEditing && id) {
      const existing = announcements.find((a) => a.id === id)
      if (existing) {
        setTitle(existing.title)
        setCategory(existing.category)
        setPostedBy(existing.postedBy || 'Office of the Dean')
        setPinned(Boolean(existing.pinned))
        setIsImportant(Boolean(existing.isImportant))
        setStatus((existing.status as 'Draft' | 'Published' | 'Scheduled' | 'Archived') || 'Published')
        setPublishDate(existing.postedAt || new Date().toISOString().slice(0, 10))
        setExpiryDate(existing.expiryDate || '')
        setAttachmentName(existing.attachmentName || '')

        // Parse body
        if (Array.isArray(existing.body)) {
          setSummary(existing.body[0] || '')
          setBodyMarkdown(existing.body.join('\n\n'))
        } else {
          setSummary(existing.body ? existing.body.slice(0, 150) : '')
          setBodyMarkdown(existing.body || '')
        }

        // Parse audience
        if (existing.targetAudience && existing.targetAudience.type === 'specific') {
          setAudienceType('specific')
          const rawDepts = existing.targetAudience.departments || []
          const mappedDepts = rawDepts.map((dVal) => {
            const found = departments.find((d) => d.id === dVal || d.code === dVal)
            return found ? found.id : dVal
          })
          setTargetDepts(mappedDepts)
          setTargetSemesters(
            (existing.targetAudience.semesters || []).map((s) => String(s))
          )
        } else {
          setAudienceType('all')
          setTargetDepts([])
          setTargetSemesters([])
        }
      }
    }
  }, [isEditing, id, announcements, departments])

  // Mark dirty on changes
  const markDirty = () => {
    if (!isDirty) setIsDirty(true)
  }

  // Validation
  const validate = (): boolean => {
    const errs: Record<string, string> = {}
    if (!title.trim()) {
      errs.title = 'Title is required'
    } else if (title.trim().length < 5) {
      errs.title = 'Title must be at least 5 characters'
    }
    if (!postedBy.trim()) {
      errs.postedBy = 'Author or posting department is required'
    }
    if (!bodyMarkdown.trim() && !summary.trim()) {
      errs.body = 'Announcement content is required'
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

    // Prepare content payload
    const bodyContent = bodyMarkdown.trim() ? bodyMarkdown : summary

    const announcementData: Omit<Announcement, 'id' | 'createdAt' | 'updatedAt'> = {
      title: title.trim(),
      category,
      postedBy: postedBy.trim(),
      postedAt: publishDate,
      body: bodyContent,
      pinned,
      isImportant,
      status: effectiveStatus,
      expiryDate: expiryDate || undefined,
      attachmentName: attachmentName.trim() || undefined,
      targetAudience:
        audienceType === 'all'
          ? { type: 'all' }
          : {
              type: 'specific',
              departments: targetDepts as DepartmentCode[],
              semesters: targetSemesters.map((s) => Number(s)),
            },
    }

    // Simulate 600ms save latency
    await new Promise((resolve) => setTimeout(resolve, 600))

    if (isEditing && id) {
      updateItem('announcements', id, announcementData, adminUser?.email)
      addActivity({
        userEmail: adminUser?.email || 'admin@demo.edu',
        userName: adminUser?.name || 'Administrator',
        action: 'update',
        itemType: 'announcement',
        itemId: id,
        itemName: title.trim(),
        summary: `Updated announcement "${title.trim()}" (status: ${effectiveStatus})`,
      })
      pushToast({
        type: 'success',
        message: `Announcement "${title.trim()}" updated successfully.`,
      })
    } else {
      const created = createItem('announcements', announcementData, adminUser?.email)
      addActivity({
        userEmail: adminUser?.email || 'admin@demo.edu',
        userName: adminUser?.name || 'Administrator',
        action: 'create',
        itemType: 'announcement',
        itemId: created.id,
        itemName: created.title,
        summary: `Created announcement "${created.title}" (status: ${effectiveStatus})`,
      })
      pushToast({
        type: 'success',
        message: `Announcement "${created.title}" created successfully.`,
      })
    }

    setIsSubmitting(false)
    setIsDirty(false)
    navigate('/admin/announcements')
  }

  // Department options for multi-select: sorted by name with value: dept.id
  const departmentOptions = React.useMemo(() => {
    return [...departments]
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((d) => ({
        value: d.id,
        label: `${d.name} (${d.code})`,
      }))
  }, [departments])

  const [semesterPrunedHint, setSemesterPrunedHint] = useState<string | null>(null)

  // Derived available semesters count based on selected departments' semesters offered
  const availableSemestersCount = React.useMemo(() => {
    if (targetDepts.length === 0) {
      return 8
    }
    const selectedDeptObjs = departments.filter(
      (d) => targetDepts.includes(d.id) || targetDepts.includes(d.code)
    )
    if (selectedDeptObjs.length === 0) {
      return 8
    }
    const maxOffered = Math.max(...selectedDeptObjs.map((d) => d.semestersOffered || 8))
    return Math.max(1, Math.min(8, maxOffered))
  }, [targetDepts, departments])

  // Derive semester options
  const semesterOptions = React.useMemo(() => {
    return Array.from({ length: availableSemestersCount }, (_, i) => ({
      value: String(i + 1),
      label: `Semester ${i + 1}`,
    }))
  }, [availableSemestersCount])

  // If a selected semester is no longer valid after departments change, remove it and show hint
  useEffect(() => {
    const invalidSelected = targetSemesters.filter((s) => Number(s) > availableSemestersCount)
    if (invalidSelected.length > 0) {
      setTargetSemesters((prev) => prev.filter((s) => Number(s) <= availableSemestersCount))
      setSemesterPrunedHint(
        `Semester ${invalidSelected.join(', ')} was removed because it is not offered by the selected department(s).`
      )
    } else {
      setSemesterPrunedHint(null)
    }
  }, [availableSemestersCount, targetSemesters])

  return (
    <div className="space-y-6 text-left max-w-5xl mx-auto">
      {/* Top Breadcrumb and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            to="/admin/announcements"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Announcements
          </Link>
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            {isEditing ? 'Edit Announcement' : 'Create New Announcement'}
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
              onClick={() => navigate(`/announcements/${id}`)}
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
        onCancel={() => navigate('/admin/announcements')}
        onSaveDraft={() => handleSave('Draft')}
        isSubmitting={isSubmitting}
        isDirty={isDirty}
        submitLabel={isEditing ? 'Save Changes' : 'Publish Announcement'}
        draftLabel="Save as Draft"
        stickyFooter
      >
        {/* Section 1: Overview & Content */}
        <FormSection
          title="Announcement Details"
          description="Basic information, circular title, and full content."
        >
          <TextField
            label="Announcement Title"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value)
              markDirty()
            }}
            placeholder="e.g. Schedule for Mid-Term Examination Spring 2026"
            error={errors.title}
            required
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              label="Category"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value as AnnouncementCategory)
                markDirty()
              }}
              options={announcementCategories.map((c) => ({
                value: c.id,
                label: c.label,
              }))}
              required
            />

            <TextField
              label="Author / Publishing Authority"
              value={postedBy}
              onChange={(e) => {
                setPostedBy(e.target.value)
                markDirty()
              }}
              placeholder="e.g. Dean of Academic Affairs"
              error={errors.postedBy}
              required
            />
          </div>

          <TextArea
            label="Brief Summary"
            value={summary}
            onChange={(e) => {
              setSummary(e.target.value)
              markDirty()
            }}
            maxLength={250}
            rows={2}
            helperText="Quick 1 to 2 sentence summary shown on feeds and notification previews."
          />

          <RichTextLite
            label="Announcement Body (Markdown Supported)"
            value={bodyMarkdown}
            onChange={(val) => {
              setBodyMarkdown(val)
              markDirty()
            }}
            placeholder="Write full announcement content here. Use markdown headings, bullet lists, and links..."
            rows={8}
            error={errors.body}
            helperText="Formatted text, guidelines, and reference links for students."
          />
        </FormSection>

        {/* Section 2: Publishing & Schedule */}
        <FormSection
          title="Publishing & Status"
          description="Control publication lifecycle, priority flags, and expiration."
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SelectField
              label="Publication Status"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as typeof status)
                markDirty()
              }}
              options={[
                { value: 'Draft', label: 'Draft' },
                { value: 'Published', label: 'Published' },
                { value: 'Scheduled', label: 'Scheduled' },
                { value: 'Archived', label: 'Archived' },
              ]}
              required
            />

            <DatePickerField
              label="Publish Date"
              value={publishDate}
              onChange={(d) => {
                setPublishDate(d)
                markDirty()
              }}
              helperText="Date displayed on announcement card."
            />

            <DatePickerField
              label="Expiry Date (Optional)"
              value={expiryDate}
              onChange={(d) => {
                setExpiryDate(d)
                markDirty()
              }}
              minDate={publishDate}
              helperText="Auto-archives after this date."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <ToggleField
              label="Pin to Top of Announcements"
              description="Keep this circular fixed at the top of the student feed."
              checked={pinned}
              onChange={(val) => {
                setPinned(val)
                markDirty()
              }}
              badge="Top Priority"
            />

            <ToggleField
              label="Mark as Urgent / Important"
              description="Displays with warning accents to draw student attention."
              checked={isImportant}
              onChange={(val) => {
                setIsImportant(val)
                markDirty()
              }}
              badge="High Visibility"
            />
          </div>
        </FormSection>

        {/* Section 3: Audience Targeting */}
        <FormSection
          title="Audience Targeting"
          description="Direct this announcement to all students or specific departments and semesters."
        >
          <div className="space-y-4">
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-text-primary">
                <input
                  type="radio"
                  name="audienceScope"
                  checked={audienceType === 'all'}
                  onChange={() => {
                    setAudienceType('all')
                    markDirty()
                  }}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-600"
                />
                All Campus Students (Campus-Wide)
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-sm font-medium text-text-primary">
                <input
                  type="radio"
                  name="audienceScope"
                  checked={audienceType === 'specific'}
                  onChange={() => {
                    setAudienceType('specific')
                    markDirty()
                  }}
                  className="w-4 h-4 text-primary-600 focus:ring-primary-600"
                />
                Target Specific Groups
              </label>
            </div>

            {audienceType === 'specific' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-card border border-border bg-canvas/40 animate-fade-in">
                <MultiSelectField
                  label="Target Departments"
                  values={targetDepts}
                  onChange={(vals) => {
                    setTargetDepts(vals)
                    markDirty()
                  }}
                  options={departmentOptions}
                  placeholder="All departments if empty"
                  helperText="Leave empty to target all departments in chosen semesters."
                  emptyOptionsMessage="No departments yet"
                  emptyOptionsLink={{
                    label: 'Add departments',
                    href: '/admin/departments',
                  }}
                />

                <div className="space-y-1">
                  <MultiSelectField
                    label="Target Semesters"
                    values={targetSemesters}
                    onChange={(vals) => {
                      setTargetSemesters(vals)
                      markDirty()
                    }}
                    options={semesterOptions}
                    placeholder="All semesters if empty"
                    helperText="Leave empty to target all semesters in chosen departments."
                  />
                  {semesterPrunedHint && (
                    <p className="text-xs text-amber-600 mt-1 flex items-center gap-1 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{semesterPrunedHint}</span>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </FormSection>

        {/* Section 4: Attachments */}
        <FormSection
          title="Attachment Reference"
          description="Reference a downloadable PDF or document file name."
          collapsible
        >
          <TextField
            label="Document / PDF File Name"
            value={attachmentName}
            onChange={(e) => {
              setAttachmentName(e.target.value)
              markDirty()
            }}
            placeholder="e.g. spring_2026_exam_timetable.pdf"
            leftIcon={<Paperclip className="w-4 h-4" />}
            helperText="Provides a downloadable attachment badge on the student detail page."
          />
        </FormSection>
      </AdminForm>

      {/* Live Preview Panel */}
      <PreviewPanel
        isOpen={isPreviewOpen}
        onToggle={() => setIsPreviewOpen(!isPreviewOpen)}
        title="Live Preview: Student Announcement Card"
      >
        <div className="p-4 rounded-card border border-border bg-surface shadow-card space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-accent-100 text-primary-700 capitalize">
                {category || 'General'}
              </span>
              {pinned && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 flex items-center gap-1">
                  <Pin className="w-2.5 h-2.5" /> Pinned
                </span>
              )}
              {isImportant && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-800 flex items-center gap-1">
                  <AlertTriangle className="w-2.5 h-2.5" /> Urgent
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-text-muted">
              <Calendar className="w-3.5 h-3.5" />
              <span>{publishDate}</span>
            </div>
          </div>

          <h3 className="text-base font-bold text-text-primary">
            {title || 'Announcement Title'}
          </h3>

          <p className="text-sm text-text-secondary leading-relaxed line-clamp-3">
            {summary || bodyMarkdown || 'The summary and body content of the announcement will appear here.'}
          </p>

          {attachmentName && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-canvas border border-border text-xs text-text-secondary">
              <Paperclip className="w-3 h-3 text-primary-600" />
              <span>{attachmentName}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between text-xs text-text-muted border-t border-border/60">
            <span>Posted by: {postedBy || 'Campus Administration'}</span>
            <span className="text-primary-600 font-medium">Read details</span>
          </div>
        </div>
      </PreviewPanel>
    </div>
  )
}
