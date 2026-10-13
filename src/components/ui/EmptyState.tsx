import React from 'react'
import { Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
  className?: string
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        'w-full p-8 sm:p-12 rounded-card bg-surface border border-border text-center flex flex-col items-center justify-center my-4',
        className
      )}
    >
      <div className="w-14 h-14 rounded-modal bg-accent-100/70 text-primary-600 flex items-center justify-center mb-4 shrink-0 shadow-card">
        {icon || <Inbox className="w-7 h-7" aria-hidden="true" />}
      </div>

      <h3 className="text-h3 font-semibold text-text-primary mb-1.5">{title}</h3>
      <p className="text-small text-text-secondary max-w-sm mb-6 leading-normal">
        {description}
      </p>

      {action && <div className="flex items-center gap-3">{action}</div>}
    </div>
  )
}
