import React from 'react'
import { Link } from 'react-router-dom'
import { Users, CheckCircle, ArrowRight } from 'lucide-react'
import { Club } from '@/types'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'

interface ClubCardProps {
  club: Club
  isJoined?: boolean
  onToggleJoin?: (e: React.MouseEvent) => void
  className?: string
}

export const ClubCard: React.FC<ClubCardProps> = ({
  club,
  isJoined = false,
  onToggleJoin,
  className,
}) => {
  return (
    <Card hover padding="none" className={cn('overflow-hidden flex flex-col justify-between text-left', className)}>
      <div className="p-5 flex-1 flex flex-col">
        {/* Top: Category & Member count */}
        <div className="flex items-center justify-between gap-3 mb-3">
          <Badge variant="primary" size="sm">
            {club.category.toUpperCase()}
          </Badge>

          <span className="flex items-center gap-1.5 text-caption font-semibold text-text-muted">
            <Users className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{club.memberCount} members</span>
          </span>
        </div>

        {/* Club Name & Short Description */}
        <h3 className="text-h3 font-semibold text-text-primary hover:text-primary-600 transition-colors line-clamp-1 mb-1.5">
          <Link to={`/clubs/${club.id}`}>{club.name}</Link>
        </h3>

        <p className="text-small text-text-secondary line-clamp-2 mb-4 leading-normal flex-1">
          {club.shortDescription}
        </p>

        {/* Meeting Schedule Hint */}
        <div className="text-[11px] text-text-muted font-medium py-1.5 px-2.5 rounded bg-canvas border border-border/80 truncate mb-4">
          Schedule: {club.meetingSchedule}
        </div>

        {/* Actions Row */}
        <div className="pt-3 border-t border-border flex items-center justify-between gap-3 mt-auto">
          <Link
            to={`/clubs/${club.id}`}
            className="text-small font-semibold text-primary-600 hover:text-primary-500 inline-flex items-center gap-1"
          >
            <span>Overview</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </Link>

          {onToggleJoin && (
            <Button
              variant={isJoined ? 'outline' : 'primary'}
              size="sm"
              onClick={onToggleJoin}
              leftIcon={isJoined ? <CheckCircle className="w-3.5 h-3.5 text-status-success" /> : undefined}
            >
              {isJoined ? 'Joined' : 'Join Club'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
