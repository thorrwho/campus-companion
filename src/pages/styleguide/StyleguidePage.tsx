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
    </div>
  )
}
