import React, { useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  FileText,
  Download,
  AlertTriangle,
} from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ErrorState } from '@/components/ui/ErrorState'
import { useUserStore } from '@/store/useUserStore'
import { useToastStore } from '@/store/useToastStore'
import { ANNOUNCEMENTS } from '@/data/announcements'

export const AnnouncementDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const { markAnnouncementRead } = useUserStore()
  const { push: pushToast } = useToastStore()

  const currentIndex = ANNOUNCEMENTS.findIndex((a) => a.id === id)
  const announcement = ANNOUNCEMENTS[currentIndex]

  // Automatically mark announcement as read when opened
  useEffect(() => {
    if (announcement) {
      markAnnouncementRead(announcement.id)
    }
  }, [announcement, markAnnouncementRead])

  if (!announcement) {
    return (
      <div className="py-12">
        <ErrorState
          title="Announcement Not Found"
          message="We could not find the notice requested. It may have expired or been updated."
          onRetry={() => navigate('/announcements')}
        />
      </div>
    )
  }

  const prevAnnouncement = currentIndex > 0 ? ANNOUNCEMENTS[currentIndex - 1] : null
  const nextAnnouncement =
    currentIndex < ANNOUNCEMENTS.length - 1 ? ANNOUNCEMENTS[currentIndex + 1] : null

  const handleDownloadAttachment = (filename: string) => {
    pushToast({
      type: 'info',
      message: `Downloading document: ${filename}`,
    })
  }

  const dateObj = new Date(announcement.postedAt)
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const formattedTime = dateObj.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="space-y-6 pb-16 text-left max-w-4xl mx-auto">
      {/* Top Navigation Row */}
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/announcements"
          className="inline-flex items-center gap-1.5 text-small font-medium text-text-secondary hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 rounded-button"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to All Announcements</span>
        </Link>

        {/* Previous and Next Shortcuts */}
        <div className="flex items-center gap-2">
          {prevAnnouncement && (
            <Link to={`/announcements/${prevAnnouncement.id}`}>
              <Button variant="outline" size="sm" leftIcon={<ChevronLeft className="w-3.5 h-3.5" />}>
                Previous
              </Button>
            </Link>
          )}
          {nextAnnouncement && (
            <Link to={`/announcements/${nextAnnouncement.id}`}>
              <Button variant="outline" size="sm" rightIcon={<ChevronRight className="w-3.5 h-3.5" />}>
                Next
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Main Notice Card */}
      <Card className="p-6 sm:p-10 space-y-6 shadow-card">
        {/* Category & Important Status */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Badge variant="primary" size="md">
            {announcement.category.toUpperCase()}
          </Badge>

          {announcement.isImportant && (
            <Badge variant="warning" size="md" icon={<AlertTriangle className="w-3.5 h-3.5" />}>
              Important Circular
            </Badge>
          )}
        </div>

        {/* Title */}
        <h1 className="text-display font-bold text-text-primary tracking-tight leading-tight">
          {announcement.title}
        </h1>

        {/* Meta details */}
        <div className="flex flex-wrap items-center gap-4 text-small text-text-secondary pb-4 border-b border-border">
          <span className="flex items-center gap-1.5 font-medium text-text-primary">
            <User className="w-4 h-4 text-text-muted" aria-hidden="true" />
            <span>{announcement.postedBy}</span>
          </span>
          <span className="flex items-center gap-1.5 text-text-muted">
            <Calendar className="w-4 h-4" aria-hidden="true" />
            <span>
              {formattedDate} at {formattedTime}
            </span>
          </span>
        </div>

        {/* Full Notice Body Paragraphs */}
        <div className="space-y-4 text-body text-text-secondary leading-relaxed pt-2">
          {announcement.body.map((paragraph, index) => (
            <p key={index} className="text-justify sm:text-left">
              {paragraph}
            </p>
          ))}
        </div>

        {/* Attachment Card if present */}
        {announcement.attachmentName && (
          <div className="pt-6 border-t border-border">
            <h3 className="text-small font-semibold text-text-primary mb-3">
              Official Attachment
            </h3>
            <div className="p-4 rounded-card bg-canvas border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-card bg-status-error-bg text-status-error flex items-center justify-center shrink-0 shadow-sm">
                  <FileText className="w-5 h-5" aria-hidden="true" />
                </div>
                <div className="min-w-0">
                  <p className="text-small font-semibold text-text-primary truncate">
                    {announcement.attachmentName}
                  </p>
                  <p className="text-caption text-text-muted">
                    PDF Document (Verified Academic Signature)
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownloadAttachment(announcement.attachmentName!)}
                leftIcon={<Download className="w-3.5 h-3.5" />}
              >
                Download PDF
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Bottom Navigation Shortcuts */}
      <div className="flex items-center justify-between pt-2">
        {prevAnnouncement ? (
          <Link
            to={`/announcements/${prevAnnouncement.id}`}
            className="flex items-center gap-2 text-small text-text-secondary hover:text-primary-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" aria-hidden="true" />
            <div className="text-left">
              <span className="text-[11px] text-text-muted block">Previous Notice</span>
              <span className="font-medium line-clamp-1 max-w-[200px] sm:max-w-xs">
                {prevAnnouncement.title}
              </span>
            </div>
          </Link>
        ) : (
          <div />
        )}

        {nextAnnouncement && (
          <Link
            to={`/announcements/${nextAnnouncement.id}`}
            className="flex items-center gap-2 text-small text-text-secondary hover:text-primary-600 transition-colors text-right"
          >
            <div>
              <span className="text-[11px] text-text-muted block">Next Notice</span>
              <span className="font-medium line-clamp-1 max-w-[200px] sm:max-w-xs">
                {nextAnnouncement.title}
              </span>
            </div>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        )}
      </div>
    </div>
  )
}
