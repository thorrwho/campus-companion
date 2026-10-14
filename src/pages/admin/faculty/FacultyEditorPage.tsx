import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import {
  ArrowLeft,
  ExternalLink,
  MapPin,
  Mail,
  Clock,
} from 'lucide-react'
import { useContentStore } from '@/store/useContentStore'
import { useActivityLogStore } from '@/store/useActivityLogStore'
import { useToastStore } from '@/store/useToastStore'
import { useAdminAuthStore } from '@/store/useAdminAuthStore'
import { Faculty, DepartmentCode } from '@/types'
import {
  AdminForm,
  FormSection,
  TextField,
  SelectField,
  SearchableSelect,
  TagInputField,
  PreviewPanel,
} from '@/components/admin'
import { Avatar } from '@/components/ui/Avatar'

const DESIGNATION_OPTIONS = [
  { value: 'Professor', label: 'Professor' },
  { value: 'Associate Professor', label: 'Associate Professor' },
  { value: 'Assistant Professor', label: 'Assistant Professor' },
  { value: 'Department Chair', label: 'Department Chair' },
  { value: 'Adjunct Lecturer', label: 'Adjunct Lecturer' },
  { value: 'Visiting Scholar', label: 'Visiting Scholar' },
]

function generateInitialsFromName(name: string): string {
  const clean = name.replace(/^(Dr\.|Prof\.|Mr\.|Ms\.|Mrs\.)\s+/i, '').trim()
  const parts = clean.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return (clean.slice(0, 2) || 'FA').toUpperCase()
}

