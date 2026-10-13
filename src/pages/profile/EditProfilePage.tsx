import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Save,
  Lock,
  User,
  ShieldAlert,
  Sparkles,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { Chip } from '@/components/ui/Chip'
import { useAuthStore, DEMO_USER } from '@/store/useAuthStore'
import { useToastStore } from '@/store/useToastStore'

const ALL_INTEREST_OPTIONS = [
  { id: 'workshop', label: 'Workshops & Seminars' },
  { id: 'hackathon', label: 'Hackathons & Coding' },
  { id: 'cultural', label: 'Music & Arts' },
  { id: 'sports', label: 'Athletics & Sports' },
  { id: 'robotics', label: 'Robotics & Hardware' },
  { id: 'design', label: 'UI/UX & Design' },
  { id: 'entrepreneurship', label: 'Startups & Business' },
  { id: 'literature', label: 'Debating & Literature' },
]

export const EditProfilePage: React.FC = () => {
  const navigate = useNavigate()
  const { user, updateProfile } = useAuthStore()
  const { push: pushToast } = useToastStore()

  const currentStudent = user || DEMO_USER

  // Form states
  const [name, setName] = useState(currentStudent.name)
  const [phone, setPhone] = useState(currentStudent.phone || '+91 98765 43210')
  const [bio, setBio] = useState(
    currentStudent.bio ||
      'Pre-final year Artificial Intelligence and Machine Learning student passionate about computer vision, robotics, and campus open-source initiatives.'
  )
  const [emergencyName, setEmergencyName] = useState(
    currentStudent.emergencyContactName || 'Rajesh Sharma (Parent)'
  )
  const [emergencyPhone, setEmergencyPhone] = useState(
    currentStudent.emergencyContactPhone || '+91 98765 11223'
  )
  const [selectedInterests, setSelectedInterests] = useState<string[]>(
    currentStudent.interests || ['workshop', 'hackathon', 'cultural']
  )

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isDiscardModalOpen, setIsDiscardModalOpen] = useState(false)

  // Check if form is dirty
  const isDirty =
    name !== currentStudent.name ||
    phone !== (currentStudent.phone || '+91 98765 43210') ||
    bio !== (currentStudent.bio || '') ||
    emergencyName !== (currentStudent.emergencyContactName || 'Rajesh Sharma (Parent)') ||
    emergencyPhone !== (currentStudent.emergencyContactPhone || '+91 98765 11223') ||
    JSON.stringify(selectedInterests) !== JSON.stringify(currentStudent.interests || [])

  const toggleInterest = (interestId: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interestId) ? prev.filter((i) => i !== interestId) : [...prev, interestId]
    )
  }

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!name.trim()) {
      errs.name = 'Full name is required.'
    }
    if (!phone.trim()) {
      errs.phone = 'Phone number is required.'
    }
    if (!emergencyName.trim()) {
      errs.emergencyName = 'Emergency contact name is required.'
    }
    if (!emergencyPhone.trim()) {
      errs.emergencyPhone = 'Emergency phone is required.'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    updateProfile({
      name: name.trim(),
      phone: phone.trim(),
      bio: bio.trim(),
      emergencyContactName: emergencyName.trim(),
      emergencyContactPhone: emergencyPhone.trim(),
      interests: selectedInterests,
    })

    pushToast({
      type: 'success',
      message: 'Student profile updated successfully.',
    })

    navigate('/profile')
  }

  const handleCancel = () => {
    if (isDirty) {
      setIsDiscardModalOpen(true)
    } else {
      navigate('/profile')
    }
  }

  return (
    <div className="space-y-6 pb-16 text-left max-w-3xl mx-auto">
      {/* Top back navigation */}
      <div>
        <button
          type="button"
          onClick={handleCancel}
          className="inline-flex items-center gap-1.5 text-small font-medium text-text-secondary hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-button"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to Profile</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-display font-bold text-text-primary">
            Edit Student Profile
          </h1>
          <p className="text-small text-text-secondary mt-1">
            Update your public profile, emergency contacts, and campus interest preferences.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Read-Only Institutional Record Notice */}
        <Card padding="md" className="bg-neutral-50/80 border-border">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-text-muted shrink-0 mt-0.5" aria-hidden="true" />
            <div className="space-y-2 flex-1">
              <div className="text-small font-semibold text-text-primary">
                Official Institutional Records
              </div>
              <p className="text-xs text-text-secondary leading-normal">
                Department, Roll Number, and Institutional Email are managed by the College Academic Registry and cannot be altered here directly.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                <div className="bg-white p-2.5 rounded border border-border/80 text-xs">
                  <span className="text-text-muted block">Roll Number</span>
                  <span className="font-mono font-semibold text-text-primary">{currentStudent.rollNo}</span>
                </div>
                <div className="bg-white p-2.5 rounded border border-border/80 text-xs">
                  <span className="text-text-muted block">Department</span>
                  <span className="font-semibold text-text-primary">{currentStudent.department}</span>
                </div>
                <div className="bg-white p-2.5 rounded border border-border/80 text-xs">
                  <span className="text-text-muted block">Email</span>
                  <span className="font-mono text-text-primary truncate block">{currentStudent.email}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Basic Personal Details */}
        <Card padding="lg">
          <h2 className="text-h3 font-semibold text-text-primary mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary-600" aria-hidden="true" />
            <span>Personal Information</span>
          </h2>

          <div className="space-y-4">
            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
              placeholder="e.g. Aarav Sharma"
            />

            <Input
              label="Mobile Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              error={errors.phone}
              placeholder="+91 98765 43210"
              hint="Used for campus SMS emergency alerts and event coordination."
            />

            <div className="space-y-1.5">
              <label htmlFor="bio-input" className="block text-small font-medium text-text-primary">
                About / Bio
              </label>
              <textarea
                id="bio-input"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Share your academic interests, projects, or club activities..."
                className="w-full px-3.5 py-2.5 rounded-input border border-border bg-surface text-body text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-colors resize-y text-small"
              />
            </div>
          </div>
        </Card>

        {/* Emergency Contact Information */}
        <Card padding="lg" className="border-amber-200/80 bg-amber-50/20">
          <h2 className="text-h3 font-semibold text-amber-950 mb-4 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-700" aria-hidden="true" />
            <span>Emergency Contact</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact Person & Relation"
              value={emergencyName}
              onChange={(e) => setEmergencyName(e.target.value)}
              error={errors.emergencyName}
              placeholder="e.g. Rajesh Sharma (Parent)"
            />

            <Input
              label="Emergency Phone"
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value)}
              error={errors.emergencyPhone}
              placeholder="+91 98765 11223"
            />
          </div>
        </Card>

        {/* Campus Interests */}
        <Card padding="lg">
          <div className="space-y-1 mb-4">
            <h2 className="text-h3 font-semibold text-text-primary flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary-600" aria-hidden="true" />
              <span>Campus Interests & Preferences</span>
            </h2>
            <p className="text-xs text-text-secondary">
              Select topic areas to personalize event recommendations on your dashboard.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {ALL_INTEREST_OPTIONS.map((item) => {
              const isSelected = selectedInterests.includes(item.id)
              return (
                <Chip
                  key={item.id}
                  label={item.label}
                  selected={isSelected}
                  onClick={() => toggleInterest(item.id)}
                />
              )
            })}
          </div>
        </Card>

        {/* Form Bottom Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          <Button
            type="button"
            variant="ghost"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Changes
          </Button>
        </div>
      </form>

      {/* Discard Unsaved Changes Modal */}
      <Modal
        isOpen={isDiscardModalOpen}
        onClose={() => setIsDiscardModalOpen(false)}
        title="Discard Unsaved Changes?"
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDiscardModalOpen(false)}
            >
              Continue Editing
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="bg-accent-red hover:bg-accent-red/90 text-white"
              onClick={() => {
                setIsDiscardModalOpen(false)
                navigate('/profile')
              }}
            >
              Discard Changes
            </Button>
          </div>
        }
      >
        <p className="text-small text-text-secondary">
          You have unsaved changes in your profile form. Are you sure you want to discard your edits and return to your profile?
        </p>
      </Modal>
    </div>
  )
}
