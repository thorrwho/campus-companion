import React from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen,
  Calendar,
  Users,
  MapPin,
  Edit3,
  Award,
  ShieldAlert,
  GraduationCap,
  Sparkles,
  Download,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { useAuthStore, DEMO_USER } from '@/store/useAuthStore'
import { useUserStore } from '@/store/useUserStore'
import { useToastStore } from '@/store/useToastStore'
import { useContentStore } from '@/store/useContentStore'

export const ProfilePage: React.FC = () => {
  const { user } = useAuthStore()
  const { registeredEventIds, joinedClubIds, savedLocationIds } = useUserStore()
  const { push: pushToast } = useToastStore()
  const departments = useContentStore((state) => state.departments)

  const currentStudent = user || DEMO_USER
  const deptInfo = departments.find((d) => d.code === currentStudent.department)

  const handleDownloadId = () => {
    pushToast({
      type: 'info',
      message: 'Digital ID pass generated for offline student verification.',
    })
  }

  return (
    <div className="space-y-8 pb-16 text-left max-w-4xl mx-auto">
      {/* Profile Header Hero Card */}
      <Card padding="none" className="overflow-hidden border-border shadow-card">
        {/* Decorative banner background */}
        <div className="h-32 sm:h-36 bg-gradient-to-r from-primary-900 via-primary-800 to-primary-700 relative p-6 flex items-start justify-end">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="relative z-10 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadId}
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
              leftIcon={<Download className="w-4 h-4" />}
            >
              Digital ID
            </Button>
            <Link to="/profile/edit">
              <Button
                variant="primary"
                size="sm"
                className="bg-white text-primary-950 hover:bg-neutral-100"
                leftIcon={<Edit3 className="w-4 h-4" />}
              >
                Edit Profile
              </Button>
            </Link>
          </div>
        </div>

        {/* Profile Info Row with Overlapping Avatar */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 mb-4">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="ring-4 ring-surface rounded-full shadow-md bg-surface shrink-0 inline-block">
                <Avatar
                  name={currentStudent.name}
                  initials={currentStudent.avatarInitials}
                  size="lg"
                />
              </div>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-h1 font-bold text-text-primary">
                    {currentStudent.name}
                  </h1>
                  <Badge variant="primary" size="sm">
                    {currentStudent.department}
                  </Badge>
                  <Badge variant="neutral" size="sm">
                    Semester {currentStudent.semester}
                  </Badge>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-small text-text-secondary">
                  <span className="font-mono font-medium text-text-primary">
                    Roll No: {currentStudent.rollNo}
                  </span>
                  <span>Section {currentStudent.section || 'A'}</span>
                  <span>Campus Companion Demo College</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bio paragraph */}
          {currentStudent.bio && (
            <p className="text-small text-text-secondary leading-relaxed border-t border-border pt-4">
              {currentStudent.bio}
            </p>
          )}
        </div>
      </Card>

      {/* Academic Highlights & Engagement Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card padding="md" className="border-border">
          <div className="flex items-center gap-2 text-text-muted mb-1">
            <Award className="w-4 h-4 text-primary-600" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-wider">CGPA</span>
          </div>
          <div className="text-h2 font-bold text-text-primary">
            {currentStudent.cgpa || '8.84'}
          </div>
          <div className="text-[11px] text-accent-green font-medium mt-0.5">
            Top 10% in cohort
          </div>
        </Card>

        <Card padding="md" className="border-border">
          <div className="flex items-center gap-2 text-text-muted mb-1">
            <GraduationCap className="w-4 h-4 text-primary-600" aria-hidden="true" />
            <span className="text-xs font-semibold uppercase tracking-wider">Attendance</span>
          </div>
          <div className="text-h2 font-bold text-text-primary">
            {currentStudent.attendance || '91%'}
          </div>
          <div className="text-[11px] text-accent-green font-medium mt-0.5">
            Above 75% threshold
          </div>
        </Card>

        <Link to="/saved?tab=events" className="group">
          <Card padding="md" hover className="h-full border-border">
            <div className="flex items-center gap-2 text-text-muted mb-1 group-hover:text-primary-600 transition-colors">
              <Calendar className="w-4 h-4" aria-hidden="true" />
              <span className="text-xs font-semibold uppercase tracking-wider">Events</span>
            </div>
            <div className="text-h2 font-bold text-text-primary">
              {registeredEventIds.length}
            </div>
            <div className="text-[11px] text-text-muted mt-0.5">
              Registered passes
            </div>
          </Card>
        </Link>

        <Link to="/saved?tab=clubs" className="group">
          <Card padding="md" hover className="h-full border-border">
            <div className="flex items-center gap-2 text-text-muted mb-1 group-hover:text-primary-600 transition-colors">
              <Users className="w-4 h-4" aria-hidden="true" />
              <span className="text-xs font-semibold uppercase tracking-wider">Clubs</span>
            </div>
            <div className="text-h2 font-bold text-text-primary">
              {joinedClubIds.length}
            </div>
            <div className="text-[11px] text-text-muted mt-0.5">
              Active memberships
            </div>
          </Card>
        </Link>
      </div>

      {/* Profile Details Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column: Academic & Contact Info */}
        <div className="space-y-6">
          <Card padding="lg">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="w-5 h-5 text-primary-600" aria-hidden="true" />
              <h2 className="text-h3 font-semibold text-text-primary">
                Institutional Records
              </h2>
            </div>

            <div className="space-y-3.5 text-small">
              <div>
                <span className="text-caption text-text-muted block">Department</span>
                <span className="font-medium text-text-primary">
                  {deptInfo?.name || currentStudent.department}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-caption text-text-muted block">Roll Number</span>
                  <span className="font-mono font-medium text-text-primary">
                    {currentStudent.rollNo}
                  </span>
                </div>
                <div>
                  <span className="text-caption text-text-muted block">Academic Year</span>
                  <span className="font-medium text-text-primary">
                    Year 3 (Sem {currentStudent.semester})
                  </span>
                </div>
              </div>
              <div>
                <span className="text-caption text-text-muted block">Institutional Email</span>
                <span className="font-mono text-primary-600 font-medium">
                  {currentStudent.email}
                </span>
              </div>
              <div>
                <span className="text-caption text-text-muted block">Personal Phone</span>
                <span className="font-medium text-text-primary">
                  {currentStudent.phone || '+91 98765 43210'}
                </span>
              </div>
            </div>
          </Card>

          {/* Emergency Contact */}
          <Card padding="lg" className="border-amber-200/80 bg-amber-50/20">
            <div className="flex items-center gap-2 mb-3 text-amber-900 font-semibold">
              <ShieldAlert className="w-5 h-5 text-amber-700" aria-hidden="true" />
              <h2 className="text-h3">Emergency Contact</h2>
            </div>
            <div className="space-y-2 text-small">
              <div>
                <span className="text-caption text-text-muted block">Guardian / Contact</span>
                <span className="font-medium text-text-primary">
                  {currentStudent.emergencyContactName || 'Rajesh Sharma (Parent)'}
                </span>
              </div>
              <div>
                <span className="text-caption text-text-muted block">Emergency Phone</span>
                <span className="font-mono font-medium text-primary-950">
                  {currentStudent.emergencyContactPhone || '+91 98765 11223'}
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Interests & Saved Shortcuts */}
        <div className="space-y-6">
          {/* Interests Card */}
          <Card padding="lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary-600" aria-hidden="true" />
                <h2 className="text-h3 font-semibold text-text-primary">
                  Campus Interests
                </h2>
              </div>
              <Link to="/profile/edit" className="text-xs text-primary-600 font-medium hover:underline">
                Update
              </Link>
            </div>

            {currentStudent.interests && currentStudent.interests.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {currentStudent.interests.map((interest) => (
                  <Badge
                    key={interest}
                    variant="default"
                    size="md"
                    className="capitalize text-xs py-1 px-3 bg-neutral-100 text-text-primary"
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-small text-text-muted">
                No personal interests selected yet.
              </p>
            )}
          </Card>

          {/* Saved Bookmarks Summary Card */}
          <Card padding="lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary-600" aria-hidden="true" />
                <h2 className="text-h3 font-semibold text-text-primary">
                  Saved Bookmarks
                </h2>
              </div>
              <Link to="/saved" className="text-xs text-primary-600 font-medium hover:underline">
                View All
              </Link>
            </div>

            <p className="text-small text-text-secondary mb-4">
              You have {savedLocationIds.length} bookmarked locations and venues for quick access across campus.
            </p>

            <Link to="/saved">
              <Button variant="outline" size="sm" className="w-full">
                Open Saved Library
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  )
}
