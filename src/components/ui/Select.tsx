import React from 'react'
import { ChevronDown, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: SelectOption[]
  error?: string
  hint?: string
  placeholder?: string
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, id, label, options, error, hint, placeholder, disabled, required, ...props }, ref) => {
    const generatedId = React.useId()
    const selectId = id || generatedId
    const errorId = `${selectId}-error`
    const hintId = `${selectId}-hint`

    return (
      <div className="w-full flex flex-col gap-1.5 text-left">
        {label && (
          <label
            htmlFor={selectId}
            className="text-small font-medium text-text-primary flex items-center gap-1 select-none"
          >
            {label}
            {required && <span className="text-status-error" aria-hidden="true">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            required={required}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : hint ? hintId : undefined}
            className={cn(
              'w-full min-h-[44px] appearance-none px-3.5 py-2.5 rounded-input bg-surface text-body text-text-primary border transition-colors duration-180 pr-10',
              'focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-primary-600',
              'disabled:bg-canvas disabled:text-text-muted disabled:cursor-not-allowed',
              error
                ? 'border-status-error text-text-primary focus:ring-status-error focus:border-status-error'
                : 'border-border hover:border-text-muted/60',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <div className="absolute right-3 pointer-events-none text-text-muted shrink-0" aria-hidden="true">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {error && (
          <p id={errorId} className="text-caption text-status-error flex items-center gap-1 mt-0.5" role="alert">
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

Select.displayName = 'Select'
