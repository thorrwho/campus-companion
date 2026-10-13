import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  Sun,
  Moon,
  RotateCcw,
  LogOut,
  ShieldCheck,
  Info,
} from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Toggle } from '@/components/ui/Toggle'
import { Badge } from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { useUserStore } from '@/store/useUserStore'
import { useAuthStore, DEMO_USER } from '@/store/useAuthStore'
import { useToastStore } from '@/store/useToastStore'

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate()
  const { notificationPrefs, updateNotificationPrefs, resetUserData } = useUserStore()
  const { user, logout, resetAuth } = useAuthStore()
  const { push: pushToast } = useToastStore()

  const currentStudent = user || DEMO_USER

  const [isResetModalOpen, setIsResetModalOpen] = useState(false)
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false)

  const handleTogglePref = (key: keyof typeof notificationPrefs, value: boolean) => {
    updateNotificationPrefs({ [key]: value })
    pushToast({
      type: 'info',
      message: 'Notification preference saved.',
    })
  }

  const handleConfirmReset = () => {
    setIsResetModalOpen(false)
    resetUserData()
    resetAuth()
    pushToast({
      type: 'success',
      message: 'All prototype state reset to initial demo defaults.',
    })
    navigate('/login')
  }

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false)
    logout()
    pushToast({
      type: 'info',
      message: 'You have been signed out successfully.',
    })
    navigate('/login')
  }

  return (
    <div className="space-y-8 pb-16 text-left max-w-3xl mx-auto">
      <PageHeader
        title="Settings & Preferences"
        subtitle="Configure notification alerts, appearance theme, and prototype state."
      />

      {/* Section 1: Notification Preferences */}
      <Card padding="lg" className="space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-border">
          <Bell className="w-5 h-5 text-primary-600" aria-hidden="true" />
          <h2 className="text-h3 font-semibold text-text-primary">
            Notification Alerts
          </h2>
        </div>

        <div className="space-y-4">
          <Toggle
            label="Event Reminders"
            description="Receive notifications 48 hours and 2 hours prior to registered events."
            checked={notificationPrefs.events}
            onChange={(val) => handleTogglePref('events', val)}
          />

          <div className="pt-3 border-t border-border/60">
            <Toggle
              label="Important Announcements & Circulars"
              description="High-priority notifications for exams, holidays, and college closures."
              checked={notificationPrefs.announcements}
              onChange={(val) => handleTogglePref('announcements', val)}
            />
          </div>

          <div className="pt-3 border-t border-border/60">
            <Toggle
              label="Club Updates & Meeting Circles"
              description="Activity updates and room changes from societies you have joined."
              checked={notificationPrefs.clubs}
              onChange={(val) => handleTogglePref('clubs', val)}
            />
          </div>

          <div className="pt-3 border-t border-border/60">
            <Toggle
              label="Schedule & Class Reminders"
              description="Timetable alerts 15 minutes before upcoming lecture and lab slots."
              checked={notificationPrefs.reminders}
              onChange={(val) => handleTogglePref('reminders', val)}
            />
          </div>
        </div>
      </Card>

      {/* Section 2: Appearance & Theme */}
      <Card padding="lg" className="space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-border">
          <Sun className="w-5 h-5 text-primary-600" aria-hidden="true" />
          <h2 className="text-h3 font-semibold text-text-primary">
            Appearance & Interface Theme
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-small font-medium text-text-primary">
                Color Scheme
              </span>
              <Badge variant="default" size="sm">
                Default: Light
              </Badge>
            </div>
            <span className="text-caption text-text-secondary block">
              Light theme is tuned for campus sunlight readability and WCAG AA contrast.
            </span>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto bg-neutral-100 p-1 rounded-card border border-border/70">
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-primary-950 font-semibold text-xs rounded-button shadow-xs"
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Light</span>
            </button>
            <button
              type="button"
              disabled
              title="Dark mode prototype scheduled for upcoming academic release"
              className="flex items-center gap-1.5 px-3 py-1.5 text-text-muted text-xs rounded-button cursor-not-allowed opacity-60"
            >
              <Moon className="w-3.5 h-3.5" />
              <span>Dark (Soon)</span>
            </button>
          </div>
        </div>

        <div className="flex items-start gap-2 p-3 bg-neutral-50 rounded-lg text-xs text-text-secondary border border-border/60">
          <Info className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" aria-hidden="true" />
          <span>
            Dark mode high-contrast support is slated for the Spring semester prototype iteration.
          </span>
        </div>
      </Card>

      {/* Section 3: Data Persistence & Demo Reset */}
      <Card padding="lg" className="space-y-4 border-amber-200/80 bg-amber-50/20">
        <div className="flex items-center gap-2 pb-2 border-b border-amber-200/60">
          <RotateCcw className="w-5 h-5 text-amber-700" aria-hidden="true" />
          <h2 className="text-h3 font-semibold text-amber-950">
            Prototype Data & Reset
          </h2>
        </div>

        <p className="text-small text-text-secondary leading-relaxed">
          Campus Companion stores all state locally in your browser (LocalStorage). Resetting will restore default event registrations, clubs, saved pins, and user profile data.
        </p>

        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsResetModalOpen(true)}
            className="border-accent-red/40 text-accent-red hover:bg-accent-red/10"
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            Reset All Prototype Data
          </Button>
        </div>
      </Card>

      {/* Section 4: Account & Session */}
      <Card padding="lg" className="space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <ShieldCheck className="w-5 h-5 text-primary-600" aria-hidden="true" />
          <h2 className="text-h3 font-semibold text-text-primary">
            Active Account
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="text-small font-semibold text-text-primary block">
              {currentStudent.name}
            </span>
            <span className="font-mono text-caption text-text-secondary block">
              {currentStudent.email} ({currentStudent.rollNo})
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsLogoutModalOpen(true)}
            className="text-accent-red hover:bg-accent-red/10 self-start sm:self-auto"
            leftIcon={<LogOut className="w-4 h-4" />}
          >
            Sign Out
          </Button>
        </div>
      </Card>

      {/* About Prototype Box */}
      <div className="text-center space-y-1 text-caption text-text-muted pt-4 border-t border-border">
        <div className="font-medium text-text-secondary">
          Campus Companion Prototype (Academic UI/UX Build v1.0.0)
        </div>
        <div>
          Campus Companion Demo College. No institutional backend connected.
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Reset All Prototype State?"
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsResetModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="bg-accent-red hover:bg-accent-red/90 text-white"
              onClick={handleConfirmReset}
            >
              Confirm Reset
            </Button>
          </div>
        }
      >
        <p className="text-small text-text-secondary">
          This will clear all custom event bookings, club joins, bookmarks, and edited profile data from your browser LocalStorage and re-seed the default demo account.
        </p>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        title="Sign Out of Campus Companion?"
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLogoutModalOpen(false)}
            >
              Stay Logged In
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="bg-accent-red hover:bg-accent-red/90 text-white"
              onClick={handleConfirmLogout}
            >
              Sign Out
            </Button>
          </div>
        }
      >
        <p className="text-small text-text-secondary">
          Are you sure you want to end your active session? You can sign back in using the demo account credentials at any time.
        </p>
      </Modal>
    </div>
  )
}
