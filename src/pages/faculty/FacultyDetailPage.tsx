import React from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Mail,
  Clock,
  MapPin,
  BookOpen,
  ArrowLeft,
  Copy,
  Building,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { ErrorState } from '@/components/ui/ErrorState'
import { useToastStore } from '@/store/useToastStore'
import { useContentStore } from '@/store/useContentStore'

export const FacultyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { push: pushToast } = useToastStore()

  const facultyList = useContentStore((state) => state.faculty)
  const locations = useContentStore((state) => state.locations)
  const timetableSlots = useContentStore((state) => state.timetableSlots)

  const faculty = facultyList.find((f) => f.id === id)

  if (!faculty) {
    return (
      <div className="py-12">
        <ErrorState
          title="Faculty Profile Not Found"
          message="We could not find the faculty member requested."
          onRetry={() => navigate('/faculty')}
        />
      </div>
    )
  }

  const officeLocation = locations.find((l) => l.id === faculty.officeLocationId)

  // Find lectures taught by this professor
  const lecturesTaught = timetableSlots.filter(
    (slot) =>
      slot.faculty === faculty.name ||
      slot.faculty.toLowerCase().includes(faculty.name.split(' ')[1]?.toLowerCase() || '')
  )

  const handleCopyEmail = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(faculty.email)
      pushToast({
        type: 'success',
        message: `Copied ${faculty.email} to clipboard.`,
      })
    }
  }

  return (
    <div className="space-y-8 pb-16 text-left max-w-4xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          to="/faculty"
          className="inline-flex items-center gap-1.5 text-small font-medium text-text-secondary hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-button"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to Faculty Directory</span>
        </Link>
      </div>

      {/* Main Profile Header Card */}
      <Card className="p-6 sm:p-10 space-y-6 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex items-start gap-5">
            <Avatar initials={faculty.initials} name={faculty.name} size="lg" />
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="primary" size="sm">
                  {faculty.departmentId}
                </Badge>
              </div>

              <h1 className="text-display font-bold text-text-primary tracking-tight">
                {faculty.name}
              </h1>

              <p className="text-body font-medium text-text-secondary">
                {faculty.designation}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyEmail}
            leftIcon={<Copy className="w-3.5 h-3.5" />}
          >
            Copy Email
          </Button>
        </div>

        {/* Contact & Office Hours Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border">
          <div className="p-3.5 rounded-card bg-canvas border border-border space-y-1">
            <span className="text-caption text-text-muted font-semibold flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-primary-600" aria-hidden="true" />
              <span>Official Email</span>
            </span>
            <p className="text-small font-medium text-text-primary truncate">
              {faculty.email}
            </p>
          </div>

          <div className="p-3.5 rounded-card bg-canvas border border-border space-y-1">
            <span className="text-caption text-text-muted font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-primary-600" aria-hidden="true" />
              <span>Office Hours</span>
            </span>
            <p className="text-small font-medium text-text-primary">
              {faculty.officeHours}
            </p>
          </div>

          <div className="p-3.5 rounded-card bg-canvas border border-border space-y-1">
            <span className="text-caption text-text-muted font-semibold flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-primary-600" aria-hidden="true" />
              <span>Office Room</span>
            </span>
            <p className="text-small font-medium text-text-primary truncate">
              {officeLocation ? officeLocation.name : 'Department Office'}
            </p>
          </div>
        </div>
      </Card>

      {/* Grid: Subjects Taught & Office Venue */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Subjects Taught */}
        <Card className="p-6 space-y-4">
          <h2 className="text-h3 font-semibold text-text-primary flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-primary-600" aria-hidden="true" />
            <span>Courses & Subjects Taught</span>
          </h2>

          <div className="space-y-2.5">
            {faculty.subjects.map((sub, idx) => (
              <div
                key={idx}
                className="p-3 rounded-button bg-canvas border border-border text-small font-medium text-text-primary flex items-center justify-between"
              >
                <span>{sub}</span>
                <span className="text-[11px] text-text-muted uppercase">Lecture</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Office Location on Map */}
        <Card className="p-6 space-y-4">
          <h2 className="text-h3 font-semibold text-text-primary flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary-600" aria-hidden="true" />
            <span>Consultation Venue</span>
          </h2>

          {officeLocation ? (
            <div className="space-y-3">
              <p className="text-small text-text-secondary leading-normal">
                Students can meet {faculty.name} for academic mentoring, project reviews, or thesis consultations at:
              </p>
              <div className="p-3.5 rounded-button bg-canvas border border-border space-y-1">
                <p className="text-small font-bold text-text-primary">
                  {officeLocation.name}
                </p>
                <p className="text-caption text-text-muted">
                  {officeLocation.building}, {officeLocation.floor}
                </p>
              </div>

              <Link to={`/map/${officeLocation.id}`}>
                <Button variant="primary" size="sm" className="w-full">
                  View Office on Campus Map
                </Button>
              </Link>
            </div>
          ) : (
            <p className="text-small text-text-muted">
              Office location details can be obtained at Department Reception.
            </p>
          )}
        </Card>
      </div>

      {/* Linked Timetable Slots if present */}
      {lecturesTaught.length > 0 && (
        <Card className="p-6 space-y-4">
          <h2 className="text-h3 font-semibold text-text-primary">
            Weekly Teaching Schedule
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {lecturesTaught.map((slot) => (
              <div
                key={slot.id}
                className="p-3 rounded-button bg-canvas border border-border text-small flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-caption text-text-muted mb-1">
                    <span className="font-semibold text-primary-600">{slot.day}</span>
                    <span>
                      {slot.start} to {slot.end}
                    </span>
                  </div>
                  <p className="font-semibold text-text-primary truncate">{slot.subject}</p>
                </div>
                <div className="mt-2 text-caption text-text-secondary flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-text-muted" aria-hidden="true" />
                  <span>{slot.room}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
