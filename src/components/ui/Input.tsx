import React from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
  rightElement?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      id,
      label,
      error,
      hint,
      leftIcon,
      rightElement,
      disabled,
      required,
      type = 'text',
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId()
    const inputId = id || generatedId
    const errorId = `${inputId}-error`
    const hintId = `${inputId}-hint`

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="text-small font-medium text-text-primary flex items-center gap-1 select-none"
          >
            {label}
            {required && <span className="text-status-error" aria-hidden="true">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {leftIcon && (
            <div
              className="absolute left-3.5 flex items-center pointer-events-none text-text-muted shrink-0"
              aria-hidden="true"
            >
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={type}
            disabled={disabled}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={
              error ? errorId : hint ? hintId : undefined
            }
            className={cn(
              'w-full min-h-[44px] px-3.5 py-2.5 rounded-input bg-surface text-body text-text-primary border transition-colors duration-180 placeholder:text-text-muted',
              'focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600',
              'disabled:bg-canvas disabled:text-text-muted disabled:cursor-not-allowed',
              leftIcon ? 'pl-10' : 'pl-3.5',
              rightElement ? 'pr-11' : 'pr-3.5',
              error
                ? 'border-status-error text-text-primary focus:ring-status-error focus:border-status-error'
                : 'border-border hover:border-text-muted/60',
              className
            )}
            {...props}
          />

          {rightElement && (
            <div className="absolute right-2 flex items-center shrink-0">
              {rightElement}
            </div>
          )}
        </div>

        {error && (
          <p
            id={errorId}
            className="text-caption text-status-error flex items-center gap-1 mt-0.5"
            role="alert"
          >
            <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </p>
        )}

        {!error && hint && (
          <p id={hintId} className="text-caption text-text-muted mt-0.5">
            {hint}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
