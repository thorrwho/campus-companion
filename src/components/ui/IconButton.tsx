import React from 'react'
import { cn } from '@/lib/utils'

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  'aria-label': string // strictly required for accessibility
  icon: React.ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      'aria-label': ariaLabel,
      icon,
      variant = 'ghost',
      size = 'md',
      className,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const sizeStyles = {
      sm: 'w-8 h-8 text-caption rounded-button',
      md: 'w-11 h-11 text-body rounded-button', // 44px tap target
      lg: 'w-12 h-12 text-h3 rounded-button',
    }

    const variantStyles = {
      primary: 'bg-primary-600 hover:bg-primary-500 text-white shadow-card',
      secondary: 'bg-surface hover:bg-canvas text-text-primary border border-border shadow-card',
      outline: 'bg-transparent hover:bg-canvas text-text-primary border border-border',
      ghost: 'bg-transparent hover:bg-canvas text-text-secondary hover:text-text-primary',
      danger: 'bg-status-error hover:bg-red-700 text-white shadow-card',
    }

    return (
      <button
        ref={ref}
        type={type}
        aria-label={ariaLabel}
        disabled={disabled}
        className={cn(
          'inline-flex items-center justify-center transition-colors duration-180 select-none shrink-0',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          sizeStyles[size],
          variantStyles[variant],
          className
        )}
        {...props}
      >
        <span className="shrink-0 flex items-center justify-center" aria-hidden="true">
          {icon}
        </span>
      </button>
    )
  }
)

IconButton.displayName = 'IconButton'
