import React from 'react'
import { cn } from '@/lib/utils'

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'info'
  | 'neutral'

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  size?: 'sm' | 'md'
  icon?: React.ReactNode
  dot?: boolean
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  icon,
  dot = false,
  className,
  children,
  ...props
}) => {
  const variantStyles: Record<BadgeVariant, string> = {
    default: 'bg-canvas text-text-secondary border-border',
    primary: 'bg-accent-100 text-primary-700 border-primary-600/30',
    success: 'bg-status-success-bg text-status-success border-status-success/30',
    warning: 'bg-status-warning-bg text-status-warning border-status-warning/30',
    error: 'bg-status-error-bg text-status-error border-status-error/30',
    info: 'bg-status-info-bg text-status-info border-status-info/30',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
  }

  const dotColors: Record<BadgeVariant, string> = {
    default: 'bg-text-muted',
    primary: 'bg-primary-600',
    success: 'bg-status-success',
    warning: 'bg-status-warning',
    error: 'bg-status-error',
    info: 'bg-status-info',
    neutral: 'bg-slate-500',
  }

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 leading-tight',
    md: 'text-caption px-2.5 py-1 gap-1.5 leading-none',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full border select-none',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn('w-1.5 h-1.5 rounded-full shrink-0', dotColors[variant])}
          aria-hidden="true"
        />
      )}
      {icon && <span className="shrink-0" aria-hidden="true">{icon}</span>}
      <span>{children}</span>
    </span>
  )
}
