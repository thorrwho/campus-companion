import React from 'react'
import { cn } from '@/lib/utils'
import { Spinner } from './Spinner'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-button transition-colors duration-180 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed select-none'

    const sizeStyles = {
      sm: 'text-caption min-h-[36px] px-3 py-1.5 gap-1.5',
      md: 'text-body min-h-[44px] px-4 py-2.5 gap-2',
      lg: 'text-h3 min-h-[48px] px-5 py-3 gap-2.5',
    }

    const variantStyles = {
      primary: 'bg-primary-600 hover:bg-primary-500 text-white shadow-card active:bg-primary-700',
      secondary:
        'bg-surface hover:bg-canvas text-text-primary border border-border shadow-card active:bg-accent-100',
      outline:
        'bg-transparent hover:bg-canvas text-text-primary border border-border active:bg-accent-100',
      ghost:
        'bg-transparent hover:bg-canvas text-text-secondary hover:text-text-primary active:bg-accent-100',
      danger:
        'bg-status-error hover:bg-red-700 text-white shadow-card active:bg-red-800',
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={cn(baseStyles, sizeStyles[size], variantStyles[variant], className)}
        {...props}
      >
        {isLoading ? (
          <>
            <Spinner size="sm" className={variant === 'primary' || variant === 'danger' ? 'text-white' : 'text-primary-600'} />
            <span>{children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="inline-flex shrink-0" aria-hidden="true">{leftIcon}</span>}
            <span>{children}</span>
            {rightIcon && <span className="inline-flex shrink-0" aria-hidden="true">{rightIcon}</span>}
          </>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'
