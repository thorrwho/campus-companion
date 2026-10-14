import React from 'react'
import { cn } from '@/lib/utils'

export interface TextFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  helperText?: string
  error?: string
  required?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      id,
      label,
      helperText,
      error,
      required,
      leftIcon,
      rightIcon,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId()
    const inputId = id || generatedId
    const errorId = `${inputId}-error`
    const helperId = `${inputId}-helper`

    const isInvalid = Boolean(error)

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-caption font-medium text-text-primary"
          >
            {label}
            {required && <span className="text-status-error ml-1">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-text-muted">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={isInvalid}
            aria-describedby={
              error ? errorId : helperText ? helperId : undefined
            }
            className={cn(
              'w-full min-h-[42px] px-3.5 py-2 text-body rounded-card border bg-surface text-text-primary placeholder:text-text-muted',
              'transition-all duration-180 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent',
              'disabled:bg-canvas disabled:text-text-muted disabled:cursor-not-allowed',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              isInvalid
                ? 'border-status-error focus:ring-status-error'
                : 'border-border hover:border-slate-400 dark:hover:border-slate-600',
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 flex items-center pointer-events-none text-text-muted">
              {rightIcon}
            </div>
          )}
        </div>

        {error && (
          <p id={errorId} className="text-caption text-status-error font-medium">
            {error}
          </p>
        )}

        {!error && helperText && (
          <p id={helperId} className="text-caption text-text-muted">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

TextField.displayName = 'TextField'
