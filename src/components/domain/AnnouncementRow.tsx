import React from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, ChevronRight, FileText } from 'lucide-react'
import { Announcement } from '@/types'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

interface AnnouncementRowProps {
  announcement: Announcement
  isRead?: boolean
  onClick?: () => void
}

export const AnnouncementRow: React.FC<AnnouncementRowProps> = ({
  announcement,
  isRead = true,
  onClick,
}) => {
  const dateObj = new Date(announcement.postedAt)
  const formattedDate = dateObj.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })

  return (
    <Link
      to={`/announcements/${announcement.id}`}
      onClick={onClick}
      className={cn(
        'group flex items-start sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-card border transition-all duration-180 text-left',
        announcement.isImportant
          ? 'bg-status-warning-bg/20 border-l-4 border-l-status-warning border-border hover:border-status-warning/60'
          : 'bg-surface border-border hover:border-primary-600/40',
        !isRead && 'bg-accent-100/30 font-medium'
      )}
    >
      <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
        {/* Unread indicator dot */}
        <div className="pt-1.5 sm:pt-0 shrink-0">
          {!isRead ? (
            <span
              className="block w-2.5 h-2.5 rounded-full bg-primary-600 shadow-sm"
              title="Unread announcement"
              aria-label="Unread announcement"
            />
          ) : (
            <span className="block w-2.5 h-2.5 rounded-full bg-transparent" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <Badge variant="default" size="sm">
              {announcement.category.toUpperCase()}
            </Badge>

            {announcement.isImportant && (
              <Badge variant="warning" size="sm" icon={<AlertTriangle className="w-3 h-3" />}>
                Important
              </Badge>
            )}

            {announcement.attachmentName && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-text-muted">
                <FileText className="w-3 h-3" aria-hidden="true" />
                <span>PDF attached</span>
              </span>
            )}

            <span className="text-[11px] text-text-muted ml-auto sm:ml-0">
              {formattedDate}
            </span>
          </div>

          <h3
            className={cn(
              'text-small truncate leading-snug group-hover:text-primary-600 transition-colors',
              !isRead ? 'font-semibold text-text-primary' : 'text-text-secondary'
            )}
            title={announcement.title}
          >
            {announcement.title}
          </h3>
        </div>
      </div>

      <ChevronRight
        className="w-4 h-4 text-text-muted group-hover:text-primary-600 transition-colors shrink-0 mt-1 sm:mt-0"
        aria-hidden="true"
      />
    </Link>
  )
}