export const FacultyEditorPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditMode = Boolean(id)

  const { faculty, departments, locations, createItem, updateItem } = useContentStore()
  const { adminUser } = useAdminAuthStore()
  const { addActivity } = useActivityLogStore()
  const { push: pushToast } = useToastStore()

  const [isPreviewOpen, setIsPreviewOpen] = useState(true)

  // Find existing faculty
  const existingFaculty = useMemo(() => {
    if (!id) return null
    return faculty.find((f) => f.id === id) || null
  }, [id, faculty])

  // Form State
  const [name, setName] = useState('')
  const [designation, setDesignation] = useState('Assistant Professor')
  const [departmentId, setDepartmentId] = useState<DepartmentCode>('CSE')
  const [officeLocationId, setOfficeLocationId] = useState('')
  const [email, setEmail] = useState('')
  const [officeHours, setOfficeHours] = useState('')
  const [subjects, setSubjects] = useState<string[]>([])
  const [initials, setInitials] = useState('')

  // Validation & Submit State
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFormDirty, setIsFormDirty] = useState(false)

  // Options
  const departmentOptions = useMemo(() => {
    return departments.map((d) => ({
      value: d.code,
      label: `${d.code} (${d.name})`,
      sublabel: `${d.semestersOffered || 8} Semesters Offered`,
    }))
  }, [departments])

  const locationOptions = useMemo(() => {
    return locations.map((loc) => ({
      value: loc.id,
      label: loc.name,
      sublabel: `${loc.building}, ${loc.floor}`,
    }))
  }, [locations])

  // Initialize or populate form
  useEffect(() => {
    if (isEditMode && existingFaculty) {
      setName(existingFaculty.name)
      setDesignation(existingFaculty.designation)
      setDepartmentId(existingFaculty.departmentId)
      setOfficeLocationId(existingFaculty.officeLocationId)
      setEmail(existingFaculty.email)
      setOfficeHours(existingFaculty.officeHours || '')
      setSubjects(existingFaculty.subjects || [])
      setInitials(existingFaculty.initials || generateInitialsFromName(existingFaculty.name))
      setIsFormDirty(false)
    } else if (!isEditMode) {
      setName('')
      setDesignation('Assistant Professor')
      setDepartmentId(departments[0]?.code || 'CSE')
      setOfficeLocationId(locations[0]?.id || '')
      setEmail('')
      setOfficeHours('Mon & Wed 2:00 PM to 4:00 PM')
      setSubjects(['Data Structures', 'Algorithms'])
      setInitials('')
      setIsFormDirty(false)
    }
  }, [isEditMode, existingFaculty, departments, locations])

  const handleFieldChange = (setter: (val: any) => void, val: any) => {
    setter(val)
    setIsFormDirty(true)
  }

  const handleNameChange = (val: string) => {
    setName(val)
    setIsFormDirty(true)
    // Only auto-generate initials if user hasn't explicitly customized them
    if (!initials || initials === generateInitialsFromName(name)) {
      setInitials(generateInitialsFromName(val))
    }
  }

  // Live Preview Object
  const previewFaculty: Faculty = useMemo(() => {
    return {
      id: existingFaculty?.id || 'preview-faculty-id',
      name: name.trim() || 'Dr. Professor Name',
      designation: designation || 'Professor',
      departmentId,
      officeLocationId,
      email: email.trim() || 'professor@demo.edu',
      officeHours: officeHours.trim() || 'Mon & Wed 2:00 PM to 4:00 PM',
      subjects: subjects.length > 0 ? subjects : ['Sample Course 101'],
      initials: initials.trim() || generateInitialsFromName(name),
    }
  }, [existingFaculty, name, designation, departmentId, officeLocationId, email, officeHours, subjects, initials])

  // Form Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!name.trim()) {
      newErrors.name = 'Full name is required'
    }

    if (!departmentId) {
      newErrors.departmentId = 'Department is required'
    }

    if (!officeLocationId) {
      newErrors.officeLocationId = 'Office location is required'
    }

    if (!email.trim()) {
      newErrors.email = 'Email address is required'
    } else if (!email.includes('@')) {
      newErrors.email = 'Please provide a valid email address (e.g. name@demo.edu)'
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
      const facultyPayload: Omit<Faculty, 'id' | 'createdAt' | 'updatedAt'> = {
        name: name.trim(),
        designation,
        departmentId,
        officeLocationId,
        email: email.trim(),
        officeHours: officeHours.trim(),
        subjects,
        initials: initials.trim() || generateInitialsFromName(name),
      }

      if (isEditMode && existingFaculty) {
        updateItem('faculty', existingFaculty.id, facultyPayload, adminUser?.email)
        addActivity({
          userEmail: adminUser?.email || 'admin@demo.edu',
          userName: adminUser?.name || 'Administrator',
          action: 'update',
          itemType: 'faculty',
          itemId: existingFaculty.id,
          itemName: name.trim(),
          summary: `Updated faculty profile for "${name.trim()}"`,
        })
        pushToast({
          type: 'success',
          message: `Saved changes to "${name.trim()}".`,
        })
      } else {
        const created = createItem('faculty', facultyPayload, adminUser?.email)
        addActivity({
          userEmail: adminUser?.email || 'admin@demo.edu',
          userName: adminUser?.name || 'Administrator',
          action: 'create',
          itemType: 'faculty',
          itemId: created.id,
          itemName: created.name,
          summary: `Created faculty profile for "${created.name}"`,
        })
        pushToast({
          type: 'success',
          message: `Created profile for "${created.name}".`,
        })
      }

      setIsFormDirty(false)
      navigate('/admin/faculty')
    } finally {
      setIsSubmitting(false)
    }
  }

  const officeLocation = locations.find((l) => l.id === officeLocationId)

  return (
    <div className="space-y-6 text-left pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <Link
            to="/admin/faculty"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-text-secondary hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Faculty
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            {isEditMode ? `Edit Profile: ${existingFaculty?.name || ''}` : 'Add Faculty Member'}
          </h1>
        </div>

        {isEditMode && existingFaculty && (
          <a
            href={`/directory?faculty=${existingFaculty.id}`}
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
            onCancel={() => navigate('/admin/faculty')}
            isSubmitting={isSubmitting}
            isDirty={isFormDirty}
            submitLabel={isEditMode ? 'Save Faculty Profile' : 'Create Profile'}
          >
            {/* Section 1: Faculty Profile & Academic Role */}
            <FormSection
              title="Personal & Academic Profile"
              description="Full name, institutional title, academic department, and campus office location."
            >
              <TextField
                label="Full Name & Title"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. Dr. Sarah Jenkins, Ph.D."
                error={errors.name}
                required
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectField
                  label="Designation"
                  value={designation}
                  onChange={(e) => handleFieldChange(setDesignation, e.target.value)}
                  options={DESIGNATION_OPTIONS}
                  required
                />

                <SearchableSelect
                  label="Department"
                  value={departmentId}
                  onChange={(val) => handleFieldChange(setDepartmentId, val as DepartmentCode)}
                  options={departmentOptions}
                  placeholder="Select academic department..."
                  error={errors.departmentId}
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SearchableSelect
                  label="Office Location"
                  value={officeLocationId}
                  onChange={(val) => handleFieldChange(setOfficeLocationId, val)}
                  options={locationOptions}
                  placeholder="Select campus office room..."
                  error={errors.officeLocationId}
                  required
                />

                <TextField
                  label="Initials"
                  value={initials}
                  onChange={(e) => handleFieldChange(setInitials, e.target.value.toUpperCase())}
                  placeholder="e.g. SJ"
                  maxLength={4}
                  helperText="Generated automatically from full name. Used for avatar badge."
                />
              </div>

              <TextField
                label="Official Email Address"
                value={email}
                onChange={(e) => handleFieldChange(setEmail, e.target.value)}
                placeholder="e.g. sarah.jenkins@demo.edu"
                error={errors.email}
                required
              />
            </FormSection>

            {/* Section 2: Office Hours & Taught Courses */}
            <FormSection
              title="Office Hours & Courses"
              description="Student consultation hours and primary curriculum courses taught by this faculty member."
            >
              <TextField
                label="Student Consultation / Office Hours"
                value={officeHours}
                onChange={(e) => handleFieldChange(setOfficeHours, e.target.value)}
                placeholder="e.g. Mon & Wed 2:00 PM to 4:00 PM in Room 204"
                helperText="Students use this to schedule academic advising meetings."
              />

              <TagInputField
                label="Taught Subjects / Courses"
                tags={subjects}
                onChange={(tags) => handleFieldChange(setSubjects, tags)}
                placeholder="Type course name and press Enter (e.g. Algorithms)..."
                helperText="Press Enter or comma to add multiple courses."
              />
            </FormSection>
          </AdminForm>
        </div>

        {/* Right Preview Column */}
        <div className="lg:col-span-5 xl:col-span-4 sticky top-6">
          <PreviewPanel
            title="Faculty Profile Preview"
            isOpen={isPreviewOpen}
            onToggle={() => setIsPreviewOpen((prev) => !prev)}
          >
            <div className="p-5 rounded-card border border-border bg-surface text-left space-y-4">
              {/* Header */}
              <div className="flex items-center gap-3.5">
                <Avatar
                  initials={previewFaculty.initials}
                  name={previewFaculty.name}
                  size="lg"
                />
                <div className="space-y-1">
                  <h3 className="font-bold text-text-primary text-base">
                    {previewFaculty.name}
                  </h3>
                  <p className="text-xs text-text-muted">{previewFaculty.designation}</p>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300">
                    {previewFaculty.departmentId}
                  </span>
                </div>
              </div>

              {/* Details List */}
              <div className="pt-3 border-t border-border space-y-2.5 text-xs">
                <div className="flex items-center gap-2 text-text-secondary">
                  <Mail className="w-4 h-4 text-text-muted shrink-0" />
                  <span className="truncate">{previewFaculty.email}</span>
                </div>

                <div className="flex items-center gap-2 text-text-secondary">
                  <MapPin className="w-4 h-4 text-text-muted shrink-0" />
                  <span>{officeLocation?.name || 'Office room not set'}</span>
                </div>

                <div className="flex items-center gap-2 text-text-secondary">
                  <Clock className="w-4 h-4 text-text-muted shrink-0" />
                  <span>{previewFaculty.officeHours}</span>
                </div>
              </div>

              {/* Courses Chips */}
              <div className="pt-3 border-t border-border">
                <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider block mb-2">
                  Courses & Specializations
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {previewFaculty.subjects.map((sub, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-full bg-canvas border border-border text-xs text-text-primary"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </PreviewPanel>
        </div>
      </div>
    </div>
  )
}
