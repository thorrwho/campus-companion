import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface FormSectionProps {
  title: string
  description?: string
  badge?: React.ReactNode
  action?: React.ReactNode
  collapsible?: boolean
  defaultExpanded?: boolean
  children: React.ReactNode
  className?: string
}

export const FormSection: React.FC<FormSectionProps> = ({
  title,
  description,
  badge,
  action,
  collapsible = false,
  defaultExpanded = true,
  children,
  className,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <section
      className={cn(
        'rounded-card border border-border bg-surface shadow-card overflow-hidden transition-all',
        className
      )}
    >
      <div
        className={cn(
          'p-4 sm:p-5 flex items-center justify-between gap-4',
          collapsible && 'cursor-pointer hover:bg-canvas/40 transition-colors',
          isExpanded && 'border-b border-border'
        )}
        onClick={() => {
          if (collapsible) setIsExpanded(!isExpanded)
        }}
      >
        <div className="space-y-1 flex-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h2 className="text-h3 font-semibold text-text-primary">
              {title}
            </h2>
            {badge}
          </div>
          {description && (
            <p className="text-caption text-text-secondary leading-relaxed">
              {description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {action && <div onClick={(e) => e.stopPropagation()}>{action}</div>}
          {collapsible && (
            <button
              type="button"
              aria-label={isExpanded ? 'Collapse section' : 'Expand section'}
              className="p-1 rounded text-text-muted hover:text-text-primary transition-transform"
            >
              <ChevronDown
                className={cn(
                  'w-5 h-5 transition-transform duration-200',
                  !isExpanded && '-rotate-90'
                )}
              />
            </button>
          )}
        </div>
      </div>

      {isExpanded && <div className="p-4 sm:p-5 space-y-4">{children}</div>}
    </section>
  )
}
