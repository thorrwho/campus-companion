import React, { useState } from 'react'
import {
  Calendar,
  Mail,
  Heart,
  Settings,
  Share2,
  Trash2,
  Bookmark,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Info,
  AlertCircle,
  Sparkles,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/Button'
import { IconButton } from '@/components/ui/IconButton'
import { Input } from '@/components/ui/Input'
import { PasswordInput } from '@/components/ui/PasswordInput'
import { SearchBar } from '@/components/ui/SearchBar'
import { Select } from '@/components/ui/Select'
import { Checkbox } from '@/components/ui/Checkbox'
import { Toggle } from '@/components/ui/Toggle'
import { Tabs } from '@/components/ui/Tabs'
import { Chip } from '@/components/ui/Chip'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { Card } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { Skeleton, SkeletonText, SkeletonCard } from '@/components/ui/Skeleton'
import { PasswordStrengthMeter } from '@/components/domain/PasswordStrengthMeter'
import { useToastStore } from '@/store/useToastStore'
import {
  StatusBadge,
  ConfirmDialog,
  AdminForm,
  FormSection,
  TextField,
  TextArea,
  RichTextLite,
  SelectField,
  SearchableSelect,
  MultiSelectField,
  DatePickerField,
  TimePickerField,
  NumberField,
  ToggleField,
  TagInputField,
  ListEditor,
  ColorDotPicker,
  IconPicker,
  DataTable,
  DataTableColumn,
  PreviewPanel,
} from '@/components/admin'

export const StyleguidePage: React.FC = () => {
  const { push: pushToast } = useToastStore()

  // Form states for demonstration
  const [textValue, setTextValue] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [passwordDemo, setPasswordDemo] = useState('Pass1234!')
  const [selectVal, setSelectVal] = useState('cse-aiml')
  const [checkboxVal, setCheckboxVal] = useState(true)
  const [toggleVal, setToggleVal] = useState(true)
  const [activeTabUnderline, setActiveTabUnderline] = useState('all')
  const [activeTabPill, setActiveTabPill] = useState('active')
  const [selectedChips, setSelectedChips] = useState<string[]>(['hackathon', 'workshop'])
  const [isModalOpen, setIsModalOpen] = useState(false)

  const demoOptions = [
    { value: 'cse', label: 'Computer Science and Engineering' },
    { value: 'cse-aiml', label: 'CSE (AI and Machine Learning)' },
    { value: 'ece', label: 'Electronics and Communication' },
  ]

  const toggleChip = (id: string) => {
    setSelectedChips((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  // Admin Portal Component States
  const [adminText, setAdminText] = useState('Campus Hackathon 2026')
  const [adminTextArea, setAdminTextArea] = useState(
    'Join fellow builders and creators for a 48 hour collaborative development sprint.'
  )
  const [adminRichText, setAdminRichText] = useState(
    '### Event Information\n\n- Check-in begins at 08:30 at Main Auditorium\n- Mentorship sessions occur throughout the weekend\n- Read our [Rules and Guidelines](https://example.com) before arrival.'
  )
  const [adminSelect, setAdminSelect] = useState('Published')
  const [adminSearchable, setAdminSearchable] = useState('loc-1')
  const [adminMultiSelect, setAdminMultiSelect] = useState<string[]>(['hackathon', 'workshop'])
  const [adminDate, setAdminDate] = useState('2026-11-20')
  const [adminTime, setAdminTime] = useState('09:30')
  const [adminNumber, setAdminNumber] = useState(120)
  const [adminToggle, setAdminToggle] = useState(true)
  const [adminTags, setAdminTags] = useState<string[]>(['engineering', 'coding', 'annual'])
  const [adminList, setAdminList] = useState<string[]>([
    'Bring student ID card',
    'Pre-register your laptop at security desk',
    'Follow campus code of conduct',
  ])
  const [adminColor, setAdminColor] = useState('#2563eb')
  const [adminIcon, setAdminIcon] = useState('Calendar')
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isHighRiskConfirmOpen, setIsHighRiskConfirmOpen] = useState(false)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [tableFilterStatus, setTableFilterStatus] = useState('all')

  const sampleTableData = [
    {
      id: 'ann-1',
      title: 'Spring Semester Registration Closes Friday',
      category: 'Academic',
      status: 'Published',
      date: '2026-10-18',
      author: 'Office of Registrar',
    },
    {
      id: 'ann-2',
      title: 'Central Library Extended Night Study Hours',
      category: 'Facility',
      status: 'Published',
      date: '2026-10-17',
      author: 'Campus Services',
    },
    {
      id: 'ann-3',
      title: 'Annual Robotics Symposium Call for Submissions',
      category: 'Clubs',
      status: 'Scheduled',
      date: '2026-10-25',
      author: 'Robotics Club',
    },
    {
      id: 'ann-4',
      title: 'Inter-Department Football Tournament Finals',
      category: 'Sports',
      status: 'Draft',
      date: '2026-11-02',
      author: 'Athletics Office',
    },
    {
      id: 'ann-5',
      title: 'Campus Shuttle Bus Schedule Updates',
      category: 'Transit',
      status: 'Archived',
      date: '2026-09-30',
      author: 'Transport Desk',
    },
  ]

  const sampleSearchableOptions = [
    { value: 'loc-1', label: 'Main Auditorium', sublabel: 'Building A, Floor 1', badge: 'Auditorium' },
    { value: 'loc-2', label: 'Computer Science Lab 3', sublabel: 'Turing Hall, Floor 2', badge: 'Lab' },
    { value: 'loc-3', label: 'Student Recreation Hub', sublabel: 'Campus Center, Ground', badge: 'Social' },
    { value: 'loc-4', label: 'Central Library Reading Hall', sublabel: 'Library Wing', badge: 'Study' },
  ]

  const sampleMultiSelectOptions = [
    { value: 'hackathon', label: 'Hackathon', badge: 'Featured' },
    { value: 'workshop', label: 'Workshop' },
    { value: 'seminar', label: 'Seminar' },
    { value: 'sports', label: 'Sports' },
    { value: 'cultural', label: 'Cultural' },
  ]

  const tableColumns: DataTableColumn<(typeof sampleTableData)[0]>[] = [
    {
      key: 'title',
      header: 'Title',
      sortable: true,
      render: (item) => (
        <span className="font-semibold text-text-primary hover:text-primary-600 transition-colors">
          {item.title}
        </span>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (item) => (
        <span className="text-xs font-medium px-2 py-0.5 rounded bg-canvas border border-border text-text-secondary">
          {item.category}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (item) => <StatusBadge status={item.status} size="sm" />,
    },
    {
      key: 'date',
      header: 'Date',
      sortable: true,
      render: (item) => <span className="text-xs font-mono text-text-muted">{item.date}</span>,
    },
    {
      key: 'author',
      header: 'Author',
      hideOnMobile: true,
      render: (item) => <span className="text-xs text-text-secondary">{item.author}</span>,
    },
  ]

  return (
    <div className="space-y-12 pb-16 text-left">
      <PageHeader
        title="Design System & UI Component Inventory"
        subtitle="Live catalog of tokens, typography, and interactive components in all states."
      />

      {/* 1. COLOR TOKENS */}
      <section className="space-y-4">
        <h2 className="text-h2 font-semibold text-text-primary border-b border-border pb-2">
          1. Color Tokens (WCAG AA Compliant)
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 rounded-card bg-primary-900 text-white shadow-card">
            <div className="text-caption font-semibold">primary-900</div>
            <div className="text-small font-mono mt-1">#0B1F44</div>
            <div className="text-[11px] opacity-75 mt-0.5">Brand / Headings</div>
          </div>
          <div className="p-3 rounded-card bg-primary-700 text-white shadow-card">
            <div className="text-caption font-semibold">primary-700</div>
            <div className="text-small font-mono mt-1">#14306B</div>
            <div className="text-[11px] opacity-75 mt-0.5">Deep Blue</div>
          </div>
          <div className="p-3 rounded-card bg-primary-600 text-white shadow-card">
            <div className="text-caption font-semibold">primary-600</div>
            <div className="text-small font-mono mt-1">#1D4ED8</div>
            <div className="text-[11px] opacity-75 mt-0.5">Royal Blue / Action</div>
          </div>
          <div className="p-3 rounded-card bg-primary-500 text-white shadow-card">
            <div className="text-caption font-semibold">primary-500</div>
            <div className="text-small font-mono mt-1">#2563EB</div>
            <div className="text-[11px] opacity-75 mt-0.5">Hover State</div>
          </div>
          <div className="p-3 rounded-card bg-accent-100 text-primary-900 border border-border shadow-card">
            <div className="text-caption font-semibold">accent-100</div>
            <div className="text-small font-mono mt-1">#E0F2FE</div>
            <div className="text-[11px] text-text-muted mt-0.5">Soft Sky Highlight</div>
          </div>
          <div className="p-3 rounded-card bg-accent-200 text-primary-900 border border-border shadow-card">
            <div className="text-caption font-semibold">accent-200</div>
            <div className="text-small font-mono mt-1">#BAE6FD</div>
            <div className="text-[11px] text-text-muted mt-0.5">Sky Accent</div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-card bg-status-success-bg border border-status-success/30 text-status-success">
            <div className="text-caption font-bold">Status Success</div>
            <div className="text-small font-mono mt-0.5">#15803D</div>
          </div>
          <div className="p-3 rounded-card bg-status-warning-bg border border-status-warning/30 text-status-warning">
            <div className="text-caption font-bold">Status Warning</div>
            <div className="text-small font-mono mt-0.5">#B45309</div>
          </div>
          <div className="p-3 rounded-card bg-status-error-bg border border-status-error/30 text-status-error">
            <div className="text-caption font-bold">Status Error</div>
            <div className="text-small font-mono mt-0.5">#B91C1C</div>
          </div>
          <div className="p-3 rounded-card bg-status-info-bg border border-status-info/30 text-status-info">
            <div className="text-caption font-bold">Status Info</div>
            <div className="text-small font-mono mt-0.5">#1D4ED8</div>
          </div>
        </div>
      </section>

      {/* 2. TYPOGRAPHY SCALE */}
      <section className="space-y-4">
        <h2 className="text-h2 font-semibold text-text-primary border-b border-border pb-2">
          2. Typography Scale (Inter)
        </h2>
        <Card className="space-y-3">
          <div>
            <span className="text-caption text-text-muted block">Display (28px / 36px, semibold):</span>
            <div className="text-display text-text-primary font-semibold">
              Your Campus. One Companion.
            </div>
          </div>
          <div className="pt-2 border-t border-border">
            <span className="text-caption text-text-muted block">Heading 2 (20px / 28px, semibold):</span>
            <div className="text-h2 text-text-primary font-semibold">
              Today at Campus Companion Demo College
            </div>
          </div>
          <div className="pt-2 border-t border-border">
            <span className="text-caption text-text-muted block">Heading 3 (16px / 24px, semibold):</span>
            <div className="text-h3 text-text-primary font-semibold">
              Department of Computer Science and Engineering
            </div>
          </div>
          <div className="pt-2 border-t border-border">
            <span className="text-caption text-text-muted block">Body (14px / 22px, regular):</span>
            <p className="text-body text-text-secondary">
              Interactive campus navigation, academic notifications, timetable slots, and facility timings.
            </p>
          </div>
          <div className="pt-2 border-t border-border">
            <span className="text-caption text-text-muted block">Small (13px / 20px, regular):</span>
            <p className="text-small text-text-muted">
              Room 302, Academic Block A, Third Floor. Open until 8:00 PM.
            </p>
          </div>
          <div className="pt-2 border-t border-border">
            <span className="text-caption text-text-muted block">Caption (12px / 16px, medium):</span>
            <p className="text-caption text-text-muted uppercase tracking-wider">
              Prototype Notice: No real accounts or passwords stored.
            </p>
          </div>
        </Card>
      </section>

      {/* 3. BUTTONS & ICON BUTTONS */}
      <section className="space-y-4">
        <h2 className="text-h2 font-semibold text-text-primary border-b border-border pb-2">
          3. Buttons and Icon Buttons
        </h2>
        <Card className="space-y-6">
          {/* Variants */}
          <div>
            <h3 className="text-small font-semibold text-text-muted uppercase tracking-wider mb-3">
              Button Variants
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
            </div>
          </div>

          {/* Sizes */}
          <div>
            <h3 className="text-small font-semibold text-text-muted uppercase tracking-wider mb-3">
              Sizes & Icons
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm" leftIcon={<Sparkles className="w-3.5 h-3.5" />}>
                Small Action
              </Button>
              <Button size="md" leftIcon={<Calendar className="w-4 h-4" />}>
                Medium Default
              </Button>
              <Button size="lg" rightIcon={<MapPin className="w-5 h-5" />}>
                Large Action
              </Button>
              <Button variant="primary" isLoading>
                Loading
              </Button>
              <Button variant="primary" disabled>
                Disabled
              </Button>
            </div>
          </div>

          {/* Icon Buttons */}
          <div>
            <h3 className="text-small font-semibold text-text-muted uppercase tracking-wider mb-3">
              Icon Buttons (Accessible aria-labels)
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              <IconButton aria-label="Bookmark page" variant="primary" icon={<Bookmark className="w-4 h-4" />} />
              <IconButton aria-label="Favorite item" variant="secondary" icon={<Heart className="w-4 h-4" />} />
              <IconButton aria-label="Share resource" variant="outline" icon={<Share2 className="w-4 h-4" />} />
              <IconButton aria-label="Settings configuration" variant="ghost" icon={<Settings className="w-4 h-4" />} />
              <IconButton aria-label="Delete entry" variant="danger" icon={<Trash2 className="w-4 h-4" />} />
              <IconButton aria-label="Disabled action" variant="outline" disabled icon={<Heart className="w-4 h-4" />} />
            </div>
          </div>
        </Card>
      </section>

      {/* 4. FORM INPUTS & SELECTION */}
      <section className="space-y-4">
        <h2 className="text-h2 font-semibold text-text-primary border-b border-border pb-2">
          4. Form Inputs and Selection Controls
        </h2>
        <Card className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <Input
              id="demo-input-text"
              label="Standard Text Input"
              placeholder="Enter something..."
              value={textValue}
              onChange={(e) => setTextValue(e.target.value)}
              hint="Helpful guidance appears below the field."
            />

            <Input
              id="demo-input-icon"
              label="Input with Left Icon"
              placeholder="you@demo.edu"
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Input
              id="demo-input-error"
              label="Input with Validation Error"
              defaultValue="invalid@domain"
              error="Please enter a valid college email address."
            />

            <Input
              id="demo-input-disabled"
              label="Disabled Input"
              defaultValue="Read-only system value"
              disabled
            />
          </div>

          <div className="space-y-4">
            <PasswordInput
              id="demo-password-field"
              label="Password Input with Show / Hide Toggle"
              value={passwordDemo}
              onChange={(e) => setPasswordDemo(e.target.value)}
            />
            <PasswordStrengthMeter password={passwordDemo} />

            <SearchBar
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search rooms, faculty, events..."
            />

            <Select
              id="demo-select-field"
              label="Select Dropdown"
              value={selectVal}
              options={demoOptions}
              onChange={(e) => setSelectVal(e.target.value)}
            />
          </div>
        </Card>

        {/* Checkbox and Toggle */}
        <Card className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="text-small font-semibold text-text-muted uppercase tracking-wider mb-2">
              Checkboxes
            </h3>
            <Checkbox
              id="demo-check-1"
              label="Active student checkbox"
              checked={checkboxVal}
              onChange={(e) => setCheckboxVal(e.target.checked)}
            />
            <Checkbox
              id="demo-check-2"
              label="Disabled unchecked option"
              checked={false}
              disabled
            />
            <Checkbox
              id="demo-check-3"
              label="Checkbox with error requirement"
              checked={false}
              error="This acknowledgment is required."
            />
          </div>

          <div className="space-y-3">
            <h3 className="text-small font-semibold text-text-muted uppercase tracking-wider mb-2">
              Toggle Switches (role="switch")
            </h3>
            <Toggle
              label="Push notifications for exam circulars"
              description="Receive instant alerts for academic updates."
              checked={toggleVal}
              onChange={setToggleVal}
            />
            <Toggle
              label="Disabled switch option"
              description="Feature locked by administrator."
              checked={false}
              disabled
              onChange={() => {}}
            />
          </div>
        </Card>
      </section>

      {/* 5. TABS & CHIPS */}
      <section className="space-y-4">
        <h2 className="text-h2 font-semibold text-text-primary border-b border-border pb-2">
          5. Navigation Tabs and Filter Chips
        </h2>
        <Card className="space-y-6">
          <div>
            <h3 className="text-small font-semibold text-text-muted uppercase tracking-wider mb-2">
              Underline Tabs
            </h3>
            <Tabs
              activeTab={activeTabUnderline}
              onChange={setActiveTabUnderline}
              tabs={[
                { id: 'all', label: 'All Items', count: 18 },
                { id: 'academic', label: 'Academic', count: 6 },
                { id: 'examination', label: 'Examination', count: 4 },
                { id: 'placement', label: 'Placement', count: 8 },
              ]}
            />
          </div>

          <div>
            <h3 className="text-small font-semibold text-text-muted uppercase tracking-wider mb-2">
              Pill Tabs
            </h3>
            <Tabs
              variant="pill"
              activeTab={activeTabPill}
              onChange={setActiveTabPill}
              tabs={[
                { id: 'active', label: 'Active (5)' },
                { id: 'completed', label: 'Completed (12)' },
                { id: 'archived', label: 'Archived (2)' },
              ]}
            />
          </div>

          <div>
            <h3 className="text-small font-semibold text-text-muted uppercase tracking-wider mb-2">
              Filter Chips (Selectable)
            </h3>
            <div className="flex flex-wrap gap-2">
              {['workshop', 'hackathon', 'seminar', 'cultural', 'sports'].map((id) => (
                <Chip
                  key={id}
                  label={id.charAt(0).toUpperCase() + id.slice(1)}
                  selected={selectedChips.includes(id)}
                  onClick={() => toggleChip(id)}
                />
              ))}
            </div>
          </div>
        </Card>
      </section>

      {/* 6. BADGES, AVATARS & CARDS */}
      <section className="space-y-4">
        <h2 className="text-h2 font-semibold text-text-primary border-b border-border pb-2">
          6. Badges, Avatars, and Cards
        </h2>
        <Card className="space-y-6">
          <div>
            <h3 className="text-small font-semibold text-text-muted uppercase tracking-wider mb-3">
              Badges (Paired with text and dots)
            </h3>
            <div className="flex flex-wrap items-center gap-2.5">
              <Badge variant="default">Default</Badge>
              <Badge variant="primary" dot>Primary</Badge>
              <Badge variant="success" dot>Open Now</Badge>
              <Badge variant="warning" dot>Closes Soon</Badge>
              <Badge variant="error" dot>Closed</Badge>
              <Badge variant="info" icon={<Info className="w-3 h-3" />}>Notice</Badge>
              <Badge variant="neutral">Draft</Badge>
            </div>
          </div>

          <div>
            <h3 className="text-small font-semibold text-text-muted uppercase tracking-wider mb-3">
              Avatars (Initials and responsive sizes)
            </h3>
            <div className="flex items-center gap-4">
              <Avatar initials="AS" name="Aarav Sharma" size="sm" />
              <Avatar initials="JD" name="Jane Doe" size="md" />
              <Avatar initials="RK" name="Rohan Kumar" size="lg" />
            </div>
          </div>

          <div>
            <h3 className="text-small font-semibold text-text-muted uppercase tracking-wider mb-3">
              Cards (Default, Hoverable, Padded)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card padding="sm">
                <div className="text-small font-semibold">Small Padding</div>
                <div className="text-caption text-text-muted mt-1">Compact summary card</div>
              </Card>
              <Card padding="md" hover>
                <div className="text-small font-semibold">Hoverable Card</div>
                <div className="text-caption text-text-muted mt-1">Interacts on hover</div>
              </Card>
              <Card padding="lg">
                <div className="text-small font-semibold">Large Padding</div>
                <div className="text-caption text-text-muted mt-1">Spacious content card</div>
              </Card>
            </div>
          </div>
        </Card>
      </section>

      {/* 7. FEEDBACK & OVERLAYS (TOASTS, MODALS, STATES) */}
      <section className="space-y-4">
        <h2 className="text-h2 font-semibold text-text-primary border-b border-border pb-2">
          7. Interactive Feedback & Overlays
        </h2>
        <Card className="space-y-6">
          <div>
            <h3 className="text-small font-semibold text-text-muted uppercase tracking-wider mb-3">
              Toast Notifications (Auto-dismiss 4s, polite aria-live)
            </h3>
            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<CheckCircle className="w-4 h-4 text-status-success" />}
                onClick={() =>
                  pushToast({
                    type: 'success',
                    message: 'Event registration confirmed successfully.',
                  })
                }
              >
                Trigger Success Toast
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<AlertTriangle className="w-4 h-4 text-status-warning" />}
                onClick={() =>
                  pushToast({
                    type: 'warning',
                    message: 'Seats are filling quickly: only 4 spots remaining.',
                  })
                }
              >
                Trigger Warning Toast
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<AlertCircle className="w-4 h-4 text-status-error" />}
                onClick={() =>
                  pushToast({
                    type: 'error',
                    message: 'Registration closed. Deadline has passed.',
                  })
                }
              >
                Trigger Error Toast
              </Button>
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Info className="w-4 h-4 text-status-info" />}
                onClick={() =>
                  pushToast({
                    type: 'info',
                    message: 'Calendar invite (.ics) downloaded.',
                  })
                }
              >
                Trigger Info Toast
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-small font-semibold text-text-muted uppercase tracking-wider mb-3">
              Modal Dialog (Focus Trap, Esc Close, role="dialog")
            </h3>
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsModalOpen(true)}
            >
              Open Interactive Modal
            </Button>
          </div>
        </Card>

        {/* Modal instance */}
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Interactive Dialog Demo"
          description="This dialog traps keyboard focus, closes on Escape, and returns focus."
          footer={
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setIsModalOpen(false)
                  pushToast({
                    type: 'success',
                    message: 'Modal action confirmed.',
                  })
                }}
              >
                Confirm Action
              </Button>
            </>
          }
        >
          <div className="space-y-3">
            <p className="text-small text-text-secondary leading-normal">
              Modals in Campus Companion follow WAI-ARIA dialog specifications. Focus is trapped within this dialog while open, and navigating with Tab will not escape into background content.
            </p>
            <Input
              id="modal-test-input"
              label="Test Field Inside Modal"
              placeholder="Type to test focus..."
            />
          </div>
        </Modal>

        {/* Empty & Error States */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EmptyState
            title="No Results Found"
            description="We could not find any matches for your query. Try adjusting your filters."
            action={
              <Button variant="outline" size="sm">
                Clear Filters
              </Button>
            }
          />
          <ErrorState
            title="Failed to Load Data"
            message="Simulated error occurred. Test the retry action."
            onRetry={() => {
              pushToast({
                type: 'info',
                message: 'Retrying simulated request...',
              })
            }}
          />
        </div>

        {/* Skeleton Loaders */}
        <Card className="space-y-4">
          <h3 className="text-small font-semibold text-text-muted uppercase tracking-wider">
            Skeleton Loading States (animate-pulse, aria-hidden)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-card border border-border bg-canvas space-y-3">
              <div className="flex items-center gap-3">
                <Skeleton variant="circular" className="w-10 h-10" />
                <div className="space-y-1.5 flex-1">
                  <Skeleton className="h-4 w-2/5" />
                  <Skeleton className="h-3 w-3/5" />
                </div>
              </div>
              <SkeletonText lines={3} />
            </div>
            <SkeletonCard />
          </div>
        </Card>
      </section>

      {/* 8. ADMIN PORTAL SHARED COMPONENTS */}
      <section className="space-y-6 pt-4 border-t-2 border-primary-600/30">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-primary-100 dark:bg-primary-950/60 text-primary-700 text-xs font-bold uppercase tracking-wider mb-2">
            Admin Design System
          </div>
          <h2 className="text-h2 font-semibold text-text-primary">
            8. Admin Portal Shared Components
          </h2>
          <p className="text-caption text-text-secondary mt-1">
            Standardized components powering all administrative creation, table views, forms, dialogs, and previews.
          </p>
        </div>

        {/* 8.1 Status Badges */}
        <Card className="space-y-4">
          <h3 className="text-small font-semibold text-text-muted uppercase tracking-wider">
            8.1 Status Badges (Dot Indicator + Color Semantics)
          </h3>
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status="Draft" />
            <StatusBadge status="Published" />
            <StatusBadge status="Scheduled" />
            <StatusBadge status="Archived" />
            <StatusBadge status="Open" />
            <StatusBadge status="Closed" />
            <StatusBadge status="Full" />
            <StatusBadge status="Past" />
            <StatusBadge status="Cancelled" />
            <StatusBadge status="Active" />
            <StatusBadge status="Suspended" />
          </div>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <span className="text-xs text-text-muted">Small size:</span>
            <StatusBadge status="Published" size="sm" />
            <StatusBadge status="Draft" size="sm" />
            <StatusBadge status="Cancelled" size="sm" />
            <StatusBadge status="Active" size="sm" />
          </div>
        </Card>

        {/* 8.2 Confirmation Dialogs */}
        <Card className="space-y-4">
          <h3 className="text-small font-semibold text-text-muted uppercase tracking-wider">
            8.2 Confirmation Dialogs (Destructive Safeguards)
          </h3>
          <p className="text-caption text-text-secondary">
            Standard deletion modal vs high-risk deletion (&gt; 5 items) requiring the user to type DELETE.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsConfirmOpen(true)}
            >
              Open Standard Delete Dialog
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => setIsHighRiskConfirmOpen(true)}
            >
              Open High-Risk Delete (&gt; 5 items)
            </Button>
          </div>

          <ConfirmDialog
            isOpen={isConfirmOpen}
            onClose={() => setIsConfirmOpen(false)}
            onConfirm={() => {
              setIsConfirmOpen(false)
              pushToast({ type: 'success', message: 'Item deleted successfully.' })
            }}
            itemName="Robotics Workshop Announcement"
          />

          <ConfirmDialog
            isOpen={isHighRiskConfirmOpen}
            onClose={() => setIsHighRiskConfirmOpen(false)}
            onConfirm={() => {
              setIsHighRiskConfirmOpen(false)
              pushToast({ type: 'success', message: '8 items permanently deleted.' })
            }}
            itemCount={8}
            requireConfirmationWord
          />
        </Card>

        {/* 8.3 Admin Form & Specialized Input Fields */}
        <div className="space-y-4">
          <h3 className="text-small font-semibold text-text-muted uppercase tracking-wider">
            8.3 Admin Form & Specialized Fields
          </h3>

          <AdminForm
            onSubmit={(e) => {
              e.preventDefault()
              pushToast({ type: 'success', message: 'Form submitted successfully!' })
            }}
            onCancel={() => {
              pushToast({ type: 'info', message: 'Form canceled.' })
            }}
            onSaveDraft={() => {
              pushToast({ type: 'info', message: 'Draft saved to local storage.' })
            }}
            submitLabel="Save Changes"
            draftLabel="Save Draft"
            stickyFooter={false}
          >
            <FormSection
              title="General Information"
              description="Basic title, category, and descriptive content."
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <TextField
                  label="Title"
                  value={adminText}
                  onChange={(e) => setAdminText(e.target.value)}
                  placeholder="Enter record title"
                  required
                />
                <SelectField
                  label="Status"
                  value={adminSelect}
                  onChange={(e) => setAdminSelect(e.target.value)}
                  options={[
                    { value: 'Draft', label: 'Draft' },
                    { value: 'Published', label: 'Published' },
                    { value: 'Scheduled', label: 'Scheduled' },
                    { value: 'Archived', label: 'Archived' },
                  ]}
                  required
                />
              </div>

              <TextArea
                label="Brief Summary"
                value={adminTextArea}
                onChange={(e) => setAdminTextArea(e.target.value)}
                maxLength={200}
                rows={2}
                helperText="Appears on card list views and push notifications."
              />

              <RichTextLite
                label="Full Body (Markdown Supported)"
                value={adminRichText}
                onChange={(val) => setAdminRichText(val)}
                helperText="Use toolbar to insert bold, headings, lists, or links."
              />
            </FormSection>

            <FormSection
              title="Relationships & Classifications"
              description="Connect to campus locations, tags, and multi-category filters."
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <SearchableSelect
                  label="Primary Location"
                  value={adminSearchable}
                  onChange={(val) => setAdminSearchable(val)}
                  options={sampleSearchableOptions}
                  helperText="Search by room name or building code."
                />
                <MultiSelectField
                  label="Event Categories"
                  values={adminMultiSelect}
                  onChange={(vals) => setAdminMultiSelect(vals)}
                  options={sampleMultiSelectOptions}
                  helperText="Select one or more categories."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <DatePickerField
                  label="Event Date"
                  value={adminDate}
                  onChange={(d) => setAdminDate(d)}
                />
                <TimePickerField
                  label="Start Time"
                  value={adminTime}
                  onChange={(t) => setAdminTime(t)}
                />
                <NumberField
                  label="Capacity"
                  value={adminNumber}
                  onChange={(n) => setAdminNumber(n)}
                  min={10}
                  max={500}
                  step={10}
                  unit="attendees"
                />
              </div>

              <TagInputField
                label="Tags"
                tags={adminTags}
                onChange={(t) => setAdminTags(t)}
                suggestions={['stem', 'competition', 'hackathon', 'ai', 'career']}
                helperText="Type keyword and press Enter or comma."
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ColorDotPicker
                  label="Badge Accent Color"
                  value={adminColor}
                  onChange={(c) => setAdminColor(c)}
                />
                <IconPicker
                  label="Card Icon (30 Curated Lucide Icons)"
                  value={adminIcon}
                  onChange={(i) => setAdminIcon(i)}
                />
              </div>

              <ToggleField
                label="Feature on Student Homepage"
                description="Highlights this record in the top hero carousel for all students."
                checked={adminToggle}
                onChange={(val) => setAdminToggle(val)}
                badge="Recommended"
              />
            </FormSection>

            <FormSection
              title="Requirements and Checklist"
              description="Reorderable list of prerequisite items."
              collapsible
            >
              <ListEditor
                label="Requirements List"
                items={adminList}
                onChange={(items) => setAdminList(items)}
                placeholder="Add requirement..."
              />
            </FormSection>
          </AdminForm>
        </div>

        {/* 8.4 DataTable Component */}
        <div className="space-y-4">
          <h3 className="text-small font-semibold text-text-muted uppercase tracking-wider">
            8.4 DataTable Component (Search, Sort, Filter, Bulk Actions, Pagination)
          </h3>

          <DataTable
            data={
              tableFilterStatus === 'all'
                ? sampleTableData
                : sampleTableData.filter((item) => item.status === tableFilterStatus)
            }
            columns={tableColumns}
            keyField="id"
            searchPlaceholder="Search announcements..."
            filters={[
              {
                key: 'status',
                label: 'Status',
                value: tableFilterStatus,
                onChange: (val) => setTableFilterStatus(val),
                options: [
                  { label: 'Published', value: 'Published' },
                  { label: 'Draft', value: 'Draft' },
                  { label: 'Scheduled', value: 'Scheduled' },
                  { label: 'Archived', value: 'Archived' },
                ],
              },
            ]}
            bulkActions={[
              {
                label: 'Publish Selected',
                onClick: (selected) => {
                  pushToast({
                    type: 'success',
                    message: `Published ${selected.length} items.`,
                  })
                },
              },
              {
                label: 'Delete Selected',
                variant: 'danger',
                onClick: (selected) => {
                  pushToast({
                    type: 'error',
                    message: `Deleted ${selected.length} items.`,
                  })
                },
              },
            ]}
            rowActions={(item) => [
              {
                label: 'Edit',
                onClick: () => pushToast({ type: 'info', message: `Editing ${item.title}` }),
              },
              {
                label: 'Duplicate',
                onClick: () => pushToast({ type: 'info', message: `Duplicated ${item.title}` }),
              },
              {
                label: 'Delete',
                variant: 'danger',
                onClick: () => pushToast({ type: 'error', message: `Deleting ${item.title}` }),
              },
            ]}
            primaryAction={{
              label: 'Create Announcement',
              onClick: () => pushToast({ type: 'info', message: 'Create announcement clicked' }),
            }}
          />
        </div>

        {/* 8.5 Live Preview Panel */}
        <div className="space-y-4">
          <h3 className="text-small font-semibold text-text-muted uppercase tracking-wider">
            8.5 Live Student View Preview Panel
          </h3>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreviewOpen(!isPreviewOpen)}
            >
              {isPreviewOpen ? 'Hide Preview Panel' : 'Show Preview Panel'}
            </Button>
          </div>

          <PreviewPanel
            isOpen={isPreviewOpen}
            onToggle={() => setIsPreviewOpen(!isPreviewOpen)}
            title="Live Preview: Announcement Card"
          >
            <div className="p-4 rounded-card border border-border bg-surface shadow-card space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-accent-100 text-primary-700">
                  Academic
                </span>
                <span className="text-xs text-text-muted">Today</span>
              </div>
              <h4 className="text-base font-bold text-text-primary">
                {adminText || 'Announcement Title'}
              </h4>
              <p className="text-sm text-text-secondary leading-relaxed line-clamp-3">
                {adminTextArea || 'Short announcement summary will appear here for student preview.'}
              </p>
              <div className="pt-2 flex items-center justify-between text-xs text-text-muted border-t border-border/60">
                <span>By Office of Registrar</span>
                <span className="text-primary-600 font-medium">Read more</span>
              </div>
            </div>
          </PreviewPanel>
        </div>
      </section>
    </div>
  )
}
