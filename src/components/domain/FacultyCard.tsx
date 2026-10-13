import React from 'react'
import { Link } from 'react-router-dom'
import { Mail, Clock, ArrowRight } from 'lucide-react'
import { Faculty } from '@/types'
import { Card } from '@/components/ui/Card'
import { Avatar } from '@/components/ui/Avatar'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

interface FacultyCardProps {
  faculty: Faculty
  onCopyEmail?: (email: string, e: React.MouseEvent) => void
  className?: string
}

export const FacultyCard: React.FC<FacultyCardProps> = ({
  faculty,
  onCopyEmail,
  className,
}) => {
  return (
    <Card hover padding="none" className={cn('overflow-hidden flex flex-col justify-between text-left', className)}>
      <div className="p-5 flex-1 flex flex-col">
        {/* Top: Avatar & Department Badge */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <Avatar initials={faculty.initials} name={faculty.name} size="md" />
          <Badge variant="primary" size="sm">
            {faculty.departmentId}
          </Badge>
        </div>

        {/* Name and Designation */}
        <h3 className="text-h3 font-semibold text-text-primary hover:text-primary-600 transition-colors line-clamp-1 mb-1">
          <Link to={`/faculty/${faculty.id}`}>{faculty.name}</Link>
        </h3>

        <p className="text-small text-text-secondary font-medium line-clamp-1 mb-3">
          {faculty.designation}
        </p>

        {/* Subjects taught pills */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {faculty.subjects.slice(0, 2).map((sub) => (
            <span
              key={sub}
              className="text-[11px] px-2 py-0.5 rounded-full bg-canvas border border-border text-text-secondary truncate max-w-[200px]"
              title={sub}
            >
              {sub}
            </span>
          ))}
          {faculty.subjects.length > 2 && (
            <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-canvas border border-border text-text-muted">
              +{faculty.subjects.length - 2}
            </span>
          )}
        </div>

        {/* Office Hours */}
        <div className="text-[11px] text-text-muted flex items-center gap-1.5 mb-4 mt-auto">
          <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{faculty.officeHours}</span>
        </div>

        {/* Bottom Actions Row */}
        <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
          {onCopyEmail && (
            <button
              type="button"
              onClick={(e) => onCopyEmail(faculty.email, e)}
              className="text-caption font-medium text-text-muted hover:text-primary-600 transition-colors inline-flex items-center gap-1.5 p-1 rounded-button focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
              title="Copy official email"
              aria-label={`Copy email for ${faculty.name}`}
            >
              <Mail className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Copy Email</span>
            </button>
          )}

          <Link
            to={`/faculty/${faculty.id}`}
            className="text-small font-semibold text-primary-600 hover:text-primary-500 inline-flex items-center gap-1 ml-auto"
          >
            <span>Profile</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </Card>
  )
}
