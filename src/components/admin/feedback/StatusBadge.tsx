import React from 'react'
import { cn } from '@/lib/utils'

export type AdminStatus =
  | 'Draft'
  | 'Published'
  | 'Scheduled'
  | 'Archived'
  | 'Open'
  | 'Closed'
  | 'Full'
  | 'Past'
  | 'Cancelled'
  | 'Active'
  | 'Suspended'
  | 'Pending'
  | 'Completed'
  | string

export interface StatusBadgeProps {
  status: AdminStatus
  size?: 'sm' | 'md'
  className?: string
  showDot?: boolean
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className,
  showDot = true,
}) => {
  const normalized = (status || '').toLowerCase().trim()

  const config: {
    bg: string
    text: string
    border: string
    dot: string
    label: string
  } = React.useMemo(() => {
    switch (normalized) {
      case 'published':
      case 'active':
      case 'open':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/40',
          text: 'text-emerald-700 dark:text-emerald-300',
          border: 'border-emerald-200 dark:border-emerald-800/60',
          dot: 'bg-emerald-500',
          label: status,
        }
      case 'draft':
        return {
          bg: 'bg-slate-100 dark:bg-slate-800',
          text: 'text-slate-700 dark:text-slate-300',
          border: 'border-slate-200 dark:border-slate-700',
          dot: 'bg-slate-400',
          label: status,
        }
      case 'scheduled':
      case 'completed':
        return {
          bg: 'bg-sky-50 dark:bg-sky-950/40',
          text: 'text-sky-700 dark:text-sky-300',
          border: 'border-sky-200 dark:border-sky-800/60',
          dot: 'bg-sky-500',
          label: status,
        }
      case 'archived':
      case 'past':
        return {
          bg: 'bg-zinc-100 dark:bg-zinc-800',
          text: 'text-zinc-600 dark:text-zinc-400',
          border: 'border-zinc-200 dark:border-zinc-700',
          dot: 'bg-zinc-400',
          label: status,
        }
      case 'closed':
      case 'cancelled':
      case 'suspended':
        return {
          bg: 'bg-rose-50 dark:bg-rose-950/40',
          text: 'text-rose-700 dark:text-rose-300',
          border: 'border-rose-200 dark:border-rose-800/60',
          dot: 'bg-rose-500',
          label: status,
        }
      case 'full':
      case 'pending':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/40',
          text: 'text-amber-700 dark:text-amber-300',
          border: 'border-amber-200 dark:border-amber-800/60',
          dot: 'bg-amber-500',
          label: status,
        }
      default:
        return {
          bg: 'bg-slate-100 dark:bg-slate-800',
          text: 'text-slate-700 dark:text-slate-300',
          border: 'border-slate-200 dark:border-slate-700',
          dot: 'bg-slate-400',
          label: status || 'Unknown',
        }
    }
  }, [normalized, status])

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border leading-tight select-none',
        config.bg,
        config.text,
        config.border,
        sizeClasses[size],
        className
      )}
    >
      {showDot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full shrink-0', config.dot)}
          aria-hidden="true"
        />
      )}
      <span>{config.label}</span>
    </span>
  )
}
