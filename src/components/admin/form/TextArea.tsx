import React from 'react'
import { cn } from '@/lib/utils'

export interface TextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  helperText?: string
  error?: string
  required?: boolean
  showCharCount?: boolean
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      id,
      label,
      helperText,
      error,
      required,
      showCharCount = true,
      maxLength,
      value,
      className,
      disabled,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId()
    const inputId = id || generatedId
    const errorId = `${inputId}-error`
    const helperId = `${inputId}-helper`

    const isInvalid = Boolean(error)
    const currentLength = typeof value === 'string' ? value.length : 0

    return (
      <div className="w-full space-y-1.5 text-left">
        <div className="flex items-center justify-between">
          {label && (
            <label
              htmlFor={inputId}
              className="block text-caption font-medium text-text-primary"
            >
              {label}
              {required && <span className="text-status-error ml-1">*</span>}
            </label>
          )}

          {showCharCount && maxLength && (
            <span
              className={cn(
                'text-xs font-mono select-none',
                currentLength > maxLength
                  ? 'text-status-error font-medium'
                  : 'text-text-muted'
              )}
            >
              {currentLength} / {maxLength}
            </span>
          )}
        </div>

        <textarea
          ref={ref}
          id={inputId}
          rows={rows}
          value={value}
          maxLength={maxLength}
          disabled={disabled}
          aria-invalid={isInvalid}
          aria-describedby={
            error ? errorId : helperText ? helperId : undefined
          }
          className={cn(
            'w-full px-3.5 py-2.5 text-body rounded-card border bg-surface text-text-primary placeholder:text-text-muted',
            'transition-all duration-180 focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent',
            'disabled:bg-canvas disabled:text-text-muted disabled:cursor-not-allowed resize-y min-h-[96px]',
            isInvalid
              ? 'border-status-error focus:ring-status-error'
              : 'border-border hover:border-slate-400 dark:hover:border-slate-600',
            className
          )}
          {...props}
        />

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

TextArea.displayName = 'TextArea'
