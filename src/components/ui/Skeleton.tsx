import React from 'react'
import { cn } from '@/lib/utils'

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'rectangular' | 'circular' | 'rounded'
}

export const Skeleton: React.FC<SkeletonProps> = ({
  variant = 'rounded',
  className,
  ...props
}) => {
  const variantStyles = {
    rectangular: 'rounded-none',
    circular: 'rounded-full',
    rounded: 'rounded-input',
  }

  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse bg-border/60',
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
}

export const SkeletonText: React.FC<{
  lines?: number
  className?: string
}> = ({ lines = 3, className }) => {
  return (
    <div className={cn('space-y-2.5 w-full', className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            'h-4',
            i === lines - 1 && lines > 1 ? 'w-3/5' : 'w-full'
          )}
        />
      ))}
    </div>
  )
}

export const SkeletonCard: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'p-5 rounded-card bg-surface border border-border space-y-4 shadow-card',
        className
      )}
    >
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" className="w-10 h-10 shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <SkeletonText lines={2} />
      <div className="pt-2 flex justify-between items-center">
        <Skeleton className="h-8 w-24 rounded-button" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  )
}
