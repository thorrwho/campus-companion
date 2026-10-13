import React from 'react'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: React.ReactNode
  error?: string
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, id, label, error, checked, disabled, required, onChange, ...props }, ref) => {
    const generatedId = React.useId()
    const checkboxId = id || generatedId
    const errorId = `${checkboxId}-error`

    return (
      <div className="flex flex-col gap-1">
        <label
          htmlFor={checkboxId}
          className={cn(
            'inline-flex items-start gap-2.5 cursor-pointer select-none text-body text-text-primary',
            disabled && 'opacity-60 cursor-not-allowed'
          )}
        >
          <div className="relative flex items-center justify-center mt-0.5">
            <input
              ref={ref}
              id={checkboxId}
              type="checkbox"
              checked={checked}
              disabled={disabled}
              required={required}
              onChange={onChange || (() => {})}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? errorId : undefined}
              className="sr-only peer"
              {...props}
            />
            <div
              className={cn(
                'w-5 h-5 rounded-[6px] border bg-surface flex items-center justify-center transition-colors duration-180',
                'border-border peer-focus-visible:ring-2 peer-focus-visible:ring-primary-600 peer-focus-visible:ring-offset-2',
                'peer-checked:bg-primary-600 peer-checked:border-primary-600',
                error && 'border-status-error peer-focus-visible:ring-status-error',
                className
              )}
            >
              <Check
                className={cn(
                  'w-3.5 h-3.5 text-white transition-opacity duration-150',
                  checked ? 'opacity-100' : 'opacity-0'
                )}
                strokeWidth={3}
                aria-hidden="true"
              />
            </div>
          </div>
          {label && <span className="text-small text-text-secondary leading-tight">{label}</span>}
        </label>

        {error && (
          <p id={errorId} className="text-caption text-status-error pl-7" role="alert">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Checkbox.displayName = 'Checkbox'
